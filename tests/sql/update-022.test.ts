import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ProjectSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildUpdateSql022 } from "@/lib/content/update-sql";

/* A database running v0.2.1 has Biansa as a brand card with no screens and a case study without
   pictures. The v0.2.2 update must add them, and leave alone anything the owner already changed. */
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
const BIANSA_ID = seed.projects.find((p) => p.slug === "biansa")!.id;
const wantProject = seed.projects.find((p) => p.slug === "biansa")!;
const wantCase = seed.caseStudies.find((c) => c.projectSlug === "biansa")!;

/** The seed as v0.2.1 shipped it: Biansa without screens. */
function v021(): Any {
  const old = structuredClone(seed) as unknown as Any;
  const p = old.projects.find((x: Any) => x.slug === "biansa");
  p.layout = "brand-card"; p.visuals = [];
  const c = old.caseStudies.find((x: Any) => x.projectSlug === "biansa");
  c.cover = null;
  for (const b of c.blocks) if (b.type === "features") for (const it of b.items) it.images = [];
  return old;
}

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
async function fresh(content: Any) {
  const db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const r = contentToRows(content as never);
  await db.exec([
    ...r.projects.map((x) => `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(x.data)});`),
    ...r.cases.map((x) => `insert into public.case_studies (project_slug, published, data) values ('${x.project_slug}', ${x.published}, ${q(x.data)});`),
  ].join("\n"));
  return db;
}
async function biansa(db: PGlite) {
  const pr = (await db.query<Any>(`select * from public.projects where id = '${BIANSA_ID}'`)).rows[0];
  const cr = (await db.query<Any>("select * from public.case_studies where project_slug = 'biansa'")).rows[0];
  return {
    project: ProjectSchema.parse({ ...pr.data, id: pr.id, slug: pr.slug, sort: pr.sort, published: pr.published }),
    study: CaseStudySchema.parse({ ...cr.data, projectSlug: cr.project_slug, published: cr.published }),
  };
}
const featureImages = (c: Any) => c.blocks.filter((b: Any) => b.type === "features").flatMap((b: Any) => b.items.map((it: Any) => it.images));

describe("supabase/updates/v0.2.2.sql", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await fresh(v021());
    await db.exec(buildUpdateSql022(seed));
    await db.exec(buildUpdateSql022(seed)); // twice: must not duplicate anything
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.2.sql", "utf8")).toBe(buildUpdateSql022(seed));
  });

  it("gives the Biansa room its desktop and phone screens", async () => {
    const { project } = await biansa(db);
    expect(project.layout).toBe("desk-phone");
    expect(project.visuals).toEqual(wantProject.visuals);
    expect(project.brand).toEqual(wantProject.brand); // the brand card details stay for a switch back
  });

  it("adds the cover and the feature pictures, keeping every other block as it was", async () => {
    const { study } = await biansa(db);
    expect(study.cover).toEqual(wantCase.cover);
    expect(featureImages(study)).toEqual(featureImages(wantCase));
    expect(study.blocks.map((b) => b.type)).toEqual(wantCase.blocks.map((b) => b.type));
  });

  it("runs only once: pictures removed in the admin afterwards are not brought back", async () => {
    await db.exec("update public.case_studies set data = jsonb_set(data, '{cover}', 'null'::jsonb) where project_slug = 'biansa'");
    await db.exec(buildUpdateSql022(seed));
    expect((await biansa(db)).study.cover).toBeNull();
  });

  it("leaves a room, cover and pictures the owner already changed alone", async () => {
    const edited = v021();
    const p = edited.projects.find((x: Any) => x.slug === "biansa");
    p.layout = "two-phones";
    const c = edited.caseStudies.find((x: Any) => x.projectSlug === "biansa");
    const own = { url: "/media/own.webp", width: 800, height: 600, alt: { id: "Punya saya", en: "Mine" } };
    c.cover = own;
    const feats = c.blocks.find((b: Any) => b.type === "features");
    feats.items[0].images = [own];
    const db2 = await fresh(edited);
    await db2.exec(buildUpdateSql022(seed));
    const { project, study } = await biansa(db2);
    expect(project.layout).toBe("two-phones");
    expect(project.visuals).toEqual([]);
    expect(study.cover).toEqual(own);
    const got = featureImages(study), want = featureImages(wantCase);
    expect(got[0]).toEqual([own]);
    expect(got.slice(1)).toEqual(want.slice(1));
  });
});

describe("v0.2.2 on a database where things moved", () => {
  it("finds the case study through the project, even after the owner renamed its address", async () => {
    const db = await fresh(v021());
    await db.exec(`update public.projects set slug = 'biansa-style' where id = '${BIANSA_ID}'`); // the case study follows (on update cascade)
    await db.exec(buildUpdateSql022(seed));
    const cr = (await db.query<Any>("select * from public.case_studies where project_slug = 'biansa-style'")).rows[0];
    const study = CaseStudySchema.parse({ ...cr.data, projectSlug: cr.project_slug, published: cr.published });
    expect(study.cover).toEqual(wantCase.cover);
    expect(featureImages(study)).toEqual(featureImages(wantCase));
  });

  it("is not marked as done when seed.sql is run again on a live database", async () => {
    const db = await fresh(v021());
    await db.exec(readFileSync("supabase/seed.sql", "utf8")); // existing rows are left alone, so nothing of v0.2.2 arrived
    expect((await db.query("select * from public.content_updates where version = '0.2.2'")).rows).toHaveLength(0);
    await db.exec(buildUpdateSql022(seed));
    expect((await biansa(db)).study.cover).toEqual(wantCase.cover);
  });
});

describe("fresh install with the v0.2.2 seed", () => {
  it("marks the update as done, so running it later changes nothing", async () => {
    const db = await PGlite.create();
    await db.exec(STUBS);
    await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
    await db.exec(readFileSync("supabase/seed.sql", "utf8"));
    await db.exec("update public.case_studies set data = jsonb_set(data, '{cover}', 'null'::jsonb) where project_slug = 'biansa'");
    await db.exec(buildUpdateSql022(seed));
    expect((await biansa(db)).study.cover).toBeNull();
  });
});
