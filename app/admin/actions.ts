"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { newCaseStudy, newProject } from "@/lib/admin/defaults";
import { CONTENT_TAG, getStore } from "@/lib/content/get";
import { StoreError, type ContentStore } from "@/lib/content/store";
import type { CaseStudy, Line, Project, SectionKey, Sections, SiteSettings } from "@/lib/content/types";

export type ActionResult = { ok: true } | { ok: false; error: string; issues?: string[] };

/** Every save: admin check → validated write → clear the public cache so the change is live. */
async function save(fn: (s: ContentStore) => Promise<void>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await fn(await getStore());
  } catch (e) {
    if (e instanceof StoreError) return { ok: false, error: e.message, issues: e.issues };
    console.error("[admin] gagal menyimpan", e);
    return { ok: false, error: "Gagal menyimpan. Coba lagi; bila terus terjadi, jalankan npm run doctor." };
  }
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveSettingsAction(v: SiteSettings) {
  return save((s) => s.saveSettings(v));
}

export async function saveSectionAction<K extends SectionKey>(key: K, v: Sections[K]) {
  return save((s) => s.saveSection(key, v));
}

export async function saveLinesAction(v: Line[]) {
  return save((s) => s.saveLines(v));
}

export async function saveProjectAction(v: Project) {
  return save(async (s) => {
    const before = (await s.read()).projects.find((p) => p.id === v.id);
    await s.saveProject(v);
    if (before && before.slug !== v.slug) await renameSlugReferences(s, before.slug, v.slug);
  });
}

/** Services ("Contoh:" links) and testimonials point at projects by slug; keep them pointing after a rename. */
async function renameSlugReferences(s: ContentStore, from: string, to: string) {
  const { sections } = await s.read();
  const services = sections.services.items.some((i) => i.proof.includes(from));
  const testimonials = sections.testimonials.items.some((i) => i.projectSlug === from);
  if (services) {
    await s.saveSection("services", { ...sections.services, items: sections.services.items.map((i) => ({ ...i, proof: i.proof.map((x) => (x === from ? to : x)) })) });
  }
  if (testimonials) {
    await s.saveSection("testimonials", { ...sections.testimonials, items: sections.testimonials.items.map((i) => (i.projectSlug === from ? { ...i, projectSlug: to } : i)) });
  }
}

export async function setPublishedAction(id: string, published: boolean) {
  return save(async (s) => {
    const p = (await s.read()).projects.find((x) => x.id === id);
    if (!p) throw new StoreError("Proyek tidak ditemukan");
    await s.saveProject({ ...p, published });
  });
}

export async function reorderProjectsAction(ids: string[]) {
  return save((s) => s.reorderProjects(ids));
}

export async function deleteProjectAction(id: string) {
  return save((s) => s.deleteProject(id));
}

export async function saveCaseStudyAction(v: CaseStudy) {
  return save((s) => s.saveCaseStudy(v));
}

/** Creates a hidden draft project and opens its editor. */
export async function createProjectAction(): Promise<ActionResult> {
  await requireAdmin();
  const store = await getStore();
  const c = await store.read();
  const p = newProject(randomUUID(), c.projects);
  const r = await save((s) => s.saveProject(p));
  if (!r.ok) return r;
  redirect(`/admin/projects/${p.id}`);
}

export async function createCaseStudyAction(projectId: string): Promise<ActionResult> {
  await requireAdmin();
  const c = await (await getStore()).read();
  const p = c.projects.find((x) => x.id === projectId);
  if (!p) return { ok: false, error: "Proyek tidak ditemukan" };
  if (c.caseStudies.some((cs) => cs.projectSlug === p.slug)) redirect(`/admin/projects/${p.id}/case`);
  const r = await save((s) => s.saveCaseStudy(newCaseStudy(p)));
  if (!r.ok) return r;
  redirect(`/admin/projects/${p.id}/case`);
}
