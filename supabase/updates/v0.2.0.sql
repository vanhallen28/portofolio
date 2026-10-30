-- Pembaruan isi v0.2.0. Dibuat otomatis oleh `npm run seed:sql` — jangan diedit manual.
-- Hanya mengisi yang belum ada; isi yang sudah Anda ubah di admin tidak disentuh.
-- Berjalan sekali saja: menjalankannya lagi tidak mengubah apa pun (dicatat di tabel content_updates).

create table if not exists public.content_updates (version text primary key, applied_at timestamptz not null default now());
alter table public.content_updates enable row level security;
revoke all on public.content_updates from anon, authenticated;

do $upd$
begin
if exists (select 1 from public.content_updates where version = '0.2.0') then
  raise notice 'Pembaruan isi v0.2.0 sudah pernah dijalankan; tidak ada yang diubah.';
  return;
end if;

-- Deretan klien di bawah hero
update public.sections set data = data || jsonb_build_object('clients', '{"visible":true,"title":{"id":"Proyek untuk","en":"Projects for"},"items":[{"name":"Aliya Syifaa","font":"marcellus","uppercase":false,"projectSlug":"aliya-syifaa"},{"name":"Invisual Studio","font":"host","uppercase":false,"projectSlug":"website-invisual"},{"name":"Biansa","font":"marcellus","uppercase":true,"projectSlug":"biansa"},{"name":"Ciri","font":"cormorant","uppercase":true,"projectSlug":"ciri"},{"name":"Internet Bandung","font":"jakarta","uppercase":false,"projectSlug":"internet-bandung"},{"name":"VALE","font":"vale","uppercase":true,"projectSlug":"vale"},{"name":"Loma","font":"loma","uppercase":true,"projectSlug":"loma"}]}'::jsonb) where key = 'hero' and not (data ? 'clients');

-- Riwayat kerja di bagian Tentang
update public.sections set data = data || jsonb_build_object('experienceTitle', '{"id":"Pengalaman","en":"Experience"}'::jsonb, 'experience', '[{"period":{"id":"Sekarang","en":"Present"},"role":{"id":"Studio Manager","en":"Studio Manager"},"org":{"id":"Invisual Studio, Bandung","en":"Invisual Studio, Bandung"},"text":{"id":"Mengurus operasional studio desain sekaligus membangun seluruh sistemnya: website dan CMS, portal klien, dan HRIS yang dipakai 25 orang.","en":"Running a design studio''s operations while building all of its systems: the website and CMS, the client portal, and an HRIS used by 25 people."}},{"period":{"id":"2026","en":"2026"},"role":{"id":"Desainer & pengembang mandiri","en":"Independent designer & developer"},"org":{"id":"Proyek klien","en":"Client projects"},"text":{"id":"Sistem untuk Aliya Syifaa, Biansa, dan Internet Bandung, serta prototipe Ciri dan POINT POS: dari desain tampilan sampai database, pembayaran, dan rilis.","en":"Systems for Aliya Syifaa, Biansa and Internet Bandung, plus the Ciri and POINT POS prototypes: from interface design to database, payments and release."}}]'::jsonb) where key = 'about' and not (data ? 'experience');

-- FAQ: hanya bila masih kosong
update public.sections set data = '{"visible":true,"title":{"id":"Pertanyaan yang sering diajukan","en":"Frequently asked questions"},"items":[{"q":{"id":"Berapa biaya membuat sistem untuk bisnis saya?","en":"How much does a system for my business cost?"},"a":{"id":"Tergantung bagian bisnis mana yang perlu dibuatkan sistem. Setelah obrolan pertama yang gratis, Anda menerima penawaran tertulis dengan rincian per fitur dan jadwalnya, jadi angkanya jelas sebelum pekerjaan dimulai.","en":"It depends on which part of your business needs a system. After a free first chat you get a written quote broken down by feature, with a schedule, so the numbers are clear before any work starts."}},{"q":{"id":"Berapa lama pengerjaannya?","en":"How long does it take?"},"a":{"id":"Fitur dirilis bertahap, jadi Anda sudah bisa mencoba bagian pertama sebelum semuanya selesai. Sebagai gambaran, sistem Aliya Syifaa melewati 19 versi dalam sembilan hari pertama. Perkiraan waktu untuk proyek Anda ada di penawaran.","en":"Features ship in steps, so you can try the first part before everything is finished. For reference, the Aliya Syifaa system went through 19 versions in its first nine days. The estimate for your project is in the quote."}},{"q":{"id":"Apakah saya bisa mengubah isi sendiri tanpa developer?","en":"Can I change the content myself, without a developer?"},"a":{"id":"Bisa. Setiap sistem dilengkapi panel admin untuk mengubah teks, harga, gambar, dan data lainnya, plus panduan berbahasa Indonesia yang bisa diikuti langkah demi langkah.","en":"Yes. Every system comes with an admin panel for text, prices, images and other data, plus a step-by-step guide in Indonesian."}},{"q":{"id":"Bisa terima pembayaran QRIS, virtual account, atau e-wallet?","en":"Can it take QRIS, virtual account or e-wallet payments?"},"a":{"id":"Bisa. Toko dan portal yang saya bangun memakai payment gateway seperti Midtrans dan Xendit, dan status lunas baru berubah setelah pembayarannya terkonfirmasi.","en":"Yes. The stores and portals I build use payment gateways such as Midtrans and Xendit, and an order only counts as paid once the payment is confirmed."}},{"q":{"id":"Sistemnya disimpan di mana? Ada biaya bulanan?","en":"Where is the system hosted? Is there a monthly fee?"},"a":{"id":"Biasanya situsnya di Vercel dan databasenya di Supabase. Biayanya mengikuti paket penyedia dan besarnya trafik, dibayar langsung ke penyedia, dan perkiraannya saya cantumkan di penawaran. Saya sarankan akun-akun itu atas nama bisnis Anda, supaya sistemnya sepenuhnya milik Anda.","en":"Usually the site runs on Vercel and the database on Supabase. The cost follows the provider''s plan and your traffic, is paid to the provider directly, and I include an estimate in the quote. I recommend putting those accounts in your business''s name, so the system is fully yours."}},{"q":{"id":"Bagaimana kalau ada masalah setelah selesai?","en":"What if something breaks after launch?"},"a":{"id":"Setiap perbaikan dikirim sebagai paket update bernomor versi dengan panduan pasangnya, jadi jelas apa yang berubah. Masa dukungan setelah rilis disepakati di penawaran.","en":"Every fix ships as a numbered update package with install steps, so it''s always clear what changed. The support period after launch is agreed in the quote."}}]}'::jsonb where key = 'faq' and coalesce(jsonb_array_length(data->'items'), 0) = 0;

-- Kalimat hasil di ruang proyek
update public.projects set data = data || jsonb_build_object('result', '{"id":"Satu login menggantikan sekitar enam aplikasi langganan yang dulu dipakai terpisah.","en":"One login replaced about six subscription apps the studio used to run separately."}'::jsonb) where id = 'adb2f26d-61cb-549f-894d-957fd98ee546' and not (data ? 'result');
update public.projects set data = data || jsonb_build_object('result', '{"id":"Dimulai dari audit keamanan: 66 uji hak akses yang gagal kini semuanya lolos, sebelum fitur baru ditambahkan.","en":"It started with a security audit: 66 failing access tests now all pass, before any new feature was added."}'::jsonb) where id = 'f93ddd77-c3ef-5bfd-8c21-1c671327edc5' and not (data ? 'result');

-- Warna halaman studi kasus (hanya yang belum punya warna sendiri)
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FBF7F0","ink":"#15241E","muted":"#55635B","accent":"#9E7B36","btnBg":"#15241E","btnInk":"#F8EADA"}'::jsonb) where project_slug = 'aliya-syifaa' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FFF6E0","ink":"#111111","muted":"#4A4F63","accent":"#204DC6","btnBg":"#204DC6","btnInk":"#FFF6E0"}'::jsonb) where project_slug = 'invisual-hris' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#F5F1E9","ink":"#2A241D","muted":"#5F5B45","accent":"#6E6A52","btnBg":"#2A241D","btnInk":"#F5F1E9"}'::jsonb) where project_slug = 'biansa' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FFF4E0","ink":"#110B28","muted":"#4B4766","accent":"#2243CE","btnBg":"#2243CE","btnInk":"#FFF4E0"}'::jsonb) where project_slug = 'portal-klien' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#F6F6F5","ink":"#2F3031","muted":"#5B5F63","accent":"#6B6F73","btnBg":"#2F3031","btnInk":"#F9F9F9"}'::jsonb) where project_slug = 'ciri' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#101011","ink":"#F2F2F2","muted":"#A6A6AC","accent":"#F65294","btnBg":"#F65294","btnInk":"#101011"}'::jsonb) where project_slug = 'website-invisual' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FFF5F9","ink":"#26202E","muted":"#5C5566","accent":"#D8006F","btnBg":"#D8006F","btnInk":"#FFFFFF"}'::jsonb) where project_slug = 'internet-bandung' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FBF8F2","ink":"#2B2620","muted":"#6B6355","accent":"#2F6BFF","btnBg":"#2B2620","btnInk":"#FBF8F2"}'::jsonb) where project_slug = 'point-pos' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#FBEBD6","ink":"#3E2A24","muted":"#6B4A3F","accent":"#817916","btnBg":"#5B3C34","btnInk":"#FED7AB"}'::jsonb) where project_slug = 'vale' and not (data ? 'theme');
update public.case_studies set data = data || jsonb_build_object('theme', '{"wall":"#EEEAE3","ink":"#161513","muted":"#5C5546","accent":"#865F46","btnBg":"#161513","btnInk":"#EEEAE3"}'::jsonb) where project_slug = 'loma' and not (data ? 'theme');

-- Blok Hasil (sebelum → sesudah), disisipkan sebelum blok angka; dilewati bila sudah ada blok Hasil
update public.case_studies c set data = jsonb_set(c.data, '{blocks}', (
  select jsonb_agg(e order by ord) from (
    select b.value as e, b.n * 2 as ord from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n)
    union all
    select '{"type":"results","title":{"id":"Hasilnya","en":"The outcome"},"items":[{"before":"± 6 aplikasi","after":"1 login","label":{"id":"untuk absensi, tugas, chat, dan berkas studio","en":"for attendance, tasks, chat and studio files"}}]}'::jsonb, coalesce((select x.n * 2 - 1 from jsonb_array_elements(c.data->'blocks') with ordinality as x(value, n) where x.value->>'type' = 'numbers' limit 1), 1000000)
  ) s))
where project_slug = 'invisual-hris' and not exists (select 1 from jsonb_array_elements(c.data->'blocks') b where b->>'type' = 'results');
update public.case_studies c set data = jsonb_set(c.data, '{blocks}', (
  select jsonb_agg(e order by ord) from (
    select b.value as e, b.n * 2 as ord from jsonb_array_elements(c.data->'blocks') with ordinality as b(value, n)
    union all
    select '{"type":"results","title":{"id":"Hasilnya","en":"The outcome"},"items":[{"before":"66 gagal","after":"0 gagal","label":{"id":"uji hak akses yang gagal dari 92 di audit awal, setelah diperbaiki","en":"failing access tests out of 92 in the first audit, after the fixes"}}]}'::jsonb, coalesce((select x.n * 2 - 1 from jsonb_array_elements(c.data->'blocks') with ordinality as x(value, n) where x.value->>'type' = 'numbers' limit 1), 1000000)
  ) s))
where project_slug = 'portal-klien' and not exists (select 1 from jsonb_array_elements(c.data->'blocks') b where b->>'type' = 'results');

insert into public.content_updates (version) values ('0.2.0');
raise notice 'Pembaruan isi v0.2.0 selesai.';
end
$upd$;
