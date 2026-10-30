import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ContentSchema, ProjectSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildUpdateSql027, buildUpdateSql028, TEXT_BEFORE_027, TEXT_BEFORE_028 } from "@/lib/content/update-sql";

/* A database running v0.2.7 has ten rooms and three sentences that count them. The v0.2.8 update must add RUA
   with its case study, put its wordmark at the end of the client strip, change the counts while they still read
   as shipped, and leave anything the owner already changed alone. */
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
const NEW = "rua";

/** The seed as v0.2.7 shipped it: ten rooms, ten in every count. */
function v027(): Any {
  const old = structuredClone(seed) as unknown as Any;
  old.projects = old.projects.filter((p: Any) => p.slug !== NEW);
  old.caseStudies = old.caseStudies.filter((c: Any) => c.projectSlug !== NEW);
  old.sections.hero.clients.items = old.sections.hero.clients.items.filter((it: Any) => it.projectSlug !== NEW);
  old.sections.hero.lede = TEXT_BEFORE_028.lede;
  old.sections.works.intro = TEXT_BEFORE_028.intro;
  old.settings.seoDescription = TEXT_BEFORE_028.seo;
  return old;
}

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
async function fresh(content: Any) {
  const db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const r = contentToRows(ContentSchema.parse(content));
  await db.exec([
    `insert into public.site_settings (id, data) values (1, ${q(r.settings)});`,
    ...r.sections.map((x) => `insert into public.sections (key, data) values ('${x.key}', ${q(x.data)});`),
    ...r.projects.map((x) => `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(x.data)});`),
    ...r.cases.map((x) => `insert into public.case_studies (project_slug, published, data) values ('${x.project_slug}', ${x.published}, ${q(x.data)});`),
  ].join("\n"));
  return db;
}
const section = async (db: PGlite, key: string) => (await db.query<Any>(`select data from public.sections where key = '${key}'`)).rows[0].data;
const settings = async (db: PGlite) => (await db.query<Any>("select data from public.site_settings where id = 1")).rows[0].data;
const projects = async (db: PGlite) =>
  (await db.query<Any>("select * from public.projects order by sort")).rows.map((r) => ProjectSchema.parse({ ...r.data, id: r.id, slug: r.slug, sort: r.sort, published: r.published }));

describe("supabase/updates/v0.2.8.sql", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await fresh(v027());
    await db.exec(buildUpdateSql028(seed));
    await db.exec(buildUpdateSql028(seed)); // twice: must not duplicate anything
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.8.sql", "utf8")).toBe(buildUpdateSql028(seed));
  });

  it("adds RUA after the last room, exactly as in the seed", async () => {
    const all = await projects(db);
    expect(all.map((p) => p.slug).at(-1)).toBe(NEW);
    const got = all.find((p) => p.slug === NEW)!;
    const want = seed.projects.find((p) => p.slug === NEW)!;
    expect({ ...got, sort: 0 }).toEqual({ ...want, sort: 0 });
    expect(all).toHaveLength(11);
  });

  it("adds its case study", async () => {
    const r = (await db.query<Any>(`select * from public.case_studies where project_slug = '${NEW}'`)).rows;
    expect(r).toHaveLength(1);
    const got = CaseStudySchema.parse({ ...r[0].data, projectSlug: r[0].project_slug, published: r[0].published });
    expect(got).toEqual(seed.caseStudies.find((c) => c.projectSlug === NEW));
  });

  it("puts the RUA wordmark at the end of the client strip, once", async () => {
    const items = (await section(db, "hero")).clients.items;
    expect(items.map((it: Any) => it.projectSlug)).toEqual(seed.sections.hero.clients.items.map((it) => it.projectSlug));
  });

  it("changes the counts from ten to eleven", async () => {
    expect((await section(db, "hero")).lede).toEqual(seed.sections.hero.lede);
    expect((await section(db, "works")).intro).toEqual(seed.sections.works.intro);
    expect((await settings(db)).seoDescription).toEqual(seed.settings.seoDescription);
  });

  it("is recorded once", async () => {
    expect((await db.query<Any>("select version from public.content_updates where version = '0.2.8'")).rows).toHaveLength(1);
  });
});

describe("v0.2.8 on a database the owner already changed", () => {
  it("keeps a rewritten sentence, a full client strip and an address already in use", async () => {
    const edited = v027();
    edited.sections.works.intro = { id: "Kalimat saya sendiri.", en: "My own sentence." };
    edited.sections.hero.clients.items = Array.from({ length: 12 }, (_, i) => ({ name: `Klien ${i}`, font: "schibsted", uppercase: false, projectSlug: "" }));
    const mine = structuredClone(edited.projects[0]);
    mine.id = "22222222-2222-4222-8222-222222222222"; mine.slug = NEW; mine.name = "Proyek saya"; mine.mapSlot = 1;
    edited.projects.push(mine);
    const db = await fresh(edited);
    await db.exec(buildUpdateSql028(seed));
    expect((await section(db, "works")).intro).toEqual({ id: "Kalimat saya sendiri.", en: "My own sentence." });
    expect((await section(db, "hero")).lede).toEqual(seed.sections.hero.lede);
    expect((await section(db, "hero")).clients.items).toHaveLength(12);
    const all = await projects(db);
    expect(all.filter((p) => p.slug === NEW).map((p) => p.name)).toEqual(["Proyek saya"]);
    // the owner's own project kept its case study slot: no RUA case study was attached to it
    expect((await db.query<Any>(`select 1 from public.case_studies where project_slug = '${NEW}'`)).rows).toHaveLength(0);
  });
});

describe("v0.2.7 then v0.2.8 on a database still at v0.2.6", () => {
  it("ends with eleven rooms and the eleven-room sentences", async () => {
    const old = v027();
    old.projects = old.projects.filter((p: Any) => !["vale", "loma"].includes(p.slug));
    old.caseStudies = old.caseStudies.filter((c: Any) => !["vale", "loma"].includes(c.projectSlug));
    old.sections.hero.clients.items = old.sections.hero.clients.items.filter((it: Any) => !["vale", "loma"].includes(it.projectSlug));
    old.sections.hero.lede = TEXT_BEFORE_027.lede;
    old.sections.works.intro = TEXT_BEFORE_027.intro;
    old.settings.seoDescription = TEXT_BEFORE_027.seo;
    const db = await fresh(old);
    await db.exec(buildUpdateSql027(seed));
    await db.exec(buildUpdateSql028(seed));
    expect((await projects(db)).map((p) => p.slug).slice(-3)).toEqual(["vale", "loma", "rua"]);
    expect((await section(db, "hero")).lede).toEqual(seed.sections.hero.lede);
    expect((await section(db, "works")).intro).toEqual(seed.sections.works.intro);
    expect((await settings(db)).seoDescription).toEqual(seed.settings.seoDescription);
    expect((await section(db, "hero")).clients.items.map((it: Any) => it.projectSlug)).toEqual(seed.sections.hero.clients.items.map((it) => it.projectSlug));
  });
});
