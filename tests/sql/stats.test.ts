import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { aggregateVisits, aggregateVitals } from "@/lib/stats/aggregate";
import type { Visit, Vital } from "@/lib/stats/types";

/* supabase/migrations/0002_stats.sql: visitors may only add rows, only admins read them, and the SQL
   summaries give exactly what the local file store computes in TypeScript. */
const STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;
const ADMIN = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
let db: PGlite;

async function as<T>(role: "anon" | "authenticated", sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub ?? ""]);
  await db.exec(`set role ${role}`);
  try { return await fn(); } finally { await db.exec(`reset role`); await db.query(`select set_config('request.jwt.claim.sub', '', false)`); }
}

/* a month of made-up traffic, with hits right at the WIB midnight edges */
function rand(seed: number) { return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648); }
const R = rand(42);
const pick = <T,>(a: readonly T[]) => a[Math.floor(R() * a.length)];
const visits: Visit[] = [];
const vitals: Vital[] = [];
const start = Date.parse("2026-10-01T00:00:00Z");
for (let i = 0; i < 900; i++) {
  const at = new Date(start + Math.floor(R() * 34 * 86400) * 1000).toISOString();
  visits.push({
    at, kind: pick(["view", "view", "view", "view", "wa", "preview"] as const), path: pick(["/", "/en", "/karya/rua", "/karya/vale", "/en/work/loma"]),
    lang: pick(["id", "en"] as const), source: pick(["direct", "google", "instagram", "behance", "internal", "aliyasyifaa.com"]),
    referrer: "", country: pick(["ID", "ID", "ID", "SG", "MY", "US", ""]), device: pick(["desktop", "phone", "tablet"] as const),
    visitor: pick(["a1", "b2", "c3", "d4", "e5", "f6", ""]).padEnd(16, "0").replace(/^0+$/, ""), project: pick(["", "rua", "vale"]),
  });
}
for (const at of ["2026-10-09T16:59:59.999Z", "2026-10-09T17:00:00.000Z", "2026-10-20T16:59:59.999Z", "2026-10-20T17:00:00.000Z"]) {
  visits.push({ at, kind: "view", path: "/", lang: "id", source: "direct", referrer: "", country: "ID", device: "phone", visitor: "ed9e0000000000aa", project: "" });
}
for (let i = 0; i < 400; i++) {
  const name = pick(["LCP", "INP", "CLS", "FCP", "TTFB"] as const);
  const value = name === "CLS" ? Math.round(R() * 400) / 1000 : Math.round(R() * 5000 * 10) / 10;
  vitals.push({ at: new Date(start + Math.floor(R() * 34 * 86400) * 1000).toISOString(), name, value, path: "/", device: pick(["desktop", "phone", "tablet"] as const) });
}
const q = (v: unknown) => (v === null ? "null" : `'${String(v).replace(/'/g, "''")}'`);

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const m = readFileSync("supabase/migrations/0002_stats.sql", "utf8");
  await db.exec(m);
  await db.exec(m); // safe to run twice
  await db.exec(`insert into auth.users (id) values ('${ADMIN}'), ('${USER}'); insert into public.admins (user_id) values ('${ADMIN}');`);
  await db.exec(visits.map((v) => `insert into public.visits (at, kind, path, lang, source, referrer, country, device, visitor, project) values (${[v.at, v.kind, v.path, v.lang, v.source, v.referrer, v.country, v.device, v.visitor, v.project].map(q).join(", ")});`).join("\n"));
  await db.exec(vitals.map((v) => `insert into public.vitals (at, name, value, path, device) values (${q(v.at)}, ${q(v.name)}, ${v.value}, ${q(v.path)}, ${q(v.device)});`).join("\n"));
});

const sqlStats = async (from: string, to: string) => (await db.query<{ s: unknown }>(`select public.visit_stats($1::date, $2::date) as s`, [from, to])).rows[0].s;
const sqlVitals = async (from: string, to: string) => (await db.query<{ s: unknown }>(`select public.vital_stats($1::date, $2::date) as s`, [from, to])).rows[0].s;

describe("visit_stats and vital_stats", () => {
  for (const [from, to] of [["2026-10-01", "2026-10-31"], ["2026-10-10", "2026-10-10"], ["2026-10-10", "2026-10-20"], ["2026-11-01", "2026-11-04"], ["2026-12-01", "2026-12-31"]] as const) {
    it(`match the TypeScript numbers for ${from} → ${to}`, async () => {
      expect(await sqlStats(from, to)).toEqual(aggregateVisits(visits, { from, to }));
      const got = (await sqlVitals(from, to)) as { p75: number }[];
      const want = aggregateVitals(vitals, { from, to });
      expect(got.map((g) => ({ ...g, p75: Math.round(g.p75 * 1e6) / 1e6 }))).toEqual(want.map((w) => ({ ...w, p75: Math.round(w.p75 * 1e6) / 1e6 })));
    });
  }
  it("counts a hit at 00:00 WIB in the new day", async () => {
    const day10 = (await sqlStats("2026-10-10", "2026-10-10")) as { days: { day: string }[] };
    expect(day10.days.map((d) => d.day)).toEqual(["2026-10-10"]);
  });
});

describe("access", () => {
  it("a visitor can add a row but not read any, and cannot use the summaries", async () => {
    await as("anon", null, async () => {
      await db.exec(`insert into public.visits (kind, path) values ('view', '/')`);
      await db.exec(`insert into public.vitals (name, value, path) values ('LCP', 1000, '/')`);
      await expect(db.query(`select * from public.visits`)).rejects.toThrow(/permission denied/);
      await expect(db.query(`select public.visit_stats('2026-10-01', '2026-10-31')`)).rejects.toThrow();
      await expect(db.exec(`update public.visits set path = '/x'`)).rejects.toThrow();
      await expect(db.exec(`delete from public.visits`)).rejects.toThrow();
    });
  });
  it("rejects rows that do not fit (so the public endpoint cannot be used to store anything else)", async () => {
    await as("anon", null, async () => {
      await expect(db.exec(`insert into public.visits (kind, path) values ('view', 'https://evil')`)).rejects.toThrow();
      await expect(db.exec(`insert into public.visits (kind, path, source) values ('view', '/', 'Robert''); drop')`)).rejects.toThrow();
      await expect(db.exec(`insert into public.visits (kind, path, country) values ('view', '/', 'Indonesia')`)).rejects.toThrow();
      await expect(db.exec(`insert into public.vitals (name, value, path) values ('LCP', -1, '/')`)).rejects.toThrow();
    });
  });
  it("a signed-in non-admin sees zeros; the admin sees everything", async () => {
    const user = (await as("authenticated", USER, () => db.query<{ s: { views: number } }>(`select public.visit_stats('2026-10-01', '2026-10-31') as s`))).rows[0].s;
    expect(user.views).toBe(0);
    const admin = (await as("authenticated", ADMIN, () => db.query<{ s: { views: number } }>(`select public.visit_stats('2026-10-01', '2026-10-31') as s`))).rows[0].s;
    expect(admin.views).toBe(aggregateVisits(visits, { from: "2026-10-01", to: "2026-10-31" }).views);
  });
});
