import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { CIRI_CASE_BEFORE_0212, CIRI_ID, CIRI_PROJECT_BEFORE_0212, contentBefore0212 } from "@/lib/content/ciri-before-0212";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ContentSchema, ProjectSchema } from "@/lib/content/schema";
import { contentBefore0213 } from "@/lib/content/ranum-before-0213";
import { seed as current } from "@/lib/content/seed";
import { buildSeedSql } from "@/lib/content/seed-sql";
import { buildUpdateSql0212 } from "@/lib/content/update-sql";

/* A database running v0.2.11 still shows Ciri's first prototype: Cormorant titles, the 35-page text and facts, and the
   old case study. v0.2.12 must bring every part of Ciri that still reads as shipped to the new site, leave each part
   the owner changed alone, and never touch the room order, lines, colours or any other project. */
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

/** The seed as this update knew it (before Ranum, v0.2.13), and as v0.2.11 shipped it. */
const seed = contentBefore0213(current);
/** The seed as v0.2.11 shipped it. */
const v0211 = (): Any => structuredClone(contentBefore0212(seed)) as unknown as Any;

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
const clients = async (db: PGlite) => (await rows(db, "select data from public.sections where key = 'hero'"))[0].data.clients.items as Any[];
const ciri = <T extends { id?: string; projectSlug?: string }>(all: T[]) => all.find((x) => x.id === CIRI_ID || x.projectSlug === "ciri")!;

describe("supabase/updates/v0.2.12.sql", () => {
  let db: PGlite;
  let before: { projects: Any[]; cases: Any[]; lines: Any[] };
  beforeAll(async () => {
    const old = v0211();
    // the live database has the rooms in the owner's own order
    const rua = old.projects.find((p: Any) => p.slug === "rua");
    rua.sort = 2;
    db = await fresh(old);
    before = { projects: await projects(db), cases: await cases(db), lines: await rows(db, "select * from public.lines order by key") };
    await db.exec(buildUpdateSql0212(seed));
    await db.exec(buildUpdateSql0212(seed)); // twice: must not change anything the second time
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.12.sql", "utf8")).toBe(buildUpdateSql0212(seed));
  });

  it("starts from the shipped Ciri, which the seed no longer has", () => {
    const p = ciri(before.projects);
    expect(p.titleFont).toBe(CIRI_PROJECT_BEFORE_0212.titleFont);
    expect(p.facts).toEqual(CIRI_PROJECT_BEFORE_0212.facts);
    expect(ciri(before.cases)).toEqual(CIRI_CASE_BEFORE_0212);
    expect(ciri(seed.projects).titleFont).toBe("ciri");
  });

  it("brings the Ciri room to the seed and keeps its place, lines, colours and status", async () => {
    const got = ciri(await projects(db)), was = ciri(before.projects);
    expect({ ...got, sort: 0 }).toEqual({ ...ciri(seed.projects), sort: 0 });
    expect(got.sort).toBe(was.sort);
    expect(got.lines).toEqual(was.lines);
    expect(got.theme).toEqual(was.theme);
    expect(got.status).toEqual(was.status);
    expect(got.mascot!.image.url).toBe("/media/seed/mascot/ciri.svg");
    expect(was.mascot!.image.url).toBe("/media/seed/mascot/ciri.webp");
  });

  it("changes nothing in any other room, case study or line", async () => {
    const all = await projects(db), cs = await cases(db);
    for (const p of before.projects) if (p.id !== CIRI_ID) expect(all.find((x) => x.id === p.id)).toEqual(p);
    for (const c of before.cases) if (c.projectSlug !== "ciri") expect(cs.find((x) => x.projectSlug === c.projectSlug)).toEqual(c);
    expect(all.map((p) => p.slug)).toEqual(before.projects.map((p) => p.slug));
    expect(await rows(db, "select * from public.lines order by key")).toEqual(before.lines);
  });

  it("brings the case study to the seed", async () => {
    expect(ciri(await cases(db))).toEqual(ciri(seed.caseStudies));
  });

  it("sets the new font on the Ciri name in the client strip only", async () => {
    expect(await clients(db)).toEqual(seed.sections.hero.clients.items);
  });

  it("is recorded once", async () => {
    expect(await rows(db, "select version from public.content_updates where version = '0.2.12'")).toHaveLength(1);
  });
});

describe("v0.2.12 on a database the owner already changed", () => {
  it("replaces only what still reads as shipped", async () => {
    const old = v0211();
    const p = old.projects.find((x: Any) => x.id === CIRI_ID);
    p.text = { id: "Teks saya sendiri.", en: "My own text." };
    p.titleStyle = { ...p.titleStyle, size: "lg" };
    p.visuals[1].image.alt = { id: "keterangan saya", en: "my caption" };
    p.mascot = { ...p.mascot, size: 90 };
    const cs = old.caseStudies.find((x: Any) => x.projectSlug === "ciri");
    cs.cover = { url: "/media-local/sampul-saya.webp", width: 1600, height: 1000, alt: { id: "sampul saya", en: "my cover" } };
    cs.blocks[3].title = { id: "Keputusan saya", en: "My decisions" };
    cs.blocks.splice(2, 1); // the owner removed the flow block
    old.sections.hero.clients.items.find((x: Any) => x.projectSlug === "ciri").font = "schibsted";
    const db = await fresh(old);
    await db.exec(buildUpdateSql0212(seed));

    const want = ciri(seed.projects), wantCase = ciri(seed.caseStudies);
    const got = ciri(await projects(db));
    expect(got.text).toEqual({ id: "Teks saya sendiri.", en: "My own text." });
    expect(got.titleFont).toBe("cormorant"); // font and style move together; the style was changed
    expect(got.titleStyle.size).toBe("lg");
    expect(got.facts).toEqual(want.facts);
    expect(got.visuals[0]).toEqual(want.visuals[0]);
    expect(got.visuals[1].image.alt).toEqual({ id: "keterangan saya", en: "my caption" });
    expect(got.mascot).toEqual({ ...CIRI_PROJECT_BEFORE_0212.mascot, size: 90 });

    const gc = ciri(await cases(db));
    expect(gc.cover!.url).toBe("/media-local/sampul-saya.webp");
    expect(gc.subtitle).toEqual(wantCase.subtitle);
    expect(gc.labels.role).toEqual(wantCase.labels.role);
    expect(gc.blocks.map((b) => b.type)).toEqual(["prose", "features", "decisions", "numbers"]);
    expect(gc.blocks[0]).toEqual(wantCase.blocks[0]);
    expect(gc.blocks[1]).toEqual(wantCase.blocks[1]);
    expect(gc.blocks[2].title).toEqual({ id: "Keputusan saya", en: "My decisions" }); // edited: left as it was
    expect(gc.blocks[2]).toEqual(cs.blocks[2]);
    expect(gc.blocks[3]).toEqual(wantCase.blocks[4]);

    expect((await clients(db)).find((x) => x.projectSlug === "ciri")!.font).toBe("schibsted");
  });

  it("finds the case study through the project when the owner renamed its address", async () => {
    const old = v0211();
    old.projects.find((x: Any) => x.id === CIRI_ID).slug = "ciri-perak";
    old.caseStudies.find((x: Any) => x.projectSlug === "ciri").projectSlug = "ciri-perak";
    old.sections.hero.clients.items.find((x: Any) => x.projectSlug === "ciri").projectSlug = "ciri-perak";
    const db = await fresh(old);
    await db.exec(buildUpdateSql0212(seed));
    const gc = (await cases(db)).find((x) => x.projectSlug === "ciri-perak")!;
    expect({ ...gc, projectSlug: "ciri" }).toEqual(ciri(seed.caseStudies));
    expect((await clients(db)).find((x) => x.projectSlug === "ciri-perak")!.font).toBe("ciri");
  });

  it("does nothing on a database without Ciri", async () => {
    const old = v0211();
    old.projects = old.projects.filter((x: Any) => x.id !== CIRI_ID);
    old.caseStudies = old.caseStudies.filter((x: Any) => x.projectSlug !== "ciri");
    old.sections.hero.clients.items = [];
    const db = await fresh(old);
    const before = await projects(db);
    await db.exec(buildUpdateSql0212(seed));
    expect(await projects(db)).toEqual(before);
    expect(await clients(db)).toEqual([]);
  });
});

describe("a fresh database from seed.sql", () => {
  it("already has the new Ciri and counts v0.2.12 as done", async () => {
    const db = await PGlite.create();
    await db.exec(STUBS);
    await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
    await db.exec(buildSeedSql(current));
    expect(readFileSync("supabase/seed.sql", "utf8")).toBe(buildSeedSql(current));
    expect(await rows(db, "select version from public.content_updates where version = '0.2.12'")).toHaveLength(1);
    const before = await projects(db);
    await db.exec(buildUpdateSql0212(seed));
    expect(await projects(db)).toEqual(before);
    expect(ciri(before)).toEqual(ciri(current.projects));
  });
});
