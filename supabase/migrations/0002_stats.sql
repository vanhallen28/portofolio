-- Portofolio Virgiawan Listanto — statistik kunjungan dan performa web (v0.2.11).
-- Aman dijalankan ulang. Jalankan di Supabase → SQL Editor setelah 0001_init.sql.
--
-- Tanpa cookie dan tanpa menyimpan alamat IP: setiap pengunjung hanya diwakili kode acak yang
-- berganti setiap hari. Pengunjung situs hanya bisa MENAMBAH baris; hanya admin yang bisa membaca.

-- ── Kunjungan dan klik ─────────────────────────────────────────────────
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  kind text not null check (kind in ('view', 'wa', 'preview')),
  path text not null check (path ~ '^/' and char_length(path) <= 200),
  lang text not null default 'id' check (lang in ('id', 'en')),
  source text not null default 'direct' check (source ~ '^[a-z0-9.-]{1,60}$'),
  referrer text not null default '' check (char_length(referrer) <= 120),
  country text not null default '' check (country ~ '^([A-Z]{2})?$'),
  device text not null default 'desktop' check (device in ('desktop', 'phone', 'tablet')),
  visitor text not null default '' check (visitor ~ '^[0-9a-f]{0,32}$'),
  project text not null default '' check (project ~ '^([a-z0-9]+(-[a-z0-9]+)*)?$' and char_length(project) <= 80)
);
create index if not exists visits_at on public.visits (at);

-- ── Performa web dari pengunjung sungguhan (Core Web Vitals) ────────────
create table if not exists public.vitals (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  name text not null check (name in ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')),
  value double precision not null check (value >= 0 and value < 600000),
  path text not null check (path ~ '^/' and char_length(path) <= 200),
  device text not null default 'desktop' check (device in ('desktop', 'phone', 'tablet'))
);
create index if not exists vitals_at on public.vitals (at);

-- ── Hak akses ──────────────────────────────────────────────────────────
alter table public.visits enable row level security;
alter table public.vitals enable row level security;
revoke all on public.visits, public.vitals from anon, authenticated;
grant insert on public.visits, public.vitals to anon, authenticated;
grant select, delete on public.visits, public.vitals to authenticated;

drop policy if exists "pengunjung mencatat" on public.visits;
create policy "pengunjung mencatat" on public.visits for insert to anon, authenticated with check (true);
drop policy if exists "admin membaca" on public.visits;
create policy "admin membaca" on public.visits for select to authenticated using (public.is_admin());
drop policy if exists "admin menghapus" on public.visits;
create policy "admin menghapus" on public.visits for delete to authenticated using (public.is_admin());

drop policy if exists "pengunjung mencatat" on public.vitals;
create policy "pengunjung mencatat" on public.vitals for insert to anon, authenticated with check (true);
drop policy if exists "admin membaca" on public.vitals;
create policy "admin membaca" on public.vitals for select to authenticated using (public.is_admin());
drop policy if exists "admin menghapus" on public.vitals;
create policy "admin menghapus" on public.vitals for delete to authenticated using (public.is_admin());

-- ── Ringkasan untuk admin ──────────────────────────────────────────────
-- Tanggal dihitung dalam WIB (Asia/Jakarta); p_to ikut dihitung. Fungsi berjalan dengan hak
-- pemanggil, jadi aturan akses di atas tetap berlaku: selain admin hanya mendapat angka nol.
create or replace function public.visit_stats(p_from date, p_to date)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with r as (
    select * from public.visits
    where at >= (p_from::timestamp at time zone 'Asia/Jakarta')
      and at < ((p_to + 1)::timestamp at time zone 'Asia/Jakarta')
  ),
  v as (select * from r where kind = 'view')
  select jsonb_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct visitor) from v where visitor <> ''),
    'wa', (select count(*) from r where kind = 'wa'),
    'previews', (select count(*) from r where kind = 'preview'),
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'views', n, 'visitors', u) order by d)
      from (
        select to_char((at at time zone 'Asia/Jakarta')::date, 'YYYY-MM-DD') as d, count(*) as n,
               count(distinct visitor) filter (where visitor <> '') as u
        from v group by 1
      ) x
    ), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select source as k, count(*) as n from v group by 1 order by 2 desc, 1 limit 30) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select country as k, count(*) as n from v group by 1 order by 2 desc, 1 limit 60) x), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select path as k, count(*) as n from v group by 1 order by 2 desc, 1 limit 30) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select device as k, count(*) as n from v group by 1) x), '[]'::jsonb),
    'langs', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select lang as k, count(*) as n from v group by 1) x), '[]'::jsonb),
    'waSources', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select source as k, count(*) as n from r where kind = 'wa' group by 1 order by 2 desc, 1 limit 30) x), '[]'::jsonb),
    'previewProjects', coalesce((select jsonb_agg(jsonb_build_object('key', k, 'n', n) order by n desc, k)
      from (select project as k, count(*) as n from r where kind = 'preview' group by 1 order by 2 desc, 1 limit 40) x), '[]'::jsonb)
  );
$$;

-- p75 (nilai yang dicapai 75% kunjungan, seperti cara Google menilai) per metrik dan perangkat.
create or replace function public.vital_stats(p_from date, p_to date)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with r as (
    select * from public.vitals
    where at >= (p_from::timestamp at time zone 'Asia/Jakarta')
      and at < ((p_to + 1)::timestamp at time zone 'Asia/Jakarta')
  )
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'device', device, 'p75', p75, 'n', n) order by name, device), '[]'::jsonb)
  from (
    select name, case when device = 'desktop' then 'desktop' else 'phone' end as device,
           percentile_cont(0.75) within group (order by value) as p75, count(*) as n
    from r group by 1, 2
    union all
    select name, 'all', percentile_cont(0.75) within group (order by value), count(*) from r group by 1
  ) x;
$$;

revoke all on function public.visit_stats(date, date) from public, anon;
revoke all on function public.vital_stats(date, date) from public, anon;
grant execute on function public.visit_stats(date, date) to authenticated;
grant execute on function public.vital_stats(date, date) to authenticated;
