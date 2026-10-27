import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { LocalStore } from "@/lib/content/local-store";
import { publicView, StoreError } from "@/lib/content/store";
import { seed } from "@/lib/content/seed";

let file: string;
let store: LocalStore;
beforeEach(() => {
  file = path.join(mkdtempSync(path.join(tmpdir(), "porto-")), "content.json");
  store = new LocalStore(file);
});

describe("LocalStore", () => {
  it("starts from the seed", async () => {
    const c = await store.read();
    expect(c.projects).toHaveLength(seed.projects.length);
    expect(c.settings.name).toBe("Virgiawan Listanto");
  });

  it("saves a project change", async () => {
    const c = await store.read();
    await store.saveProject({ ...c.projects[0], name: "Aliya Syifaa Baru" });
    expect((await store.read()).projects[0].name).toBe("Aliya Syifaa Baru");
  });

  it("renaming a slug moves its case study", async () => {
    const c = await store.read();
    await store.saveProject({ ...c.projects[0], slug: "aliya" });
    const after = await store.read();
    expect(after.caseStudies.some((cs) => cs.projectSlug === "aliya")).toBe(true);
  });

  it("rejects a duplicate slug", async () => {
    const c = await store.read();
    await expect(store.saveProject({ ...c.projects[1], slug: c.projects[0].slug })).rejects.toBeInstanceOf(StoreError);
  });

  it("reorders projects", async () => {
    const c = await store.read();
    const ids = c.projects.map((p) => p.id).reverse();
    await store.reorderProjects(ids);
    const after = publicView(await store.read());
    expect(after.projects.map((p) => p.id)).toEqual(ids);
  });

  it("rejects invalid data and leaves the file untouched", async () => {
    await store.read();
    const before = readFileSync(file, "utf8");
    const c = await store.read();
    await expect(store.saveSettings({ ...c.settings, whatsapp: "+62 813" })).rejects.toBeInstanceOf(StoreError);
    expect(readFileSync(file, "utf8")).toBe(before);
  });

  it("publicView hides drafts and their case studies", async () => {
    const c = await store.read();
    await store.saveProject({ ...c.projects[0], published: false });
    const v = publicView(await store.read());
    expect(v.projects.some((p) => p.slug === c.projects[0].slug)).toBe(false);
    expect(v.caseStudies.some((cs) => cs.projectSlug === c.projects[0].slug)).toBe(false);
  });

  it("refuses a corrupted file instead of overwriting it", async () => {
    writeFileSync(file, "{ not json");
    await expect(store.read()).rejects.toThrow();
  });
});
