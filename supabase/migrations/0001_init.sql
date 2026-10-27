-- Portofolio Virgiawan Listanto — skema konten + aturan akses.
-- Aman dijalankan ulang. Jalankan di Supabase → SQL Editor, lalu jalankan supabase/seed.sql.

-- ── Admin ──────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Dipakai `npm run doctor` untuk memastikan sudah ada akun admin (hanya mengembalikan jumlah).
create or replace function public.admin_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.admins;
$$;

-- ── Konten ─────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.sections (
  key text primary key check (key in ('hero', 'works', 'services', 'process', 'testimonials', 'about', 'faq', 'contact')),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.lines (
  key text primary key check (key in ('found', 'sell', 'serve', 'run')),
  sort int not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort int not null default 0,
  published boolean not null default false,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.case_studies (
  project_slug text primary key references public.projects (slug) on update cascade on delete cascade,
  published boolean not null default false,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Which content updates (supabase/updates/v*.sql) have run, so each one runs only once.
create table if not exists public.content_updates (
  version text primary key,
  applied_at timestamptz not null default now()
);
alter table public.content_updates enable row level security;
revoke all on public.content_updates from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['site_settings', 'sections', 'lines', 'projects', 'case_studies'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ── Hak akses ──────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.sections, public.lines, public.projects, public.case_studies to anon, authenticated;
grant insert, update, delete on public.site_settings, public.sections, public.lines, public.projects, public.case_studies to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.admin_count() to anon, authenticated;

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.sections enable row level security;
alter table public.lines enable row level security;
alter table public.projects enable row level security;
alter table public.case_studies enable row level security;

drop policy if exists "admins: lihat diri sendiri" on public.admins;
create policy "admins: lihat diri sendiri" on public.admins for select to authenticated using (user_id = auth.uid());

do $$
declare t text;
begin
  -- Settings, sections, lines: everyone reads, only admins write.
  foreach t in array array['site_settings', 'sections', 'lines'] loop
    execute format('drop policy if exists "publik membaca" on public.%I', t);
    execute format('create policy "publik membaca" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin menulis" on public.%I', t);
    execute format('create policy "admin menulis" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "publik membaca yang terbit" on public.projects;
create policy "publik membaca yang terbit" on public.projects for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists "admin menulis" on public.projects;
create policy "admin menulis" on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "publik membaca yang terbit" on public.case_studies;
create policy "publik membaca yang terbit" on public.case_studies for select to anon, authenticated
  using (
    (published and exists (select 1 from public.projects p where p.slug = project_slug and p.published))
    or public.is_admin()
  );
drop policy if exists "admin menulis" on public.case_studies;
create policy "admin menulis" on public.case_studies for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── Gambar (Supabase Storage) ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: admin melihat" on storage.objects;
create policy "media: admin melihat" on storage.objects for select to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin upload" on storage.objects;
create policy "media: admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin mengubah" on storage.objects;
create policy "media: admin mengubah" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin menghapus" on storage.objects;
create policy "media: admin menghapus" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
