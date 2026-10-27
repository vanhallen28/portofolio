import { promises as fs } from "node:fs";
import path from "node:path";
import { ContentSchema, CaseStudySchema, LineSchema, ProjectSchema, SectionSchemas, SettingsSchema } from "./schema";
import { seed } from "./seed";
import { StoreError, type ContentStore } from "./store";
import type { Content, SectionKey, Sections } from "./types";
import { parseOrThrow as parse } from "./validate";
import { z } from "zod";

/** JSON-file store for development without Supabase. Writes are atomic (tmp + rename). */
export class LocalStore implements ContentStore {
  constructor(private readonly file = process.env.PORTO_DATA_FILE || path.join(process.cwd(), ".data", "content.json")) {}

  async read(): Promise<Content> {
    try {
      const raw = JSON.parse(await fs.readFile(this.file, "utf8"));
      return parse(ContentSchema, raw, "konten lokal");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") {
        await this.write(seed);
        return structuredClone(seed);
      }
      throw e;
    }
  }

  private async write(c: Content): Promise<void> {
    const valid = parse(ContentSchema, c, "konten");
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(valid, null, 1), "utf8");
    await fs.rename(tmp, this.file);
  }

  private async update(fn: (c: Content) => Content): Promise<void> {
    await this.write(fn(await this.read()));
  }

  async saveSettings(v: Content["settings"]) {
    const s = parse(SettingsSchema, v, "pengaturan");
    return this.update((c) => ({ ...c, settings: s }));
  }

  async saveSection<K extends SectionKey>(key: K, v: Sections[K]) {
    const s = parse(SectionSchemas[key] as unknown as z.ZodType<Sections[K]>, v, `bagian ${key}`);
    return this.update((c) => ({ ...c, sections: { ...c.sections, [key]: s } }));
  }

  async saveLines(v: Content["lines"]) {
    const lines = parse(z.array(LineSchema).length(4), v, "jalur");
    return this.update((c) => ({ ...c, lines }));
  }

  async saveProject(v: Content["projects"][number]) {
    const p = parse(ProjectSchema, v, "proyek");
    return this.update((c) => {
      const clash = c.projects.find((x) => x.slug === p.slug && x.id !== p.id);
      if (clash) throw new StoreError(`Slug "${p.slug}" sudah dipakai proyek ${clash.name}`);
      const before = c.projects.find((x) => x.id === p.id);
      const projects = before ? c.projects.map((x) => (x.id === p.id ? p : x)) : [...c.projects, p];
      const caseStudies = before && before.slug !== p.slug
        ? c.caseStudies.map((cs) => (cs.projectSlug === before.slug ? { ...cs, projectSlug: p.slug } : cs))
        : c.caseStudies;
      return { ...c, projects, caseStudies };
    });
  }

  async deleteProject(id: string) {
    return this.update((c) => {
      const p = c.projects.find((x) => x.id === id);
      return { ...c, projects: c.projects.filter((x) => x.id !== id), caseStudies: c.caseStudies.filter((cs) => cs.projectSlug !== p?.slug) };
    });
  }

  async reorderProjects(ids: string[]) {
    return this.update((c) => {
      const pos = new Map(ids.map((id, i) => [id, i + 1]));
      return { ...c, projects: c.projects.map((p) => ({ ...p, sort: pos.get(p.id) ?? p.sort })) };
    });
  }

  async saveCaseStudy(v: Content["caseStudies"][number]) {
    const cs = parse(CaseStudySchema, v, "studi kasus");
    return this.update((c) => {
      if (!c.projects.some((p) => p.slug === cs.projectSlug)) throw new StoreError(`Proyek "${cs.projectSlug}" tidak ditemukan`);
      const exists = c.caseStudies.some((x) => x.projectSlug === cs.projectSlug);
      return { ...c, caseStudies: exists ? c.caseStudies.map((x) => (x.projectSlug === cs.projectSlug ? cs : x)) : [...c.caseStudies, cs] };
    });
  }
}
