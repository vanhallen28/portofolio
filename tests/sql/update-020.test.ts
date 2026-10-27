import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { CaseStudySchema, ProjectSchema, SectionSchemas } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildUpdateSql020 } from "@/lib/content/update-sql";

/* A database seeded by v0.1.x lacks the v0.2.0 fields entirely. The update must fill them in
   without touching anything the owner already edited. */
const STUBS = `
  create role anon nologin; create role authenticated nologin;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;

function v01Rows() {
  const old = structuredClone(seed) as unknown as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  delete old.settings.stickyCta;
  delete old.settings.cv;
  delete old.sections.hero.clients;
  delete old.sections.about.experience;
  delete old.sections.about.experienceTitle;
  old.sections.faq = { visible: false, title: old.sections.faq.title, items: [] };
  for (const p of old.projects) delete p.result;
  for (const c of old.caseStudies) {
    if (c.projectSlug !== "aliya-syifaa") delete c.theme;
    c.blocks = c.blocks.filter((b: { type: string }) => b.type !== "results");
  }
  return contentToRows(old as never);
}

const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
let db: PGlite;
const sections = async () => new Map((await db.query<{ key: string; data: unknown }>("select key, data from public.sections")).rows.map((r) => [r.key, r.data]));

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const r = v01Rows();
  await db.exec([
    ...r.sections.map((x) => `insert into public.sections (key, data) values ('${x.key}', ${q(x.data)});`),
    ...r.projects.map((x) => `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(x.data)});`),
    ...r.cases.map((x) => `insert into public.case_studies (project_slug, published, data) values ('${x.project_slug}', ${x.published}, ${q(x.data)});`),
  ].join("\n"));
  // The owner already edited one case study's colours; the update must keep them.
  await db.exec(`update public.case_studies set data = data || '{"theme":{"wall":"#FFFFFF","ink":"#000000","muted":"#444444","accent":"#0000FF","btnBg":"#000000","btnInk":"#FFFFFF"}}'::jsonb where project_slug = 'ciri'`);
  await db.exec(buildUpdateSql020(seed));
  await db.exec(buildUpdateSql020(seed)); // twice: must not duplicate anything
});

describe("supabase/updates/v0.2.0.sql", () => {
  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.0.sql", "utf8")).toBe(buildUpdateSql020(seed));
  });

  it("adds clients, experience and the FAQ", async () => {
    const s = await sections();
    expect(SectionSchemas.hero.parse(s.get("hero")).clients).toEqual(seed.sections.hero.clients);
    expect(SectionSchemas.about.parse(s.get("about")).experience).toEqual(seed.sections.about.experience);
    expect(SectionSchemas.faq.parse(s.get("faq"))).toEqual(seed.sections.faq);
  });

  it("adds project results", async () => {
    const rows = (await db.query<{ id: string; slug: string; sort: number; published: boolean; data: object }>("select * from public.projects")).rows;
    for (const p of seed.projects) {
      const row = rows.find((r) => r.id === p.id)!;
      expect(ProjectSchema.parse({ ...row.data, id: row.id, slug: row.slug, sort: row.sort, published: row.published }).result).toEqual(p.result);
    }
  });

  it("adds case colours and one results block before the numbers, keeping edited colours", async () => {
    const rows = (await db.query<{ project_slug: string; published: boolean; data: object }>("select * from public.case_studies")).rows;
    for (const want of seed.caseStudies) {
      const row = rows.find((r) => r.project_slug === want.projectSlug)!;
      const got = CaseStudySchema.parse({ ...row.data, projectSlug: row.project_slug, published: row.published });
      if (want.projectSlug === "ciri") expect(got.theme?.wall).toBe("#FFFFFF");
      else expect(got.theme).toEqual(want.theme);
      expect(got.blocks.map((b) => b.type)).toEqual(want.blocks.map((b) => b.type));
    }
  });

  it("runs only once: content removed in the admin afterwards is not brought back", async () => {
    await db.exec(`update public.case_studies set data = jsonb_set(data, '{blocks}', (select jsonb_agg(b) from jsonb_array_elements(data->'blocks') b where b->>'type' <> 'results')) where project_slug = 'invisual-hris'`);
    await db.exec(`update public.case_studies set data = data - 'theme' where project_slug = 'biansa'`);
    await db.exec(buildUpdateSql020(seed));
    const rows = (await db.query<{ project_slug: string; data: { theme?: unknown; blocks: { type: string }[] } }>("select project_slug, data from public.case_studies")).rows;
    expect(rows.find((r) => r.project_slug === "invisual-hris")!.data.blocks.some((b) => b.type === "results")).toBe(false);
    expect(rows.find((r) => r.project_slug === "biansa")!.data.theme).toBeUndefined();
    expect((await db.query("select * from public.content_updates")).rows).toHaveLength(1);
  });

  it("leaves an FAQ the owner already filled alone", async () => {
    await db.exec(`update public.sections set data = jsonb_set(data, '{items}', '[{"q":{"id":"Q","en":"Q"},"a":{"id":"A","en":"A"}}]') where key = 'faq'`);
    await db.exec(buildUpdateSql020(seed));
    const faq = SectionSchemas.faq.parse((await sections()).get("faq"));
    expect(faq.items).toHaveLength(1);
  });
});

describe("fresh install with the v0.2.0 seed", () => {
  it("marks the update as done, so running it later changes nothing", async () => {
    const fresh = await PGlite.create();
    await fresh.exec(STUBS);
    await fresh.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
    await fresh.exec(readFileSync("supabase/seed.sql", "utf8"));
    await fresh.exec(`update public.sections set data = jsonb_set(data, '{items}', '[]') where key = 'faq'`);
    await fresh.exec(buildUpdateSql020(seed));
    const faq = (await fresh.query<{ data: { items: unknown[] } }>("select data from public.sections where key = 'faq'")).rows[0].data;
    expect(faq.items).toEqual([]);
  });
});
