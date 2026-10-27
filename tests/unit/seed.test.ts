import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { ContentSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { checkTheme } from "@/lib/contrast";

describe("seed content", () => {
  it("matches the schema", () => {
    const r = ContentSchema.safeParse(seed);
    if (!r.success) console.error(r.error.issues.slice(0, 5));
    expect(r.success).toBe(true);
  });
  it("has unique slugs and map slots", () => {
    const slugs = seed.projects.map((p) => p.slug);
    const slots = seed.projects.map((p) => p.mapSlot);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(slots).size).toBe(slots.length);
  });
  it("every case study points at a project, one per project", () => {
    const slugs = seed.caseStudies.map((c) => c.projectSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(seed.projects.some((p) => p.slug === s)).toBe(true);
  });
  it("every referenced local file exists", () => {
    const urls = JSON.stringify(seed).match(/"\/(?:media|preview)\/[^"]+"/g) ?? [];
    for (const u of urls) expect(existsSync(path.join("public", u.slice(1, -1))), u).toBe(true);
  });
  it("every room theme is readable", () => {
    for (const p of seed.projects) for (const row of checkTheme(p.theme)) expect(row.ok, `${p.slug} ${row.pair} ${row.ratio}`).toBe(true);
  });
  it("every case-study theme is readable", () => {
    for (const c of seed.caseStudies) if (c.theme) for (const row of checkTheme(c.theme)) expect(row.ok, `${c.projectSlug} ${row.pair} ${row.ratio}`).toBe(true);
  });
  it("never mentions AI or the network operator brand", () => {
    expect(JSON.stringify(seed)).not.toMatch(/indosat|hifi|\bAI\b|kecerdasan buatan|Gemini/i);
  });
});
