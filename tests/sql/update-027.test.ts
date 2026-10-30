import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ContentSchema, ProjectSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildUpdateSql027, TEXT_BEFORE_027, TEXT_BEFORE_028 } from "@/lib/content/update-sql";
import { projectBefore029 } from "@/lib/content/visuals-before-029";

/* A database running v0.2.6 has eight rooms and three sentences that count them. The v0.2.7 update must add
   VALE and Loma with their case studies, put their wordmarks in the client strip, change the counts while they
   still read as shipped, and leave anything the owner already changed alone. */
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
const NEW = ["vale", "loma"];
const LATER = ["rua"]; // added by v0.2.8, not part of this update

/** The seed as v0.2.6 shipped it: eight rooms, eight in every count. */
function v026(): Any {
  const old = structuredClone(seed) as unknown as Any;
  const gone = [...NEW, ...LATER];
  old.projects = old.projects.filter((p: Any) => !gone.includes(p.slug));
  old.caseStudies = old.caseStudies.filter((c: Any) => !gone.includes(c.projectSlug));
  old.sections.hero.clients.items = old.sections.hero.clients.items.filter((it: Any) => !gone.includes(it.projectSlug));
  old.sections.hero.lede = TEXT_BEFORE_027.lede;
  old.sections.works.intro = TEXT_BEFORE_027.intro;
  old.settings.seoDescription = TEXT_BEFORE_027.seo;
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
const projects = async (db: PGlite) =>
  (await db.query<Any>("select * from public.projects order by sort")).rows.map((r) => ProjectSchema.parse({ ...r.data, id: r.id, slug: r.slug, sort: r.sort, published: r.published }));

describe("supabase/updates/v0.2.7.sql", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await fresh(v026());
    await db.exec(buildUpdateSql027(seed));
    await db.exec(buildUpdateSql027(seed)); // twice: must not duplicate anything
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.7.sql", "utf8")).toBe(buildUpdateSql027(seed));
  });

  it("adds VALE and Loma after the last room, exactly as the seed had them before v0.2.9", async () => {
    const all = await projects(db);
    expect(all.map((p) => p.slug).slice(-2)).toEqual(NEW);
    for (const slug of NEW) {
      const got = all.find((p) => p.slug === slug)!;
      const want = projectBefore029(seed.projects.find((p) => p.slug === slug)!);
      expect({ ...got, sort: 0 }).toEqual({ ...want, sort: 0 });
    }
    expect(all).toHaveLength(10);
  });

  it("adds both case studies", async () => {
    for (const slug of NEW) {
      const r = (await db.query<Any>(`select * from public.case_studies where project_slug = '${slug}'`)).rows;
      expect(r).toHaveLength(1);
      const got = CaseStudySchema.parse({ ...r[0].data, projectSlug: r[0].project_slug, published: r[0].published });
      expect(got).toEqual(seed.caseStudies.find((c) => c.projectSlug === slug));
    }
  });

  it("puts the two wordmarks at the end of the client strip, once", async () => {
    const items = (await section(db, "hero")).clients.items;
    expect(items.map((it: Any) => it.projectSlug)).toEqual(seed.sections.hero.clients.items.map((it) => it.projectSlug).filter((s) => !LATER.includes(s)));
  });

  it("changes the counts from eight to ten", async () => {
    expect((await section(db, "hero")).lede).toEqual(TEXT_BEFORE_028.lede);
    expect((await section(db, "works")).intro).toEqual(TEXT_BEFORE_028.intro);
    const settings = (await db.query<Any>("select data from public.site_settings where id = 1")).rows[0].data;
    expect(settings.seoDescription).toEqual(TEXT_BEFORE_028.seo);
  });
});

describe("v0.2.7 on a database the owner already changed", () => {
  it("keeps a rewritten sentence, a full client strip and an address already in use", async () => {
    const edited = v026();
    edited.sections.hero.lede = { id: "Kalimat saya sendiri.", en: "My own sentence." };
    edited.sections.hero.clients.items = Array.from({ length: 11 }, (_, i) => ({ name: `Klien ${i}`, font: "schibsted", uppercase: false, projectSlug: "" }));
    const mine = structuredClone(edited.projects[0]);
    mine.id = "11111111-1111-4111-8111-111111111111"; mine.slug = "vale"; mine.name = "Proyek saya"; mine.mapSlot = 1;
    edited.projects.push(mine);
    const db = await fresh(edited);
    await db.exec(buildUpdateSql027(seed));
    expect((await section(db, "hero")).lede).toEqual({ id: "Kalimat saya sendiri.", en: "My own sentence." });
    expect((await section(db, "hero")).clients.items).toHaveLength(11);
    const all = await projects(db);
    expect(all.filter((p) => p.slug === "vale").map((p) => p.name)).toEqual(["Proyek saya"]);
    expect(all.some((p) => p.slug === "loma")).toBe(true);
    // the owner's own project kept its case study slot: no VALE case study was attached to it
    expect((await db.query<Any>("select 1 from public.case_studies where project_slug = 'vale'")).rows).toHaveLength(0);
  });
});
