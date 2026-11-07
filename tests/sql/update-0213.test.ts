import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentBefore0212 } from "@/lib/content/ciri-before-0212";
import { RANUM_ID, RANUM_SLUG, TEXT_BEFORE_0213, contentBefore0213 } from "@/lib/content/ranum-before-0213";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ContentSchema, ProjectSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildSeedSql } from "@/lib/content/seed-sql";
import { buildUpdateSql0212, buildUpdateSql0213 } from "@/lib/content/update-sql";

/* A database running v0.2.12 has eleven rooms in the owner's own order. v0.2.13 must add Ranum after the last of them
   with its case study and its name in the client strip, change the eleven-works sentences only where they still read as
   shipped, and leave every other room, case study and line alone. */
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

/** The seed as v0.2.12 shipped it. */
const v0212 = (): Any => structuredClone(contentBefore0213(seed)) as unknown as Any;

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
async function fresh(content: Any) {
  const db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const r = contentToRows(ContentSchema.parse(content));
  await db.exec([
    `insert into public.site_settings (id, data) values (1, ${q(r.settings)});`,
    ...r.sections.map((x) => `insert into public.sections (key, data) values ('${x.key}', ${q(x.data)});`),
    ...r.lines.map((x) => `insert into public.lines (key, sort, data) values ('${x.key}', ${x.sort}, ${q(x.data)});`),
    ...r.projects.map((x) => `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(x.data)});`),
    ...r.cases.map((x) => `insert into public.case_studies (project_slug, published, data) values ('${x.project_slug}', ${x.published}, ${q(x.data)});`),
  ].join("\n"));
  return db;
}
const rows = async (db: PGlite, sql: string) => (await db.query<Any>(sql)).rows;
const projects = async (db: PGlite) =>
  (await rows(db, "select * from public.projects order by sort, id")).map((r) => ProjectSchema.parse({ ...r.data, id: r.id, slug: r.slug, sort: r.sort, published: r.published }));
const cases = async (db: PGlite) =>
  (await rows(db, "select * from public.case_studies order by project_slug")).map((r) => CaseStudySchema.parse({ ...r.data, projectSlug: r.project_slug, published: r.published }));
const section = async (db: PGlite, key: string) => (await rows(db, `select data from public.sections where key = '${key}'`))[0].data;
const settings = async (db: PGlite) => (await rows(db, "select data from public.site_settings where id = 1"))[0].data;
const ranum = seed.projects.find((p) => p.id === RANUM_ID)!;
const ranumCase = seed.caseStudies.find((c) => c.projectSlug === RANUM_SLUG)!;

describe("supabase/updates/v0.2.13.sql", () => {
  let db: PGlite;
  let before: { projects: Any[]; cases: Any[]; lines: Any[] };
  let hero: Any, works: Any, site: Any;
  beforeAll(async () => {
    const old = v0212();
    // the live database has the rooms in the owner's own order
    old.projects.find((p: Any) => p.slug === "rua").sort = 2;
    old.projects.find((p: Any) => p.slug === "invisual-hris").sort = 30;
    db = await fresh(old);
    before = { projects: await projects(db), cases: await cases(db), lines: await rows(db, "select * from public.lines order by key") };
    hero = await section(db, "hero"); works = await section(db, "works"); site = await settings(db);
    await db.exec(buildUpdateSql0213(seed));
    await db.exec(buildUpdateSql0213(seed)); // twice: must not add anything the second time
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.13.sql", "utf8")).toBe(buildUpdateSql0213(seed));
  });

  it("adds Ranum after the last room, exactly as the seed has it", async () => {
    const all = await projects(db);
    expect(all).toHaveLength(before.projects.length + 1);
    const got = all.find((p) => p.id === RANUM_ID)!;
    expect(got.sort).toBe(31); // the owner's last room sits at 30
    expect({ ...got, sort: 0 }).toEqual({ ...ranum, sort: 0 });
  });

  it("keeps every other room, case study and line, and the owner's order", async () => {
    const all = await projects(db), cs = await cases(db);
    for (const p of before.projects) expect(all.find((x) => x.id === p.id)).toEqual(p);
    for (const c of before.cases) expect(cs.find((x) => x.projectSlug === c.projectSlug)).toEqual(c);
    expect(await rows(db, "select * from public.lines order by key")).toEqual(before.lines);
  });

  it("adds its case study", async () => {
    expect((await cases(db)).find((c) => c.projectSlug === RANUM_SLUG)).toEqual(ranumCase);
  });

  it("puts the Ranum name at the end of the client strip, once", async () => {
    const items = (await section(db, "hero")).clients.items as Any[];
    expect(items.map((x) => x.projectSlug)).toEqual(seed.sections.hero.clients.items.map((x) => x.projectSlug));
    expect(items.at(-1)).toEqual({ name: "Ranum", font: "ranum", uppercase: false, projectSlug: RANUM_SLUG });
  });

  it("leaves every other field of the hero, works and settings as it was", async () => {
    const strip = (x: Any) => ({ ...x, lede: null, intro: null, seoDescription: null, clients: { ...x.clients, items: null } });
    expect(strip(await section(db, "hero"))).toEqual(strip(hero));
    expect(strip(await section(db, "works"))).toEqual(strip(works));
    expect(strip(await settings(db))).toEqual(strip(site));
  });

  it("changes the counts from eleven to twelve", async () => {
    expect((await section(db, "hero")).lede).toEqual(seed.sections.hero.lede);
    expect((await section(db, "works")).intro).toEqual(seed.sections.works.intro);
    expect((await settings(db)).seoDescription).toEqual(seed.settings.seoDescription);
    expect(seed.sections.works.intro.id).toMatch(/^Dua belas ruang/);
  });

  it("is recorded once", async () => {
    expect(await rows(db, "select version from public.content_updates where version = '0.2.13'")).toHaveLength(1);
  });
});

describe("v0.2.13 on a database the owner already changed", () => {
  const ranumClient = { name: "Ranum", font: "ranum", uppercase: false, projectSlug: RANUM_SLUG };
  it("skips the room, its name and the sentences when the address is already used by another project", async () => {
    const old = v0212();
    const mine = structuredClone(old.projects.find((p: Any) => p.slug === "rua"));
    Object.assign(mine, { id: "99999999-9999-4999-8999-999999999999", slug: RANUM_SLUG, sort: 30, name: "Proyek saya" });
    old.projects.push(mine);
    const db = await fresh(old);
    const strip = (await section(db, "hero")).clients.items;
    await db.exec(buildUpdateSql0213(seed));
    const all = await projects(db);
    expect(all.find((p) => p.id === RANUM_ID)).toBeUndefined();
    expect(all.find((p) => p.slug === RANUM_SLUG)!.name).toBe("Proyek saya");
    expect((await cases(db)).find((c) => c.projectSlug === RANUM_SLUG)).toBeUndefined();
    expect((await section(db, "hero")).clients.items).toEqual(strip);
    expect((await section(db, "hero")).lede).toEqual(TEXT_BEFORE_0213.lede);
    expect((await section(db, "works")).intro).toEqual(TEXT_BEFORE_0213.intro);
    expect((await settings(db)).seoDescription).toEqual(TEXT_BEFORE_0213.seo);
  });

  it("skips them too when Ranum's id is already used under another address", async () => {
    const old = v0212();
    const mine = structuredClone(old.projects.find((p: Any) => p.slug === "rua"));
    Object.assign(mine, { id: RANUM_ID, slug: "ranum-lama", sort: 30, name: "Ranum lama" });
    old.projects.push(mine);
    const db = await fresh(old);
    await db.exec(buildUpdateSql0213(seed));
    expect((await projects(db)).find((p) => p.id === RANUM_ID)!.slug).toBe("ranum-lama");
    expect((await cases(db)).find((c) => c.projectSlug === RANUM_SLUG)).toBeUndefined();
    expect((await section(db, "hero")).clients.items.some((x: Any) => x.projectSlug === RANUM_SLUG)).toBe(false);
    expect((await section(db, "works")).intro).toEqual(TEXT_BEFORE_0213.intro);
  });

  it("keeps a rewritten sentence and a full client strip, and still adds the room", async () => {
    const old = v0212();
    old.sections.hero.lede = { id: "Kalimat saya sendiri.", en: "My own sentence." };
    while (old.sections.hero.clients.items.length < 12) old.sections.hero.clients.items.push({ name: "Klien", font: "schibsted", uppercase: false, projectSlug: "" });
    const db = await fresh(old);
    const strip = (await section(db, "hero")).clients.items;
    await db.exec(buildUpdateSql0213(seed));
    expect((await projects(db)).find((p) => p.id === RANUM_ID)).toBeDefined();
    expect((await cases(db)).find((c) => c.projectSlug === RANUM_SLUG)).toEqual(ranumCase);
    expect((await section(db, "hero")).clients.items).toEqual(strip);
    expect((await section(db, "hero")).lede).toEqual({ id: "Kalimat saya sendiri.", en: "My own sentence." });
    expect((await section(db, "works")).intro).toEqual(seed.sections.works.intro);
  });

  it("does not add a second name when the owner already put Ranum in the client strip", async () => {
    const old = v0212();
    old.sections.hero.clients.items.splice(1, 0, ranumClient);
    const db = await fresh(old);
    await db.exec(buildUpdateSql0213(seed));
    expect((await projects(db)).find((p) => p.id === RANUM_ID)).toBeDefined();
    const items = (await section(db, "hero")).clients.items as Any[];
    expect(items.filter((x) => x.projectSlug === RANUM_SLUG)).toHaveLength(1);
    expect(items[1]).toEqual(ranumClient);
  });

  it("does not stop on a client strip that is not a list", async () => {
    const db = await fresh(v0212());
    await db.exec(`update public.sections set data = jsonb_set(data, '{clients,items}', 'null'::jsonb) where key = 'hero'`);
    await db.exec(buildUpdateSql0213(seed));
    expect((await projects(db)).find((p) => p.id === RANUM_ID)).toBeDefined();
    expect((await section(db, "hero")).clients.items).toBeNull();
    expect((await section(db, "works")).intro).toEqual(seed.sections.works.intro);
  });
});

describe("v0.2.12 then v0.2.13 on a database still at v0.2.11", () => {
  it("ends with the new Ciri, Ranum and the twelve-works sentences", async () => {
    const db = await fresh(contentBefore0212(contentBefore0213(seed)));
    await db.exec(buildUpdateSql0212(seed));
    await db.exec(buildUpdateSql0213(seed));
    const all = await projects(db);
    expect(all.map((p) => p.slug)).toEqual(seed.projects.map((p) => p.slug));
    for (const p of seed.projects) expect(all.find((x) => x.id === p.id)).toEqual(p);
    expect(await cases(db)).toEqual([...seed.caseStudies].sort((a, b) => (a.projectSlug < b.projectSlug ? -1 : 1)));
    expect((await section(db, "hero")).clients.items).toEqual(seed.sections.hero.clients.items);
    expect((await section(db, "hero")).lede).toEqual(seed.sections.hero.lede);
    expect(TEXT_BEFORE_0213.lede).not.toEqual(seed.sections.hero.lede);
  });
});

describe("a fresh database from seed.sql", () => {
  it("already has Ranum and counts v0.2.13 as done", async () => {
    const db = await PGlite.create();
    await db.exec(STUBS);
    await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
    await db.exec(buildSeedSql(seed));
    expect(await rows(db, "select version from public.content_updates where version = '0.2.13'")).toHaveLength(1);
    const before = await projects(db);
    await db.exec(buildUpdateSql0213(seed));
    expect(await projects(db)).toEqual(before);
    expect(before.find((p) => p.id === RANUM_ID)).toEqual(ranum);
  });
});
