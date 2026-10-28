-- Pembaruan isi v0.2.2. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.
-- Biansa: layar toko dengan foto produk asli untuk ruang proyek dan studi kasusnya.
-- Hanya mengisi yang belum ada; isi yang sudah Anda ubah di admin tidak disentuh.
-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).

create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());
alter table public.content_updates enable row level security;
revoke all on public.content_updates from anon, authenticated;

do $upd$
begin
if exists (select 1 from public.content_updates where version = '0.2.2') then
  raise notice 'Pembaruan isi v0.2.2 sudah pernah dijalankan; tidak ada yang diubah.';
  return;
end if;

-- Ruang proyek Biansa: layar desktop dan HP (hanya bila masih kartu merek tanpa gambar)
update public.projects set data = data || jsonb_build_object('layout', 'desk-phone', 'visuals', '[{"role":"desk","image":{"url":"/media/seed/biansa-beranda.webp","alt":{"id":"Beranda Biansa: model memakai outer karamel dalam bingkai lengkung, judul Nyaman itu tidak harus mahal","en":"Biansa homepage: a model in a caramel outer inside an arched frame, headline Nyaman itu tidak harus mahal"},"width":1600,"height":1000}},{"role":"phone","image":{"url":"/media/seed/biansa-hp-produk.webp","alt":{"id":"Halaman produk Outer Piping Espresso versi HP: foto utama dan deretan thumbnail galeri","en":"Outer Piping Espresso product page on phone: main photo and the gallery thumbnails"},"width":600,"height":1300}}]'::jsonb) where id = '5a58e7d3-0970-5cba-8abd-ffb43dc286b5' and data->>'layout' = 'brand-card' and (data->'visuals' is null or data->'visuals' = '[]'::jsonb);

-- Studi kasus Biansa (dicari lewat proyeknya, jadi tetap ketemu bila alamatnya diganti): gambar sampul, hanya bila belum ada
update public.case_studies set data = jsonb_set(data, '{cover}', '{"url":"/media/seed/biansa-beranda.webp","alt":{"id":"Beranda Biansa: model memakai outer karamel dalam bingkai lengkung, dengan judul Nyaman itu tidak harus mahal","en":"Biansa homepage: a model in a caramel outer inside an arched frame, under the headline Nyaman itu tidak harus mahal"},"width":1600,"height":1000}'::jsonb) where project_slug = (select slug from public.projects where id = '5a58e7d3-0970-5cba-8abd-ffb43dc286b5') and (data->'cover' is null or data->'cover' = 'null'::jsonb);

-- Studi kasus Biansa: gambar per fitur, dicocokkan dengan judul fiturnya (hanya fitur yang belum punya gambar)
update public.case_studies c set data = jsonb_set(c.data, '{blocks}', coalesce((
  select jsonb_agg(case when b.value->>'type' = 'features' then jsonb_set(b.value, '{items}', coalesce((
    select jsonb_agg(case when (it.value->'images' is null or it.value->'images' = '[]'::jsonb) and m.pics ? (it.value->'title'->>'id')
      then jsonb_set(it.value, '{images}', m.pics->(it.value->'title'->>'id')) else it.value end order by it.n)
    from jsonb_array_elements(b.value->'items') with ordinality as it(value, n)), b.value->'items', '[]'::jsonb)) else b.value end order by b.n)
  from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n)), c.data->'blocks'))
from (select '{"Etalase yang bisa diatur pemilik":[{"url":"/media/seed/biansa-produk.webp","alt":{"id":"Halaman produk Outer Piping Espresso: galeri foto dengan thumbnail, enam pilihan warna, ukuran XXL habis, dan sisa stok","en":"Outer Piping Espresso product page: photo gallery with thumbnails, six colour options, size XXL sold out, and the stock left"},"width":1600,"height":1144}],"Checkout tanpa akun":[{"url":"/media/seed/biansa-hp-tas.webp","alt":{"id":"Tas belanja di HP: tiga produk dengan ukuran dan jumlahnya, lalu ringkasan","en":"Shopping bag on a phone: three products with their sizes and quantities, then the summary"},"width":600,"height":1300},{"url":"/media/seed/biansa-hp-checkout.webp","alt":{"id":"Checkout tanpa akun di HP: nama, nomor WhatsApp, dan alamat pengiriman","en":"Guest checkout on a phone: name, WhatsApp number and delivery address"},"width":600,"height":1300}],"Pesanan dan stok":[{"url":"/media/seed/biansa-dasbor.webp","alt":{"id":"Dasbor admin Biansa: pendapatan 30 hari, pesanan, produk terjual, stok menipis, terlaris, dan pesanan terbaru","en":"Biansa admin dashboard: 30-day revenue, orders, units sold, low stock, best sellers and latest orders"},"width":1600,"height":1144}],"Isi toko di tangan pemilik":[{"url":"/media/seed/biansa-blog-admin.webp","alt":{"id":"Editor blog di admin: judul, slug, ringkasan, dan gambar sampul tulisan","en":"Blog editor in the admin: the post''s title, slug, summary and cover image"},"width":1600,"height":1000}]}'::jsonb as pics) m
where c.project_slug = (select slug from public.projects where id = '5a58e7d3-0970-5cba-8abd-ffb43dc286b5');

insert into public.content_updates (version) values ('0.2.2');
raise notice 'Pembaruan isi v0.2.2 selesai.';
end
$upd$;
