import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { CaseStudySchema, LineSchema, ProjectSchema, SectionSchemas, SettingsSchema } from "./schema";
import { seed } from "./seed";
import { caseToRow, lineToRow, projectToRow, rowToCase, rowToLine, rowToProject, type CaseRow, type LineRow, type ProjectRow } from "./rows";
import { StoreError, type ContentStore } from "./store";
import { SECTION_KEYS } from "./constants";
import type { CaseStudy, Content, Line, Project, SectionKey, Sections, SiteSettings } from "./types";
import { parseOrThrow, zodIssues } from "./validate";

/** Turns a database error into a message the admin can act on. */
function fail(e: PostgrestError, what: string): never {
  if (e.code === "23505") throw new StoreError(`${what}: slug sudah dipakai proyek lain`);
  if (e.code === "23503") throw new StoreError(`${what}: proyek terkait tidak ditemukan`);
  if (e.code === "42501") throw new StoreError(`${what}: akun ini tidak punya izin menulis (bukan admin)`);
  throw new StoreError(`${what}: ${e.message}`, [], e.code);
}

/**
 * Supabase-backed store. With the anonymous client RLS returns published content only;
 * with the admin's cookie client it returns everything and allows writes.
 *
 * A row that fails validation never breaks the site: the section falls back to the built-in
 * seed (or the project is skipped) and the problem is recorded in `problems`.
 */
export class SupabaseStore implements ContentStore {
  problems: string[] = [];

  constructor(private readonly db: SupabaseClient) {}

  async read(): Promise<Content> {
    const [settings, sections, lines, projects, cases] = await Promise.all([
      this.db.from("site_settings").select("data").eq("id", 1).maybeSingle(),
      this.db.from("sections").select("key, data"),
      this.db.from("lines").select("key, sort, data"),
      this.db.from("projects").select("id, slug, sort, published, data").order("sort"),
      this.db.from("case_studies").select("project_slug, published, data"),
    ]);
    for (const r of [settings, sections, lines, projects, cases]) if (r.error) fail(r.error, "Membaca konten");

    this.problems = [];
    const note = (where: string, e: z.ZodError) => this.problems.push(...zodIssues(e).map((i) => `${where} → ${i}`));

    const s = SettingsSchema.safeParse(settings.data?.data);
    if (!s.success && settings.data) note("Pengaturan situs", s.error);
    if (!settings.data) this.problems.push("Pengaturan situs belum ada di database (jalankan supabase/seed.sql)");

    const sectionRows = new Map((sections.data ?? []).map((r) => [r.key as string, r.data as unknown]));
    const out = {} as Record<SectionKey, unknown>;
    for (const key of SECTION_KEYS) {
      const r = SectionSchemas[key].safeParse(sectionRows.get(key));
      if (r.success) out[key] = r.data;
      else {
        if (sectionRows.has(key)) note(`Bagian ${key}`, r.error);
        out[key] = seed.sections[key];
      }
    }

    const lineRows = new Map((lines.data as LineRow[] | null ?? []).map((r) => [r.key, r]));
    const lineList: Line[] = seed.lines.map((fallback) => {
      const row = lineRows.get(fallback.key);
      if (!row) return fallback;
      const r = LineSchema.safeParse(rowToLine(row));
      if (!r.success) note(`Jalur ${fallback.key}`, r.error);
      return r.success ? r.data : fallback;
    });

    const projectList: Project[] = [];
    for (const row of (projects.data as ProjectRow[] | null) ?? []) {
      const r = ProjectSchema.safeParse(rowToProject(row));
      if (r.success) projectList.push(r.data);
      else note(`Proyek ${row.slug}`, r.error);
    }

    const caseList: CaseStudy[] = [];
    for (const row of (cases.data as CaseRow[] | null) ?? []) {
      const r = CaseStudySchema.safeParse(rowToCase(row));
      if (r.success) caseList.push(r.data);
      else note(`Studi kasus ${row.project_slug}`, r.error);
    }

    if (this.problems.length) console.warn(`[konten] ${this.problems.length} masalah data:\n- ${this.problems.join("\n- ")}`);

    return {
      settings: s.success ? s.data : seed.settings,
      sections: out as Sections,
      lines: lineList,
      projects: projectList,
      caseStudies: caseList,
    };
  }

  /** RLS hides rows silently; an empty result after a write means the account may not write. */
  private expectRow(r: { error: PostgrestError | null; data: unknown[] | null }, what: string) {
    if (r.error) fail(r.error, what);
    if (!r.data?.length) throw new StoreError(`${what}: tidak tersimpan (sesi admin habis atau bukan admin)`);
  }

  async saveSettings(v: SiteSettings) {
    const data = parseOrThrow(SettingsSchema, v, "pengaturan");
    this.expectRow(await this.db.from("site_settings").upsert({ id: 1, data }).select("id"), "Menyimpan pengaturan");
  }

  async saveSection<K extends SectionKey>(key: K, v: Sections[K]) {
    const data = parseOrThrow(SectionSchemas[key] as unknown as z.ZodType<Sections[K]>, v, `bagian ${key}`);
    this.expectRow(await this.db.from("sections").upsert({ key, data }).select("key"), `Menyimpan bagian ${key}`);
  }

  async saveLines(v: Line[]) {
    const lines = parseOrThrow(z.array(LineSchema).length(4), v, "jalur");
    this.expectRow(await this.db.from("lines").upsert(lines.map(lineToRow)).select("key"), "Menyimpan jalur");
  }

  async saveProject(v: Project) {
    const p = parseOrThrow(ProjectSchema, v, "proyek");
    this.expectRow(await this.db.from("projects").upsert(projectToRow(p)).select("id"), "Menyimpan proyek");
  }

  async deleteProject(id: string) {
    this.expectRow(await this.db.from("projects").delete().eq("id", id).select("id"), "Menghapus proyek");
  }

  async reorderProjects(ids: string[]) {
    const results = await Promise.all(ids.map((id, i) => this.db.from("projects").update({ sort: i + 1 }).eq("id", id).select("id")));
    for (const r of results) this.expectRow(r, "Mengurutkan proyek");
  }

  async saveCaseStudy(v: CaseStudy) {
    const cs = parseOrThrow(CaseStudySchema, v, "studi kasus");
    this.expectRow(await this.db.from("case_studies").upsert(caseToRow(cs)).select("project_slug"), "Menyimpan studi kasus");
  }
}
