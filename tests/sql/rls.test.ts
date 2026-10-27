import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "@/lib/content/seed";
import { buildSeedSql } from "@/lib/content/seed-sql";

/* Supabase provides the auth + storage schemas and the anon/authenticated roles, and by default grants
   both roles ALL privileges on new public tables — so row-level security, not grants, is what protects data.
   These stubs reproduce that, so the real migration file runs unchanged. */
const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant select, insert, update, delete on storage.objects to anon, authenticated;
`;

const ADMIN = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";
const migration = readFileSync("supabase/migrations/0001_init.sql", "utf8");

let db: PGlite;

/** Runs `fn` as the given role; `sub` is the signed-in user id (Supabase puts it in the JWT). */
async function as<T>(role: "anon" | "authenticated", sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub ?? ""]);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}
const count = async (sql: string) => Number((await db.query<{ n: number }>(`select count(*)::int as n from (${sql}) q`)).rows[0].n);

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(SUPABASE_STUBS);
  await db.exec(migration);
  await db.exec(migration); // must be safe to run twice
  await db.exec(buildSeedSql(seed));
  await db.exec(`insert into auth.users (id) values ('${ADMIN}'), ('${USER}'); insert into public.admins (user_id) values ('${ADMIN}');`);
});

describe("seed", () => {
  it("fills every table", async () => {
    expect(await count("select * from public.site_settings")).toBe(1);
    expect(await count("select * from public.sections")).toBe(Object.keys(seed.sections).length);
    expect(await count("select * from public.lines")).toBe(4);
    expect(await count("select * from public.projects")).toBe(seed.projects.length);
    expect(await count("select * from public.case_studies")).toBe(seed.caseStudies.length);
  });

  it("does not overwrite admin edits when run again", async () => {
    await db.exec(`update public.site_settings set data = jsonb_set(data, '{email}', '"baru@contoh.id"')`);
    await db.exec(buildSeedSql(seed));
    const r = await db.query<{ email: string }>(`select data->>'email' as email from public.site_settings`);
    expect(r.rows[0].email).toBe("baru@contoh.id");
    expect(await count("select * from public.projects")).toBe(seed.projects.length);
  });

  it("supabase/seed.sql is up to date with lib/content/seed.ts (run npm run seed:sql)", () => {
    expect(readFileSync("supabase/seed.sql", "utf8")).toBe(buildSeedSql(seed));
  });
});

describe("public visitors (anon)", () => {
  it("read settings, sections, lines and published projects", async () => {
    await as("anon", null, async () => {
      expect(await count("select * from public.site_settings")).toBe(1);
      expect(await count("select * from public.sections")).toBeGreaterThan(0);
      expect(await count("select * from public.lines")).toBe(4);
      expect(await count("select * from public.projects")).toBe(seed.projects.filter((p) => p.published).length);
    });
  });

  it("cannot write anything", async () => {
    await as("anon", null, async () => {
      await db.exec(`update public.site_settings set data = '{}'::jsonb`); // RLS: 0 rows match
      await db.exec(`delete from public.projects`);
      await db.exec(`delete from public.case_studies`);
      await expect(db.exec(`insert into public.projects (slug, data) values ('palsu', '{}'::jsonb)`)).rejects.toThrow(/row-level security/);
      await expect(db.exec(`insert into public.admins (user_id) values ('${USER}')`)).rejects.toThrow(/row-level security/);
      await expect(db.exec(`insert into storage.objects (bucket_id, name) values ('media', 'x.webp')`)).rejects.toThrow(/row-level security/);
    });
    expect(await count("select * from public.projects")).toBe(seed.projects.length);
    expect(await count("select * from public.case_studies")).toBe(seed.caseStudies.length);
    expect(await count("select * from public.site_settings where data ? 'email'")).toBe(1);
  });

  it("can only count admins, not list them", async () => {
    await as("anon", null, async () => {
      expect((await db.query<{ n: number }>(`select public.admin_count() as n`)).rows[0].n).toBe(1);
      expect(await count("select * from public.admins")).toBe(0);
    });
  });
});

describe("signed-in user who is not an admin", () => {
  it("cannot change content or make themselves admin", async () => {
    await as("authenticated", USER, async () => {
      await db.exec(`update public.site_settings set data = '{}'::jsonb`); // RLS filters the row: 0 rows changed
      await expect(db.exec(`insert into public.lines (key, data) values ('found', '{}'::jsonb)`)).rejects.toThrow(/row-level security/);
      await expect(db.exec(`insert into public.admins (user_id) values ('${USER}')`)).rejects.toThrow(/row-level security/);
      await db.exec(`delete from public.admins`); // 0 rows
      expect(await count("select * from public.admins")).toBe(0); // sees only their own row, and has none
    });
    const r = await db.query<{ email: string }>(`select data->>'email' as email from public.site_settings`);
    expect(r.rows[0].email).toBe("baru@contoh.id");
  });
});

describe("admin", () => {
  it("edits, adds and deletes projects; unpublished projects stay hidden from the public", async () => {
    await as("authenticated", ADMIN, async () => {
      await db.exec(`update public.projects set data = jsonb_set(data, '{meta,id}', '"Diubah"') where slug = 'ciri'`);
      await db.exec(`insert into public.projects (slug, sort, published, data) values ('rahasia', 99, false, '{}'::jsonb)`);
      await db.exec(`insert into public.case_studies (project_slug, published, data) values ('rahasia', true, '{}'::jsonb)`);
      expect(await count("select * from public.projects where slug = 'rahasia'")).toBe(1);
    });
    await as("anon", null, async () => {
      expect(await count("select * from public.projects where slug = 'rahasia'")).toBe(0);
      expect(await count("select * from public.case_studies where project_slug = 'rahasia'")).toBe(0);
      const r = await db.query<{ v: string }>(`select data->'meta'->>'id' as v from public.projects where slug = 'ciri'`);
      expect(r.rows[0].v).toBe("Diubah");
    });
    await as("authenticated", ADMIN, async () => {
      await db.exec(`delete from public.projects where slug = 'rahasia'`);
    });
    expect(await count("select * from public.case_studies where project_slug = 'rahasia'")).toBe(0); // cascades
  });

  it("hides an unpublished case study even when its project is published", async () => {
    await as("authenticated", ADMIN, async () => {
      await db.exec(`update public.case_studies set published = false where project_slug = 'ciri'`);
    });
    await as("anon", null, async () => {
      expect(await count("select * from public.case_studies where project_slug = 'ciri'")).toBe(0);
    });
    await as("authenticated", ADMIN, async () => {
      expect(await count("select * from public.case_studies where project_slug = 'ciri'")).toBe(1);
      await db.exec(`update public.case_studies set published = true where project_slug = 'ciri'`);
    });
  });

  it("renaming a slug carries its case study along", async () => {
    await as("authenticated", ADMIN, async () => {
      await db.exec(`update public.projects set slug = 'ciri-baru' where slug = 'ciri'`);
      expect(await count("select * from public.case_studies where project_slug = 'ciri-baru'")).toBe(1);
      await db.exec(`update public.projects set slug = 'ciri' where slug = 'ciri-baru'`);
    });
  });

  it("rejects an invalid slug", async () => {
    await as("authenticated", ADMIN, async () => {
      await expect(db.exec(`insert into public.projects (slug, data) values ('Bukan Slug', '{}'::jsonb)`)).rejects.toThrow(/check constraint/);
    });
  });

  it("uploads images to the media bucket", async () => {
    await as("authenticated", ADMIN, async () => {
      await db.exec(`insert into storage.objects (bucket_id, name) values ('media', 'uploads/a.webp')`);
    });
    expect(await count("select * from storage.objects")).toBe(1);
    const b = await db.query<{ public: boolean }>(`select public from storage.buckets where id = 'media'`);
    expect(b.rows[0].public).toBe(true);
  });

  it("stamps updated_at on every change", async () => {
    await db.exec(`alter table public.lines disable trigger touch_updated_at;
      update public.lines set updated_at = '2000-01-01' where key = 'run';
      alter table public.lines enable trigger touch_updated_at;`);
    await as("authenticated", ADMIN, async () => {
      await db.exec(`update public.lines set sort = sort where key = 'run'`);
    });
    const r = await db.query<{ y: number }>(`select extract(year from updated_at)::int as y from public.lines where key = 'run'`);
    expect(r.rows[0].y).toBeGreaterThan(2000);
  });
});
