import { ContentSchema, ImgSchema } from "./schema";
import { caseToRow, projectToRow } from "./rows";
import type { Content, Project } from "./types";
import { VISUALS_BEFORE_029 } from "./visuals-before-029";
import { CIRI_CLIENT_FONT_BEFORE_0212, CIRI_ID, contentBefore0212 } from "./ciri-before-0212";
import { RANUM_ID, RANUM_SLUG, TEXT_BEFORE_0213, contentBefore0213 } from "./ranum-before-0213";
import { CASE_LINES_LABEL_BEFORE_0214, LINE_NAMES_BEFORE_0214 } from "./lines-before-0214";

/** A project row as v0.2.8 and earlier wrote it: the v0.2.8 screens and no mascot. Keeps the update files
    those versions shipped byte-for-byte the same now that the seed has moved on. */
function rowBefore029(p: Project) {
  const r = projectToRow(p);
  const data: Record<string, unknown> = { ...r.data };
  delete data.mascot;
  const before = VISUALS_BEFORE_029[p.id];
  data.visuals = before
    ? before.map((v) => ({ role: v.role, image: ImgSchema.parse(v.image) }))
    : r.data.visuals.map((v) => ({ role: v.role, image: v.image }));
  return { ...r, data: data as Omit<typeof r.data, "mascot"> };
}

/* supabase/updates/v0.2.0.sql — brings a database seeded by v0.1.x up to the v0.2.0 starter content.
   It only ever FILLS what is missing (a new field, an empty FAQ, a case study without colours);
   anything already edited in the admin is left exactly as it is. Safe to run more than once. */
export function buildUpdateSql020(content: Content): string {
  const c = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
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

/* supabase/updates/v0.2.2.sql — Biansa gets its screens now that the client's product photos are in.
   The project room switches from the brand card to a desktop + phone view, and the case study gets a
   cover and pictures per feature. Like v0.2.0 it only FILLS what is still at the starter state: a room
   the owner already gave visuals or another layout, a cover already chosen, or a feature that already
   has pictures is left exactly as it is. Runs once (recorded in content_updates). */
export function buildUpdateSql022(content: Content): string {
  const c = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const project = c.projects.find((p) => p.slug === "biansa");
  const study = c.caseStudies.find((cs) => cs.projectSlug === "biansa");
  if (!project || !study) throw new Error("seed has no Biansa project or case study");
  const pd = rowBefore029(project).data;
  const cd = caseToRow(study).data;
  // feature title (Indonesian) -> pictures, for every feature that has them in the seed
  const pics: Record<string, unknown> = {};
  for (const b of cd.blocks) if (b.type === "features") for (const it of b.items) if (it.images.length) pics[it.title.id] = it.images;
  return [
    "-- Pembaruan isi v0.2.2. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Biansa: layar toko dengan foto produk asli untuk ruang proyek dan studi kasusnya.",
    "-- Hanya mengisi yang belum ada; isi yang sudah Anda ubah di admin tidak disentuh.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.2') then",
    "  raise notice 'Pembaruan isi v0.2.2 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Ruang proyek Biansa: layar desktop dan HP (hanya bila masih kartu merek tanpa gambar)",
    `update public.projects set data = data || jsonb_build_object('layout', ${s(pd.layout)}, 'visuals', ${j(pd.visuals)}) where id = ${s(project.id)} and data->>'layout' = 'brand-card' and (data->'visuals' is null or data->'visuals' = '[]'::jsonb);`,
    "",
    "-- Studi kasus Biansa (dicari lewat proyeknya, jadi tetap ketemu bila alamatnya diganti): gambar sampul, hanya bila belum ada",
    `update public.case_studies set data = jsonb_set(data, '{cover}', ${j(cd.cover)}) where project_slug = (select slug from public.projects where id = ${s(project.id)}) and (data->'cover' is null or data->'cover' = 'null'::jsonb);`,
    "",
    "-- Studi kasus Biansa: gambar per fitur, dicocokkan dengan judul fiturnya (hanya fitur yang belum punya gambar)",
    `update public.case_studies c set data = jsonb_set(c.data, '{blocks}', coalesce((
  select jsonb_agg(case when b.value->>'type' = 'features' then jsonb_set(b.value, '{items}', coalesce((
    select jsonb_agg(case when (it.value->'images' is null or it.value->'images' = '[]'::jsonb) and m.pics ? (it.value->'title'->>'id')
      then jsonb_set(it.value, '{images}', m.pics->(it.value->'title'->>'id')) else it.value end order by it.n)
    from jsonb_array_elements(b.value->'items') with ordinality as it(value, n)), b.value->'items', '[]'::jsonb)) else b.value end order by b.n)
  from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n)), c.data->'blocks'))
from (select ${j(pics)} as pics) m
where c.project_slug = (select slug from public.projects where id = ${s(project.id)});`,
    "",
    "insert into public.content_updates (version) values ('0.2.2');",
    "raise notice 'Pembaruan isi v0.2.2 selesai.';",
    "end",
    "$upd$;",
    "",
  ].join("\n");
}

/* The three sentences that counted eight projects, exactly as v0.2.6 and earlier shipped them. */
export const TEXT_BEFORE_027 = {
  seo: {
    id: "Portofolio Virgiawan Listanto, desainer dan pengembang produk digital di Bandung. Delapan sistem yang menjalankan bisnis nyata.",
    en: "Portfolio of Virgiawan Listanto, a digital product designer and developer in Bandung. Eight systems that run real businesses.",
  },
  lede: {
    id: "Studio Manager di Invisual Studio. Delapan sistem di halaman ini saya rancang dan bangun sendiri, dari tampilan sampai database. Lima di antaranya sudah tayang dan dipakai.",
    en: "Studio Manager at Invisual Studio. I designed and built each of the eight systems on this page myself, from the interface to the database. Five of them are live and in use.",
  },
  intro: {
    id: "Delapan ruang, delapan bisnis. Setiap ruang memakai warna dan huruf milik kliennya, karena sistem yang baik tampil sebagai brand Anda, bukan template saya.",
    en: "Eight rooms, eight businesses. Each room wears its client's own colours and type, because a good system looks like your brand, not my template.",
  },
};

/* supabase/updates/v0.2.7.sql — two new rooms from Invisual Studio, VALE and Loma: their projects (after the
   last room), their case studies, their wordmarks in the client strip, and the three sentences that counted
   eight projects. Inserts only what is missing; a sentence is replaced only while it still reads exactly as it
   shipped, so anything the owner rewrote in the admin stays. Runs once (recorded in content_updates). */
export function buildUpdateSql027(content: Content): string {
  const c = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const slugs = ["vale", "loma"];
  const projects = slugs.map((slug) => c.projects.find((p) => p.slug === slug));
  const studies = slugs.map((slug) => c.caseStudies.find((cs) => cs.projectSlug === slug));
  if (projects.some((p) => !p) || studies.some((cs) => !cs)) throw new Error("seed has no VALE or Loma project / case study");
  const clients = c.sections.hero.clients.items.filter((it) => slugs.includes(it.projectSlug));
  const out: string[] = [
    "-- Pembaruan isi v0.2.7. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Dua ruang baru dari Invisual Studio: VALE dan Loma, dengan studi kasusnya.",
    "-- Hanya menambah yang belum ada; kalimat hanya diganti bila masih sama persis dengan bawaan lama.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "declare next_sort int;",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.7') then",
    "  raise notice 'Pembaruan isi v0.2.7 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Ruang VALE dan Loma, di belakang ruang terakhir (dilewati bila id atau alamatnya sudah dipakai)",
    "select coalesce(max(sort), 0) into next_sort from public.projects;",
  ];
  projects.forEach((p, i) => {
    const r = rowBefore029(p!);
    out.push(`insert into public.projects (id, slug, sort, published, data) select ${s(r.id)}, ${s(r.slug)}, next_sort + ${i + 1}, ${r.published}, ${j(r.data)} where not exists (select 1 from public.projects where id = ${s(r.id)} or slug = ${s(r.slug)});`);
  });
  out.push("", "-- Studi kasus keduanya (hanya untuk proyek VALE dan Loma yang baru ditambahkan, dan bila belum ada)");
  studies.forEach((cs, i) => {
    const r = caseToRow(cs!);
    out.push(`insert into public.case_studies (project_slug, published, data) select ${s(r.project_slug)}, ${r.published}, ${j(r.data)} where exists (select 1 from public.projects where slug = ${s(r.project_slug)} and id = ${s(projects[i]!.id)}) and not exists (select 1 from public.case_studies where project_slug = ${s(r.project_slug)});`);
  });
  out.push(
    "",
    "-- Deretan klien di bawah hero: VALE dan Loma ditambahkan di ujung (dilewati bila sudah ada atau deretannya sudah penuh)",
    `update public.sections set data = jsonb_set(data, '{clients,items}', coalesce(data->'clients'->'items', '[]'::jsonb) || ${j(clients)}) where key = 'hero' and data ? 'clients' and jsonb_array_length(coalesce(data->'clients'->'items', '[]'::jsonb)) <= 10 and not exists (select 1 from jsonb_array_elements(coalesce(data->'clients'->'items', '[]'::jsonb)) x where x->>'projectSlug' in ('vale', 'loma'));`,
    "",
    "-- Kalimat yang menghitung jumlah karya (delapan → sepuluh), hanya bila belum Anda ubah",
    `update public.sections set data = jsonb_set(data, '{lede}', ${j(TEXT_BEFORE_028.lede)}) where key = 'hero' and data->'lede' = ${j(TEXT_BEFORE_027.lede)};`,
    `update public.sections set data = jsonb_set(data, '{intro}', ${j(TEXT_BEFORE_028.intro)}) where key = 'works' and data->'intro' = ${j(TEXT_BEFORE_027.intro)};`,
    `update public.site_settings set data = jsonb_set(data, '{seoDescription}', ${j(TEXT_BEFORE_028.seo)}) where id = 1 and data->'seoDescription' = ${j(TEXT_BEFORE_027.seo)};`,
    "",
    "insert into public.content_updates (version) values ('0.2.7');",
    "raise notice 'Pembaruan isi v0.2.7 selesai.';",
    "end",
    "$upd$;",
    "",
  );
  return out.join("\n");
}

/** The three sentences as v0.2.7 shipped them (ten rooms). v0.2.7 writes these; v0.2.8 replaces them only while they still read so. */
export const TEXT_BEFORE_028 = {
  seo: {
    id: "Portofolio Virgiawan Listanto, desainer dan pengembang produk digital di Bandung. Sepuluh karya untuk bisnis nyata, dari sistem internal sampai situs merek.",
    en: "Portfolio of Virgiawan Listanto, a digital product designer and developer in Bandung. Ten projects for real businesses, from internal systems to brand sites.",
  },
  lede: {
    id: "Studio Manager di Invisual Studio. Sepuluh karya di halaman ini, dari sistem internal sampai situs merek, saya rancang dan bangun dari tampilan sampai kodenya. Lima di antaranya sudah tayang dan dipakai.",
    en: "Studio Manager at Invisual Studio. I designed and built the ten projects on this page, from internal systems to brand sites, from the interface to the code. Five of them are live and in use.",
  },
  intro: {
    id: "Sepuluh ruang, sepuluh bisnis. Setiap ruang memakai warna dan huruf milik kliennya, karena sistem yang baik tampil sebagai brand Anda, bukan template saya.",
    en: "Ten rooms, ten businesses. Each room wears its client's own colours and type, because a good system looks like your brand, not my template.",
  },
};

/* supabase/updates/v0.2.8.sql — one new room from Invisual Studio, RUA: its project (after the last room), its
   case study, its wordmark in the client strip, and the three sentences that counted ten projects. Same rules as
   v0.2.7: inserts only what is missing, replaces a sentence only while it still reads exactly as it shipped, and
   runs once (recorded in content_updates). */
export function buildUpdateSql028(content: Content): string {
  const c = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const p = c.projects.find((x) => x.slug === "rua");
  const cs = c.caseStudies.find((x) => x.projectSlug === "rua");
  if (!p || !cs) throw new Error("seed has no RUA project / case study");
  const r = rowBefore029(p);
  const rc = caseToRow(cs);
  const clients = c.sections.hero.clients.items.filter((it) => it.projectSlug === "rua");
  return [
    "-- Pembaruan isi v0.2.8. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Satu ruang baru dari Invisual Studio: RUA, dengan studi kasusnya.",
    "-- Hanya menambah yang belum ada; kalimat hanya diganti bila masih sama persis dengan bawaan v0.2.7.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "declare next_sort int;",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.8') then",
    "  raise notice 'Pembaruan isi v0.2.8 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Ruang RUA, di belakang ruang terakhir (dilewati bila id atau alamatnya sudah dipakai)",
    "select coalesce(max(sort), 0) into next_sort from public.projects;",
    `insert into public.projects (id, slug, sort, published, data) select ${s(r.id)}, ${s(r.slug)}, next_sort + 1, ${r.published}, ${j(r.data)} where not exists (select 1 from public.projects where id = ${s(r.id)} or slug = ${s(r.slug)});`,
    "",
    "-- Studi kasusnya (hanya untuk proyek RUA yang baru ditambahkan, dan bila belum ada)",
    `insert into public.case_studies (project_slug, published, data) select ${s(rc.project_slug)}, ${rc.published}, ${j(rc.data)} where exists (select 1 from public.projects where slug = ${s(rc.project_slug)} and id = ${s(p.id)}) and not exists (select 1 from public.case_studies where project_slug = ${s(rc.project_slug)});`,
    "",
    "-- Deretan klien di bawah hero: RUA ditambahkan di ujung (dilewati bila sudah ada atau deretannya sudah penuh)",
    `update public.sections set data = jsonb_set(data, '{clients,items}', coalesce(data->'clients'->'items', '[]'::jsonb) || ${j(clients)}) where key = 'hero' and data ? 'clients' and jsonb_array_length(coalesce(data->'clients'->'items', '[]'::jsonb)) <= 11 and not exists (select 1 from jsonb_array_elements(coalesce(data->'clients'->'items', '[]'::jsonb)) x where x->>'projectSlug' = 'rua');`,
    "",
    "-- Kalimat yang menghitung jumlah karya (sepuluh → sebelas), hanya bila belum Anda ubah",
    `update public.sections set data = jsonb_set(data, '{lede}', ${j(c.sections.hero.lede)}) where key = 'hero' and data->'lede' = ${j(TEXT_BEFORE_028.lede)};`,
    `update public.sections set data = jsonb_set(data, '{intro}', ${j(c.sections.works.intro)}) where key = 'works' and data->'intro' = ${j(TEXT_BEFORE_028.intro)};`,
    `update public.site_settings set data = jsonb_set(data, '{seoDescription}', ${j(c.settings.seoDescription)}) where id = 1 and data->'seoDescription' = ${j(TEXT_BEFORE_028.seo)};`,
    "",
    "insert into public.content_updates (version) values ('0.2.8');",
    "raise notice 'Pembaruan isi v0.2.8 selesai.';",
    "end",
    "$upd$;",
    "",
  ].join("\n");
}

/* supabase/updates/v0.2.9.sql — rooms come alive: every room gets its client's mascot or logo, and each screen that
   still shows the image v0.2.8 shipped becomes its live version (a new still taken from the first frame of a short
   silent video, plus that video). A screen the owner replaced, or a mascot the owner already set, is left alone.
   Runs once (recorded in content_updates). */
export function buildUpdateSql029(content: Content): string {
  const c = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const out: string[] = [
    "-- Pembaruan isi v0.2.9. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Ruang karya yang hidup: maskot atau logo klien di setiap ruang, dan layar desktop/HP yang memutar video situsnya.",
    "-- Layar hanya diganti bila gambarnya masih gambar bawaan; maskot hanya ditambahkan bila ruang itu belum punya.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.9') then",
    "  raise notice 'Pembaruan isi v0.2.9 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
  ];
  for (const p of c.projects) {
    const before = VISUALS_BEFORE_029[p.id];
    const swaps = (before ?? []).flatMap((old, i) => {
      const now = p.visuals[i];
      if (!now || (now.image.url === old.image.url && !now.video)) return [];
      return [`when x->'image'->>'url' = ${s(old.image.url)} then ${j(now)}`];
    });
    if (!swaps.length && !p.mascot) continue;
    out.push("", `-- ${p.name}`);
    if (swaps.length) {
      out.push(`update public.projects set data = jsonb_set(data, '{visuals}', (select coalesce(jsonb_agg(case ${swaps.join(" ")} else x end order by ord), '[]'::jsonb) from jsonb_array_elements(data->'visuals') with ordinality as v(x, ord))) where id = ${s(p.id)} and jsonb_typeof(data->'visuals') = 'array';`);
    }
    if (p.mascot) {
      out.push(`update public.projects set data = jsonb_set(data, '{mascot}', ${j(p.mascot)}) where id = ${s(p.id)} and (data->'mascot' is null or data->'mascot' = 'null'::jsonb);`);
    }
  }
  out.push(
    "",
    "insert into public.content_updates (version) values ('0.2.9');",
    "raise notice 'Pembaruan isi v0.2.9 selesai.';",
    "end",
    "$upd$;",
    "",
  );
  return out.join("\n");
}

/* supabase/updates/v0.2.12.sql — Ciri's new site: the room's title font (Alte Haas Grotesk), text, facts, screen
   descriptions and its logo in full, the Ciri name in the client strip, and the case study (subtitle, role, cover
   and each block). Each piece is replaced only while it still reads exactly as v0.2.11 shipped it, so anything the
   owner changed in the admin stays; the room order, lines, colours and status are not touched. Runs once
   (recorded in content_updates). */
export function buildUpdateSql0212(content: Content): string {
  const c = ContentSchema.parse(contentBefore0213(content));
  const o = ContentSchema.parse(contentBefore0212(contentBefore0213(content)));
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const find = (x: Content) => ({ p: x.projects.find((p) => p.id === CIRI_ID), cs: x.caseStudies.find((cs) => cs.projectSlug === "ciri") });
  const now = find(c), old = find(o);
  if (!now.p || !now.cs || !old.p || !old.cs) throw new Error("seed has no Ciri project / case study");
  const pn = projectToRow(now.p).data, po = projectToRow(old.p).data;
  const cn = caseToRow(now.cs).data, co = caseToRow(old.cs).data;
  if (cn.blocks.length !== co.blocks.length) throw new Error("Ciri case study: blocks are replaced one for one");
  const id = s(CIRI_ID);
  const study = `project_slug = (select slug from public.projects where id = ${id})`;
  const alts = po.visuals.flatMap((v, i) => {
    const n = pn.visuals[i];
    if (!n || n.image.url !== v.image.url || JSON.stringify(n.image.alt) === JSON.stringify(v.image.alt)) return [];
    return [`when x->'image'->>'url' = ${s(v.image.url)} and x->'image'->'alt' = ${j(v.image.alt)} then jsonb_set(x, '{image,alt}', ${j(n.image.alt)})`];
  });
  const blocks = co.blocks.map((b, i) => `when b.value = ${j(b)} then ${j(cn.blocks[i])}`);
  return [
    "-- Pembaruan isi v0.2.12. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Ciri versi situs baru: huruf judul Alte Haas Grotesk, teks dan angka ruang, keterangan layar, nama di deretan klien, dan studi kasusnya.",
    "-- Setiap bagian hanya diganti bila masih sama persis dengan bawaan v0.2.11; urutan ruang, jalur, warna, dan status tidak disentuh.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.12') then",
    "  raise notice 'Pembaruan isi v0.2.12 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Ruang Ciri: huruf dan gaya judul (keduanya hanya bila keduanya masih bawaan), teks, dan angka",
    `update public.projects set data = data || jsonb_build_object('titleFont', ${s(pn.titleFont)}, 'titleStyle', ${j(pn.titleStyle)}) where id = ${id} and data->>'titleFont' = ${s(po.titleFont)} and data->'titleStyle' = ${j(po.titleStyle)};`,
    `update public.projects set data = jsonb_set(data, '{text}', ${j(pn.text)}) where id = ${id} and data->'text' = ${j(po.text)};`,
    `update public.projects set data = jsonb_set(data, '{facts}', ${j(pn.facts)}) where id = ${id} and data->'facts' = ${j(po.facts)};`,
    ...(alts.length ? [
      "",
      "-- Keterangan layar desktop dan HP (hanya layar yang masih memakai gambar dan keterangan bawaan)",
      `update public.projects set data = jsonb_set(data, '{visuals}', (select coalesce(jsonb_agg(case ${alts.join(" ")} else x end order by ord), '[]'::jsonb) from jsonb_array_elements(data->'visuals') with ordinality as v(x, ord))) where id = ${id} and jsonb_typeof(data->'visuals') = 'array';`,
    ] : []),
    "",
    "-- Logo Ciri utuh (yang lama terpotong di huruf terakhir), hanya bila logonya masih logo bawaan",
    `update public.projects set data = jsonb_set(data, '{mascot}', ${j(pn.mascot)}) where id = ${id} and data->'mascot' = ${j(po.mascot)};`,
    "",
    "-- Deretan klien di bawah hero: nama Ciri memakai huruf barunya (hanya bila masih huruf bawaan)",
    `update public.sections set data = jsonb_set(data, '{clients,items}', (select coalesce(jsonb_agg(case when x->>'font' = ${s(CIRI_CLIENT_FONT_BEFORE_0212)} and x->>'projectSlug' in ('ciri', (select slug from public.projects where id = ${id})) then jsonb_set(x, '{font}', ${j(c.sections.hero.clients.items.find((x) => x.projectSlug === "ciri")?.font ?? "ciri")}) else x end order by ord), '[]'::jsonb) from jsonb_array_elements(data->'clients'->'items') with ordinality as t(x, ord))) where key = 'hero' and jsonb_typeof(data->'clients'->'items') = 'array';`,
    "",
    "-- Studi kasus Ciri (dicari lewat proyeknya): judul kecil, peran, sampul, lalu setiap blok yang masih bawaan",
    `update public.case_studies set data = jsonb_set(data, '{subtitle}', ${j(cn.subtitle)}) where ${study} and data->'subtitle' = ${j(co.subtitle)};`,
    `update public.case_studies set data = jsonb_set(data, '{labels,role}', ${j(cn.labels.role)}) where ${study} and data->'labels'->'role' = ${j(co.labels.role)};`,
    `update public.case_studies set data = jsonb_set(data, '{cover}', ${j(cn.cover)}) where ${study} and data->'cover' = ${j(co.cover)};`,
    `update public.case_studies c set data = jsonb_set(c.data, '{blocks}', (select coalesce(jsonb_agg(case ${blocks.join(" ")} else b.value end order by b.n), '[]'::jsonb) from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n))) where c.${study} and jsonb_typeof(c.data->'blocks') = 'array';`,
    "",
    "insert into public.content_updates (version) values ('0.2.12');",
    "raise notice 'Pembaruan isi v0.2.12 selesai.';",
    "end",
    "$upd$;",
    "",
  ].join("\n");
}

/* supabase/updates/v0.2.13.sql — a new room: Ranum, with its case study and its name in the client strip, and the
   sentences that count the works go from eleven to twelve. Only adds what is missing (a project whose id or address is
   already taken is skipped), and a sentence changes only while it still reads exactly as v0.2.12 shipped it. The new room
   goes after the last room, so the owner's room order stays. Runs once (recorded in content_updates). */
export function buildUpdateSql0213(content: Content): string {
  const c = ContentSchema.parse(content);
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const p = c.projects.find((x) => x.id === RANUM_ID);
  const cs = c.caseStudies.find((x) => x.projectSlug === RANUM_SLUG);
  if (!p || !cs) throw new Error("seed has no Ranum project / case study");
  const r = projectToRow(p);
  const rc = caseToRow(cs);
  const clients = c.sections.hero.clients.items.filter((it) => it.projectSlug === RANUM_SLUG);
  /* everything after the room itself only happens when the room is really Ranum: if the owner already uses the address
     /karya/ranum for another project, the room is skipped and so are its name in the strip and the twelve-works sentences */
  const added = `exists (select 1 from public.projects where id = ${s(p.id)} and slug = ${s(r.slug)})`;
  return [
    "-- Pembaruan isi v0.2.13. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Satu ruang baru: Ranum, dengan studi kasusnya.",
    "-- Hanya menambah yang belum ada; kalimat hanya diganti bila masih sama persis dengan bawaan v0.2.12.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "declare next_sort int;",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.13') then",
    "  raise notice 'Pembaruan isi v0.2.13 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Ruang Ranum, di belakang ruang terakhir (dilewati bila id atau alamatnya sudah dipakai)",
    "select coalesce(max(sort), 0) into next_sort from public.projects;",
    `insert into public.projects (id, slug, sort, published, data) select ${s(r.id)}, ${s(r.slug)}, next_sort + 1, ${r.published}, ${j(r.data)} where not exists (select 1 from public.projects where id = ${s(r.id)} or slug = ${s(r.slug)});`,
    "",
    "-- Studi kasusnya (hanya untuk proyek Ranum yang baru ditambahkan, dan bila belum ada)",
    `insert into public.case_studies (project_slug, published, data) select ${s(rc.project_slug)}, ${rc.published}, ${j(rc.data)} where ${added} and not exists (select 1 from public.case_studies where project_slug = ${s(rc.project_slug)});`,
    "",
    "-- Deretan klien di bawah hero: Ranum ditambahkan di ujung (dilewati bila sudah ada, deretannya sudah penuh, atau ruang Ranum tidak ditambahkan)",
    `update public.sections set data = jsonb_set(data, '{clients,items}', coalesce(data->'clients'->'items', '[]'::jsonb) || ${j(clients)}) where key = 'hero' and ${added} and jsonb_typeof(data->'clients') = 'object' and case when jsonb_typeof(coalesce(data->'clients'->'items', '[]'::jsonb)) = 'array' then jsonb_array_length(coalesce(data->'clients'->'items', '[]'::jsonb)) <= 11 and not exists (select 1 from jsonb_array_elements(coalesce(data->'clients'->'items', '[]'::jsonb)) x where x->>'projectSlug' = ${s(RANUM_SLUG)}) else false end;`,
    "",
    "-- Kalimat yang menghitung jumlah karya (sebelas → dua belas), hanya bila belum Anda ubah dan ruang Ranum ditambahkan",
    `update public.sections set data = jsonb_set(data, '{lede}', ${j(c.sections.hero.lede)}) where key = 'hero' and ${added} and data->'lede' = ${j(TEXT_BEFORE_0213.lede)};`,
    `update public.sections set data = jsonb_set(data, '{intro}', ${j(c.sections.works.intro)}) where key = 'works' and ${added} and data->'intro' = ${j(TEXT_BEFORE_0213.intro)};`,
    `update public.site_settings set data = jsonb_set(data, '{seoDescription}', ${j(c.settings.seoDescription)}) where id = 1 and ${added} and data->'seoDescription' = ${j(TEXT_BEFORE_0213.seo)};`,
    "",
    "insert into public.content_updates (version) values ('0.2.13');",
    "raise notice 'Pembaruan isi v0.2.13 selesai.';",
    "end",
    "$upd$;",
    "",
  ].join("\n");
}

/* supabase/updates/v0.2.14.sql — professional names for the four lines, a scope for each, and the case-study label
   "Fokus bisnis". A name or the label changes only while it still reads exactly as v0.2.13 shipped it; a scope is only
   added where a line has none yet. Colours and order are not touched. Runs once (recorded in content_updates). */
export function buildUpdateSql0214(content: Content): string {
  const c = ContentSchema.parse(content);
  const j = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  const s = (v: string) => `'${v.replace(/'/g, "''")}'`;
  const names = c.lines.map((l) => `update public.lines set data = jsonb_set(data, '{name}', ${j(l.name)}) where key = ${s(l.key)} and data->'name' = ${j(LINE_NAMES_BEFORE_0214[l.key])};`);
  const descs = c.lines.map((l) => `update public.lines set data = data || jsonb_build_object('desc', ${j(l.desc)}) where key = ${s(l.key)} and jsonb_typeof(data->'desc') is distinct from 'object';`);
  return [
    "-- Pembaruan isi v0.2.14. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.",
    "-- Nama jalur yang lebih profesional, cakupan setiap jalur, dan label studi kasus \"Fokus bisnis\".",
    "-- Nama dan label hanya diganti bila masih sama persis dengan bawaan v0.2.13; cakupan hanya ditambahkan bila belum ada.",
    "-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).",
    "",
    "create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());",
    "alter table public.content_updates enable row level security;",
    "revoke all on public.content_updates from anon, authenticated;",
    "",
    "do $upd$",
    "begin",
    "if exists (select 1 from public.content_updates where version = '0.2.14') then",
    "  raise notice 'Pembaruan isi v0.2.14 sudah pernah dijalankan; tidak ada yang diubah.';",
    "  return;",
    "end if;",
    "",
    "-- Nama jalur (hanya yang belum Anda ubah)",
    ...names,
    "",
    "-- Cakupan setiap jalur (hanya bila belum ada)",
    ...descs,
    "",
    "-- Label di studi kasus: Jalur → Fokus bisnis (hanya bila belum Anda ubah)",
    `update public.sections set data = jsonb_set(data, '{caseLabels,lines}', ${j(c.sections.works.caseLabels.lines)}) where key = 'works' and data->'caseLabels'->'lines' = ${j(CASE_LINES_LABEL_BEFORE_0214)};`,
    "",
    "insert into public.content_updates (version) values ('0.2.14');",
    "raise notice 'Pembaruan isi v0.2.14 selesai.';",
    "end",
    "$upd$;",
    "",
  ].join("\n");
}
