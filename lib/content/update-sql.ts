import { ContentSchema } from "./schema";
import { caseToRow, projectToRow } from "./rows";
import type { Content } from "./types";

/* supabase/updates/v0.2.0.sql — brings a database seeded by v0.1.x up to the v0.2.0 starter content.
   It only ever FILLS what is missing (a new field, an empty FAQ, a case study without colours);
   anything already edited in the admin is left exactly as it is. Safe to run more than once. */
export function buildUpdateSql020(content: Content): string {
  const c = ContentSchema.parse(content);
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const out: string[] = [
    "-- Pembaruan isi v0.2.0. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Hanya mengisi yang belum ada; isi yang sudah Anda ubah di admin tidak disentuh.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.0') then",
    "  raise notice 'Pembaruan isi v0.2.0 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Deretan klien di bawah hero",
    `update public.sections set data = data || jsonb_build_object('clients', ${j(c.sections.hero.clients)}) where key = 'hero' and not (data ? 'clients');`,
    "",
    "-- Riwayat kerja di bagian Tentang",
    `update public.sections set data = data || jsonb_build_object('experienceTitle', ${j(c.sections.about.experienceTitle)}, 'experience', ${j(c.sections.about.experience)}) where key = 'about' and not (data ? 'experience');`,
    "",
    "-- FAQ: hanya bila masih kosong",
    `update public.sections set data = ${j(c.sections.faq)} where key = 'faq' and coalesce(jsonb_array_length(data->'items'), 0) = 0;`,
    "",
    "-- Kalimat hasil di ruang proyek",
  ];
  for (const p of c.projects) {
    if (!p.result) continue;
    out.push(`update public.projects set data = data || jsonb_build_object('result', ${j(projectToRow(p).data.result)}) where id = ${s(p.id)} and not (data ? 'result');`);
  }
  out.push("", "-- Warna halaman studi kasus (hanya yang belum punya warna sendiri)");
  for (const cs of c.caseStudies) {
    if (!cs.theme) continue;
    out.push(`update public.case_studies set data = data || jsonb_build_object('theme', ${j(caseToRow(cs).data.theme)}) where project_slug = ${s(cs.projectSlug)} and not (data ? 'theme');`);
  }
  out.push("", "-- Blok Hasil (sebelum → sesudah), disisipkan sebelum blok angka; dilewati bila sudah ada blok Hasil");
  for (const cs of c.caseStudies) {
    const block = cs.blocks.find((b) => b.type === "results");
    if (!block) continue;
    out.push(
      `update public.case_studies c set data = jsonb_set(c.data, '{blocks}', (
  select jsonb_agg(e order by ord) from (
    select b.value as e, b.n * 2 as ord from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n)
    union all
    select ${j(block)}, coalesce((select x.n * 2 - 1 from jsonb_array_elements(c.data->'blocks') with ordinality as x(value, n) where x.value->>'type' = 'numbers' limit 1), 1000000)
  ) s))
where project_slug = ${s(cs.projectSlug)} and not exists (select 1 from jsonb_array_elements(c.data->'blocks') b where b->>'type' = 'results');`,
    );
  }
  out.push(
    "",
    "insert into public.content_updates (version) values ('0.2.0');",
    "raise notice 'Pembaruan isi v0.2.0 selesai.';",
    "end",
    "$upd$;",
    "",
  );
  return out.join("\n");
}
