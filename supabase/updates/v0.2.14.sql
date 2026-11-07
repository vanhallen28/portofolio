-- Pembaruan isi v0.2.14. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.
-- Nama jalur yang lebih profesional, cakupan setiap jalur, dan label studi kasus "Fokus bisnis".
-- Nama dan label hanya diganti bila masih sama persis dengan bawaan v0.2.13; cakupan hanya ditambahkan bila belum ada.
-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).

create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());
alter table public.content_updates enable row level security;
revoke all on public.content_updates from anon, authenticated;

do $upd$
begin
if exists (select 1 from public.content_updates where version = '0.2.14') then
  raise notice 'Pembaruan isi v0.2.14 sudah pernah dijalankan; tidak ada yang diubah.';
  return;
end if;

-- Nama jalur (hanya yang belum Anda ubah)
update public.lines set data = jsonb_set(data, '{name}', '{"id":"Kehadiran Digital","en":"Digital Presence"}'::jsonb) where key = 'found' and data->'name' = '{"id":"Ditemukan","en":"Get found"}'::jsonb;
update public.lines set data = jsonb_set(data, '{name}', '{"id":"Penjualan Digital","en":"Digital Commerce"}'::jsonb) where key = 'sell' and data->'name' = '{"id":"Menjual","en":"Sell"}'::jsonb;
update public.lines set data = jsonb_set(data, '{name}', '{"id":"Pengalaman Pelanggan","en":"Customer Experience"}'::jsonb) where key = 'serve' and data->'name' = '{"id":"Melayani","en":"Serve"}'::jsonb;
update public.lines set data = jsonb_set(data, '{name}', '{"id":"Operasional Bisnis","en":"Business Operations"}'::jsonb) where key = 'run' and data->'name' = '{"id":"Mengelola","en":"Run"}'::jsonb;

-- Cakupan setiap jalur (hanya bila belum ada)
update public.lines set data = data || jsonb_build_object('desc', '{"id":"Website, landing page, dan SEO","en":"Websites, landing pages and SEO"}'::jsonb) where key = 'found' and jsonb_typeof(data->'desc') is distinct from 'object';
update public.lines set data = data || jsonb_build_object('desc', '{"id":"Toko online, kasir, dan pembayaran","en":"Online stores, point of sale and payments"}'::jsonb) where key = 'sell' and jsonb_typeof(data->'desc') is distinct from 'object';
update public.lines set data = data || jsonb_build_object('desc', '{"id":"Portal klien, pemesanan, dan aplikasi pelanggan","en":"Client portals, bookings and customer apps"}'::jsonb) where key = 'serve' and jsonb_typeof(data->'desc') is distinct from 'object';
update public.lines set data = data || jsonb_build_object('desc', '{"id":"Sistem internal, SDM, dan keuangan","en":"Internal systems, HR and finance"}'::jsonb) where key = 'run' and jsonb_typeof(data->'desc') is distinct from 'object';

-- Label di studi kasus: Jalur → Fokus bisnis (hanya bila belum Anda ubah)
update public.sections set data = jsonb_set(data, '{caseLabels,lines}', '{"id":"Fokus bisnis","en":"Business focus"}'::jsonb) where key = 'works' and data->'caseLabels'->'lines' = '{"id":"Jalur","en":"Lines"}'::jsonb;

insert into public.content_updates (version) values ('0.2.14');
raise notice 'Pembaruan isi v0.2.14 selesai.';
end
$upd$;
