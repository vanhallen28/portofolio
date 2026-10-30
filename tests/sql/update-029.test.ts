import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { contentToRows } from "@/lib/content/rows";
import { ContentSchema, ProjectSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import { buildUpdateSql029 } from "@/lib/content/update-sql";
import { VISUALS_BEFORE_029 } from "@/lib/content/visuals-before-029";

/* A database running v0.2.8 has eleven rooms with still screens and no mascots. v0.2.9 must give every room its
   mascot, swap each screen that still shows its shipped image for the live one (still + video), and leave screens
   or mascots the owner already changed alone. */
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

/** The seed as v0.2.8 shipped it: still screens (no video key at all) and no mascot key. */
function v028(): Any {
  const old = structuredClone(seed) as unknown as Any;
  for (const p of old.projects) {
    p.visuals = structuredClone(VISUALS_BEFORE_029[p.id]);
    delete p.mascot;
  }
  return old;
}
const q = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
async function fresh(content: Any) {
  const db = await PGlite.create();
  await db.exec(STUBS);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  const parsed = ContentSchema.parse(content);
  const r = contentToRows(parsed);
  /* write the rows the way v0.2.8 stored them: no "video" on screens, no "mascot" */
  const strip = (d: Any) => { const x = structuredClone(d); delete x.mascot; x.visuals = x.visuals.map((v: Any) => ({ role: v.role, image: v.image })); return x; };
  const keep = content.projects as Any[];
  await db.exec([
    `insert into public.site_settings (id, data) values (1, ${q(r.settings)});`,
    ...r.sections.map((x) => `insert into public.sections (key, data) values ('${x.key}', ${q(x.data)});`),
    ...r.projects.map((x) => {
      const src = keep.find((p) => p.id === x.id)!;
      const data = strip(x.data);
      if (src.mascot) data.mascot = src.mascot;
      data.visuals = src.visuals.map((v: Any) => (v.video ? v : { role: v.role, image: v.image }));
      return `insert into public.projects (id, slug, sort, published, data) values ('${x.id}', '${x.slug}', ${x.sort}, ${x.published}, ${q(data)});`;
    }),
  ].join("\n"));
  return db;
}
const projects = async (db: PGlite) =>
  (await db.query<Any>("select * from public.projects order by sort")).rows.map((r) => ProjectSchema.parse({ ...r.data, id: r.id, slug: r.slug, sort: r.sort, published: r.published }));

describe("supabase/updates/v0.2.9.sql", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await fresh(v028());
    await db.exec(buildUpdateSql029(seed));
    await db.exec(buildUpdateSql029(seed)); // twice: must not change anything the second time
  });

  it("is the file shipped in the repo", () => {
    expect(readFileSync("supabase/updates/v0.2.9.sql", "utf8")).toBe(buildUpdateSql029(seed));
  });

  it("brings every room to the seed: live screens and its mascot", async () => {
    const all = await projects(db);
    for (const want of seed.projects) {
      const got = all.find((p) => p.id === want.id)!;
      expect(got.visuals).toEqual(want.visuals);
      expect(got.mascot).toEqual(want.mascot);
    }
  });

  it("every room has a mascot and every screen with a preview has a video", () => {
    for (const p of seed.projects) {
      expect(p.mascot, p.slug).not.toBeNull();
      if (p.previewUrl) for (const v of p.visuals) expect(v.video, `${p.slug} ${v.role}`).not.toBeNull();
    }
  });
});

describe("v0.2.9 on a database the owner already changed", () => {
  it("keeps a screen the owner replaced and a mascot the owner set", async () => {
    const edited = v028();
    const vale = edited.projects.find((p: Any) => p.slug === "vale");
    vale.visuals[0].image = { url: "/media-local/my-own.webp", width: 1600, height: 1000, alt: { id: "punya saya", en: "mine" } };
    const rua = edited.projects.find((p: Any) => p.slug === "rua");
    rua.mascot = { image: { url: "/media-local/turtle.webp", width: 300, height: 300, alt: { id: "", en: "" } }, motion: "float", size: 120, chip: "" };
    const db = await fresh(edited);
    await db.exec(buildUpdateSql029(seed));
    const all = await projects(db);
    const v = all.find((p) => p.slug === "vale")!, want = seed.projects.find((p) => p.slug === "vale")!;
    expect(v.visuals[0].image.url).toBe("/media-local/my-own.webp");
    expect(v.visuals[0].video).toBeNull();
    expect(v.visuals[1]).toEqual(want.visuals[1]);
    expect(all.find((p) => p.slug === "rua")!.mascot!.image.url).toBe("/media-local/turtle.webp");
  });
});
