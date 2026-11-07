import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import { CASE_LINES_LABEL_BEFORE_0214, LINE_NAMES_BEFORE_0214, contentBefore0214 } from "@/lib/content/lines-before-0214";
import { contentToRows } from "@/lib/content/rows";
import { ContentSchema, LineSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildSeedSql } from "@/lib/content/seed-sql";
import { buildUpdateSql0214 } from "@/lib/content/update-sql";

/* A database running v0.2.13 still names its lines Ditemukan, Menjual, Melayani and Mengelola, has no scope on them,
   and labels them "Jalur" on the case-study page. v0.2.14 must bring the names and the label still as shipped to the
   professional ones, add a scope where none exists, and keep everything the owner changed, the colours and the order. */
const STUBS = `
  create role anon nologin; create role authenticated nologin;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;
type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
/** A v0.2.13 database: its line rows carry no scope (the key did not exist then) unless a test writes one in. */
async function v0213(edit: (c: Any) => void = () => {}) {
  const old = structuredClone(contentBefore0214(seed)) as unknown as Any;
  edit(old);
  const db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const r = contentToRows(ContentSchema.parse(old));
  await db.exec([
    `insert into public.site_settings (id, data) values (1, ${q(r.settings)});`,
    ...r.sections.map((x) => `insert into public.sections (key, data) values ('${x.key}', ${q(x.data)});`),
    ...r.lines.map((x) => {
      const { desc, ...data } = x.data as Any;
      const blank = !desc.id && !desc.en; // v0.2.13 had no scope; keep only one the test wrote in
      return `insert into public.lines (key, sort, data) values ('${x.key}', ${x.sort}, ${q(blank ? data : x.data)});`;
    }),
    ...r.projects.map((x) => `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(x.data)});`),
    ...r.cases.map((x) => `insert into public.case_studies (project_slug, published, data) values ('${x.project_slug}', ${x.published}, ${q(x.data)});`),
  ].join("\n"));
  return db;
}
const rows = async (db: PGlite, sql: string) => (await db.query<Any>(sql)).rows;
const lines = async (db: PGlite) => (await rows(db, "select * from public.lines order by sort")).map((r) => LineSchema.parse({ ...r.data, key: r.key, sort: r.sort }));
const caseLabel = async (db: PGlite) => (await rows(db, "select data from public.sections where key = 'works'"))[0].data.caseLabels.lines;
const want = Object.fromEntries(seed.lines.map((l) => [l.key, l]));

describe("supabase/updates/v0.2.14.sql", () => {
  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.14.sql", "utf8")).toBe(buildUpdateSql0214(seed));
  });

  it("brings untouched lines and the label to the new names, and runs once", async () => {
    const db = await v0213();
    expect((await rows(db, "select data from public.lines where key = 'found'"))[0].data.desc).toBeUndefined();
    await db.exec(buildUpdateSql0214(seed));
    await db.exec(buildUpdateSql0214(seed));
    expect(await lines(db)).toEqual([...seed.lines].sort((a, b) => a.sort - b.sort));
    expect(await caseLabel(db)).toEqual(seed.sections.works.caseLabels.lines);
    expect(await rows(db, "select version from public.content_updates where version = '0.2.14'")).toHaveLength(1);
  });

  it("keeps a name, a scope, a colour and a label the owner changed", async () => {
    const db = await v0213((c) => {
      const serve = c.lines.find((l: Any) => l.key === "serve");
      serve.name = { id: "Layanan Klien", en: "Client Service" };
      serve.color = "#0E7A57";
      c.lines.find((l: Any) => l.key === "run").desc = { id: "Cakupan saya", en: "My scope" };
      c.sections.works.caseLabels.lines = { id: "Kategori", en: "Category" };
    });
    await db.exec(buildUpdateSql0214(seed));
    const got = Object.fromEntries((await lines(db)).map((l) => [l.key, l]));
    expect(got.serve.name).toEqual({ id: "Layanan Klien", en: "Client Service" });
    expect(got.serve.color).toBe("#0E7A57");
    expect(got.serve.desc).toEqual(want.serve.desc);
    expect(got.run.name).toEqual(want.run.name);
    expect(got.run.desc).toEqual({ id: "Cakupan saya", en: "My scope" });
    expect(got.found.name).toEqual(want.found.name);
    expect(got.sell.name).toEqual(want.sell.name);
    expect(await caseLabel(db)).toEqual({ id: "Kategori", en: "Category" });
  });

  it("starts from the names v0.2.13 shipped", () => {
    for (const l of contentBefore0214(seed).lines) expect(l.name).toEqual(LINE_NAMES_BEFORE_0214[l.key]);
    expect(contentBefore0214(seed).sections.works.caseLabels.lines).toEqual(CASE_LINES_LABEL_BEFORE_0214);
    for (const l of seed.lines) expect(l.name).not.toEqual(LINE_NAMES_BEFORE_0214[l.key]);
  });
});

describe("a fresh database from seed.sql", () => {
  it("already has the new names and scopes and counts v0.2.14 as done", async () => {
    const db = await PGlite.create();
    await db.exec(STUBS);
    await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
    await db.exec(buildSeedSql(seed));
    expect(await rows(db, "select version from public.content_updates where version = '0.2.14'")).toHaveLength(1);
    expect(await lines(db)).toEqual([...seed.lines].sort((a, b) => a.sort - b.sort));
    expect(await caseLabel(db)).toEqual(seed.sections.works.caseLabels.lines);
  });
});

describe("line names", () => {
  it("fit the admin limit and say what each line covers", () => {
    for (const l of seed.lines) {
      expect(l.name.id.length).toBeLessThanOrEqual(24);
      expect(l.name.en.length).toBeLessThanOrEqual(24);
      expect(l.desc.id).not.toBe("");
      expect(l.desc.en).not.toBe("");
    }
  });
});
