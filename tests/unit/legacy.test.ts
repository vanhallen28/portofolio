import { describe, expect, it } from "vitest";
import { ContentSchema, ProjectSchema, SectionSchemas, SettingsSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";

/* Content saved by v0.1.x (before the v0.2.0 fields existed) must still load, with the new
   fields filled by their defaults. Otherwise the site would fall back to the seed after an update. */
function strip<T extends object>(o: T, keys: string[]): T {
  const c = structuredClone(o) as Record<string, unknown>;
  for (const k of keys) delete c[k];
  return c as T;
}

describe("data from v0.1.x", () => {
  it("settings without stickyCta / cv", () => {
    const r = SettingsSchema.parse(strip(seed.settings, ["stickyCta", "cv"]));
    expect(r.stickyCta.show).toBe(true);
    expect(r.cv.url).toBe("");
  });

  it("hero, services, process and about without the new fields", () => {
    expect(SectionSchemas.hero.parse(strip(seed.sections.hero, ["clients"])).clients.items).toEqual([]);
    const svc = structuredClone(seed.sections.services);
    for (const i of svc.items) delete (i as Partial<typeof i>).price;
    expect(SectionSchemas.services.parse(svc).items[0].price).toEqual({ id: "", en: "" });
    const proc = structuredClone(seed.sections.process);
    for (const s of proc.steps) delete (s as Partial<typeof s>).duration;
    expect(SectionSchemas.process.parse(proc).steps[0].duration).toEqual({ id: "", en: "" });
    expect(SectionSchemas.about.parse(strip(seed.sections.about, ["experience", "experienceTitle"])).experience).toEqual([]);
  });

  it("projects without result", () => {
    expect(ProjectSchema.parse(strip(seed.projects[0], ["result"])).result).toBeNull();
  });

  it("a whole v0.1.x content file", () => {
    const old = structuredClone(seed) as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    delete old.settings.stickyCta;
    delete old.settings.cv;
    delete old.sections.hero.clients;
    delete old.sections.about.experience;
    for (const p of old.projects) delete p.result;
    expect(ContentSchema.safeParse(old).success).toBe(true);
  });
});
