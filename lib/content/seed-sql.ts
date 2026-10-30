import { ContentSchema } from "./schema";
import { contentToRows } from "./rows";
import type { Content } from "./types";

/* Builds supabase/seed.sql. Every insert is `on conflict do nothing`, so running the seed again
   never overwrites anything already edited in the admin. */
export function buildSeedSql(content: Content): string {
  const rows = contentToRows(ContentSchema.parse(content));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  return [
    "-- Isi awal portofolio. Dibuat otomatis oleh `npm run seed:sql` dari lib/content/seed.ts — jangan diedit manual.",
    "-- Aman dijalankan ulang: baris yang sudah ada (termasuk hasil edit di admin) tidak ditimpa.",
    "-- Catatan: proyek awal yang sudah Anda HAPUS di admin akan muncul lagi bila file ini dijalankan ulang.",
    "",
    `insert into public.site_settings (id, data) values (1, ${j(rows.settings)}) on conflict (id) do nothing;`,
    "",
    ...rows.sections.map((r) => `insert into public.sections (key, data) values (${s(r.key)}, ${j(r.data)}) on conflict (key) do nothing;`),
    "",
    ...rows.lines.map((r) => `insert into public.lines (key, sort, data) values (${s(r.key)}, ${r.sort}, ${j(r.data)}) on conflict (key) do nothing;`),
    "",
    // A fresh database gets the starter content that already includes these updates, so they are recorded as done.
    // Only when there are no projects yet: running seed.sql again on a live database must not mark an update
    // as done that never reached its (already existing, therefore untouched) rows.
    "-- Isi awal ini sudah memuat pembaruan isi v0.2.0, v0.2.2, v0.2.7, v0.2.8, dan v0.2.9 (dicatat hanya pada database yang masih kosong).",
    "insert into public.content_updates (version) select v from (values ('0.2.0'), ('0.2.2'), ('0.2.7'), ('0.2.8'), ('0.2.9')) as x(v) where not exists (select 1 from public.projects) on conflict do nothing;",
    "",
    ...rows.projects.map(
      (r) =>
        `insert into public.projects (id, slug, sort, published, data) values (${s(r.id)}, ${s(r.slug)}, ${r.sort}, ${r.published}, ${j(r.data)}) on conflict do nothing;`,
    ),
    "",
    // Only for projects that still exist under that slug (a project renamed or deleted in the admin is left alone).
    ...rows.cases.map(
      (r) =>
        `insert into public.case_studies (project_slug, published, data) select ${s(r.project_slug)}, ${r.published}, ${j(r.data)} where exists (select 1 from public.projects where slug = ${s(r.project_slug)}) on conflict (project_slug) do nothing;`,
    ),
    "",
  ].join("\n");
}
