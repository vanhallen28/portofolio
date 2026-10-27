import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { seed } from "@/lib/content/seed";
import { StoreError } from "@/lib/content/store";
import { SupabaseStore } from "@/lib/content/supabase-store";

/* A tiny in-memory stand-in for the PostgREST query builder: enough of from/select/eq/order/
   maybeSingle/upsert/update/delete to exercise SupabaseStore's mapping and error handling.
   `writable: false` behaves like RLS for a visitor: writes silently match no rows. */
type Row = Record<string, unknown>;
const PK: Record<string, string> = { site_settings: "id", sections: "key", lines: "key", projects: "id", case_studies: "project_slug" };

function fakeDb(opts: { writable?: boolean; failCode?: string } = {}) {
  const rows = structuredClone(contentToRows(seed));
  const tables: Record<string, Row[]> = {
    site_settings: [{ id: 1, data: rows.settings }],
    sections: rows.sections.map((r) => ({ ...r })),
    lines: rows.lines.map((r) => ({ ...r })),
    projects: rows.projects.map((r) => ({ ...r })),
    case_studies: rows.cases.map((r) => ({ ...r })),
  };
  const writable = opts.writable ?? true;
  const from = (table: string) => {
    let op: "select" | "upsert" | "update" | "delete" = "select";
    let payload: Row | Row[] | null = null;
    const filters: [string, unknown][] = [];
    let single = false;
    const match = (r: Row) => filters.every(([k, v]) => r[k] === v);
    const run = () => {
      if (opts.failCode && op !== "select") return { data: null, error: { code: opts.failCode, message: "boom" } };
      const t = tables[table];
      if (op === "select") {
        const data = t.filter(match).map((r) => structuredClone(r));
        return { data: single ? data[0] ?? null : data, error: null };
      }
      if (!writable) return { data: [], error: null };
      if (op === "upsert") {
        const list = Array.isArray(payload) ? payload : [payload!];
        for (const r of list) {
          const i = t.findIndex((x) => x[PK[table]] === r[PK[table]]);
          if (i >= 0) t[i] = { ...t[i], ...r };
          else t.push({ ...r });
        }
        return { data: list, error: null };
      }
      if (op === "update") {
        const hit = t.filter(match);
        for (const r of hit) Object.assign(r, payload);
        return { data: hit, error: null };
      }
      const hit = t.filter(match);
      tables[table] = t.filter((r) => !match(r));
      return { data: hit, error: null };
    };
    const b = {
      select: () => b,
      eq: (k: string, v: unknown) => { filters.push([k, v]); return b; },
      order: () => b,
      maybeSingle: () => { single = true; return b; },
      upsert: (v: Row | Row[]) => { op = "upsert"; payload = v; return b; },
      update: (v: Row) => { op = "update"; payload = v; return b; },
      delete: () => { op = "delete"; return b; },
      then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(run()).then(res, rej),
    };
    return b;
  };
  return { db: { from } as unknown as SupabaseClient, tables };
}

describe("SupabaseStore", () => {
  it("reads the seeded rows back into the same content", async () => {
    const { db } = fakeDb();
    const store = new SupabaseStore(db);
    const c = await store.read();
    expect(store.problems).toEqual([]);
    expect(c.settings).toEqual(seed.settings);
    expect(c.sections).toEqual(seed.sections);
    expect(c.projects.map((p) => p.slug)).toEqual(seed.projects.map((p) => p.slug));
    expect(c.caseStudies).toHaveLength(seed.caseStudies.length);
  });

  it("falls back per part when a row is invalid, and reports it", async () => {
    const { db, tables } = fakeDb();
    (tables.sections.find((r) => r.key === "hero")!.data as Row).title = 42;
    (tables.projects[0].data as Row).theme = { wall: "red" };
    const store = new SupabaseStore(db);
    const c = await store.read();
    expect(c.sections.hero).toEqual(seed.sections.hero);
    expect(c.projects).toHaveLength(seed.projects.length - 1);
    expect(store.problems.some((p) => p.startsWith("Bagian hero"))).toBe(true);
    expect(store.problems.some((p) => p.startsWith(`Proyek ${seed.projects[0].slug}`))).toBe(true);
  });

  it("writes a project and reads it back", async () => {
    const { db } = fakeDb();
    const store = new SupabaseStore(db);
    await store.saveProject({ ...seed.projects[0], name: "Baru" });
    expect((await store.read()).projects[0].name).toBe("Baru");
  });

  it("refuses invalid data before touching the database", async () => {
    const { db, tables } = fakeDb();
    const before = JSON.stringify(tables);
    await expect(new SupabaseStore(db).saveSettings({ ...seed.settings, whatsapp: "x" })).rejects.toBeInstanceOf(StoreError);
    expect(JSON.stringify(tables)).toBe(before);
  });

  it("a write that RLS filters out is an error, not a silent success", async () => {
    const { db } = fakeDb({ writable: false });
    await expect(new SupabaseStore(db).saveSection("hero", seed.sections.hero)).rejects.toThrow(/tidak tersimpan/);
  });

  it("turns database errors into readable messages", async () => {
    await expect(new SupabaseStore(fakeDb({ failCode: "23505" }).db).saveProject(seed.projects[0])).rejects.toThrow(/slug sudah dipakai/);
    await expect(new SupabaseStore(fakeDb({ failCode: "42501" }).db).saveLines(seed.lines)).rejects.toThrow(/bukan admin/);
  });
});
