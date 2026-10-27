# Spesifikasi desain — Portofolio Virgiawan Listanto

Tanggal: 27 Oktober 2026 · Status: menunggu tinjauan

## 1. Tujuan

Situs portofolio pribadi yang meyakinkan pemilik bisnis dan UMKM (pembaca utama) bahwa Virgiawan bisa membangun sistem yang menjalankan bisnis mereka. Pembaca kedua adalah recruiter. Situs dibangun dengan Next.js + Supabase, di-deploy di Vercel, dan **seluruh teks, gambar, warna, dan urutan konten bisa diubah dari panel admin** tanpa menyentuh kode.

Acuan visual dan perilaku: `preview.html` yang sudah disetujui (konsep A "Ruang pamer" + B "Denah jalur bisnis", animasi, foto profil bulat, tombol Preview proyek yang membuka tab baru).

## 2. Keputusan yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Atas nama | Pribadi, Virgiawan Listanto. Peran: Studio Manager di Invisual Studio, Bandung |
| Bahasa | Indonesia (default) + English |
| Kode | Repo GitHub baru (mis. `vanhallen28/portofolio`), di-push langsung, di-deploy dari Vercel |
| Database | Proyek Supabase baru khusus portofolio |
| File preview HTML | Disimpan statis di situs (`/preview/<nama>.html`, tanpa batas ukuran). Link tiap proyek diatur di CMS |
| Login admin | Email + kata sandi, satu akun (virgiawanlistanto088@gmail.com) |
| Tidak diceritakan | Cara kerja dengan AI |
| Merek | Internet Bandung tampil tanpa logo/nama operator jaringan (bukan mitra resmi) |
| Data pribadi | Semua screenshot memakai data samaran |

## 3. Struktur situs (publik)

| Alamat | Isi |
|---|---|
| `/` · `/en` | Beranda: hero + denah jalur, 8 ruang karya dengan filter jalur, layanan, cara kerja, testimoni (tampil bila ada isinya), tentang, FAQ (tampil bila ada isinya), kontak |
| `/karya/<slug>` · `/en/work/<slug>` | Studi kasus per proyek (8 proyek; tampil bila status terbit) |
| `/preview/<nama>.html` | File HTML preview proyek (statis), dibuka di tab baru |
| `/admin/...` | Panel CMS (lihat bagian 5) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO dan gambar pratinjau link (WhatsApp, LinkedIn) |

Satu URL per bahasa (bukan sakelar di browser) supaya bisa diindeks mesin pencari. Tombol ID/EN berpindah ke halaman yang sama di bahasa lain.

## 4. Model konten (Supabase / Postgres)

Semua teks yang tampil disimpan dua bahasa dalam satu kolom `jsonb` berbentuk `{ "id": "...", "en": "..." }`. Isi divalidasi dengan skema zod yang sama di server dan di form admin.

| Tabel | Isi utama |
|---|---|
| `site_settings` (1 baris) | Nama, peran, bilah info atas, email, nomor WhatsApp + pesan pembuka, LinkedIn, GitHub, foto profil, teks footer, judul & deskripsi SEO, status ketersediaan (opsional, bisa disembunyikan) |
| `sections` (kunci: `hero`, `works`, `services`, `process`, `testimonials`, `about`, `faq`, `contact`) | Isi tiap bagian beranda dalam `jsonb` terstruktur: judul, paragraf, tombol, daftar layanan, langkah cara kerja, testimoni (kutipan, nama, peran, proyek terkait), keahlian, tanya-jawab. Tiap bagian punya sakelar tampil/sembunyi |
| `lines` (4 jalur) | Nama jalur (Ditemukan/Menjual/Melayani/Mengelola), warna, urutan |
| `projects` | slug, urutan, terbit/tidak, nama, huruf judul (pilihan dari daftar font), gaya judul, keterangan, deskripsi, jalur, 6 warna tema ruang, fakta (angka + label), status, link live + label, link preview, slot stasiun di denah, gambar tampilan ruang (desktop/HP/latar) + alt teks dua bahasa, tata letak visual |
| `case_studies` | 1 per proyek: subjudul, baris label (klien, bidang, peran, tahun), gambar sampul, **blok** berurutan: prosa, "empat pintu"/fitur bergambar, alur bernomor, keputusan penting, angka + stack |
| `admins` | user_id akun admin |
| Storage bucket `media` | Gambar yang di-upload dari admin (publik untuk dibaca) |

**Aturan akses (RLS):** semua orang hanya bisa *membaca* konten yang terbit. Menulis, menghapus, dan upload hanya untuk akun di tabel `admins` (dicek oleh fungsi database `is_admin()`). Kunci service role tidak dipakai di server web.

**Isi awal (seed):** semua konten dari preview masuk lewat file SQL, termasuk draf studi kasus untuk 7 proyek lain yang saya tulis dari kode proyeknya (wajib Anda tinjau sebelum dibagikan). Gambar awal disimpan di `public/media/` sehingga tidak perlu upload apa pun saat pertama deploy.

## 5. Panel admin (CMS)

- **Masuk** `/admin/login` — email + kata sandi Supabase Auth; semua halaman `/admin` dijaga `proxy.ts` dan dicek lagi di setiap server action.
- **Ringkasan** — daftar bagian yang bisa diedit, status terbit tiap proyek, tombol "Lihat situs".
- **Pengaturan situs** — kontak, foto profil, SEO, bilah info, ketersediaan.
- **Beranda** — Hero, Karya (judul & pengantar), Layanan, Cara kerja, Testimoni, Tentang, FAQ, Kontak. Tiap form punya tab **ID | EN** berdampingan dan sakelar tampil/sembunyi.
- **Jalur** — nama dan warna 4 jalur.
- **Proyek** — daftar dengan urutan naik/turun dan sakelar terbit. Form edit proyek:
  - teks dua bahasa, fakta (tambah/hapus/urut), link live & preview;
  - pemilih 6 warna tema dengan **cek kontras WCAG otomatis** (peringatan bila teks sulit dibaca);
  - pilihan font judul dan tata letak visual;
  - upload gambar (dikompres ke WebP di browser sebelum dikirim);
  - **pratinjau ruang langsung** di samping form, memakai komponen yang sama dengan situs.
- **Studi kasus** — editor blok: tambah, ubah, urutkan, hapus blok; sakelar terbit.
- **Simpan** = langsung tayang (Next.js `revalidateTag`), dengan notifikasi berhasil/gagal yang jelas.

Di luar cakupan versi ini (YAGNI): riwayat revisi, banyak admin, blog, statistik buatan sendiri, upload file HTML preview dari admin.

## 6. Arsitektur kode

```
app/
  page.tsx, karya/[slug]/page.tsx      beranda & studi kasus (Indonesia)
  en/page.tsx, en/work/[slug]/page.tsx beranda & studi kasus (English) — memakai komponen yang sama
  admin/…                              CMS (login, ringkasan, form)
  opengraph-image.tsx, sitemap.ts, robots.ts
components/site/   Header, MobileMenu, Hero, TransitMap, Room, Works, Services, Process, Testimonials, About, Faq, Contact, CaseStudy
components/motion/ MotionProvider (GSAP + ScrollTrigger + useGSAP), WallWipe, CountUp, SplitWords
components/admin/  LocalizedField, ColorThemeField (+ kontras), FactsField, ImageField, BlockEditor, RoomPreview
lib/content/       schema.ts (zod), types.ts, store.ts (antarmuka), supabase-store.ts, local-store.ts, seed.ts
lib/               contrast.ts, i18n.ts, supabase/{server,client}.ts
public/preview/    7 file HTML preview (Portal Klien menyusul)
public/media/      gambar awal (WebP)
public/fonts/      file font lokal (woff2)
supabase/          migrations/0001_init.sql, seed.sql
proxy.ts           jaga /admin (sesi Supabase) dan segarkan cookie sesi
```

- **Satu antarmuka data, dua penyimpanan.** Situs dan admin hanya bicara ke `ContentStore`. `SupabaseStore` dipakai di produksi. `LocalStore` (file JSON) hanya aktif saat pengembangan tanpa variabel Supabase, sehingga situs dan admin bisa dicoba tanpa database. Pola ini sama dengan Stokku/POINT.
- **Halaman publik dirender di server** dan di-cache per tag `content`; simpan dari admin membersihkan cache itu.
- **Font lokal** lewat `next/font/local` (tanpa ketergantungan Google Fonts saat build).
- **CSS biasa (bukan Tailwind)** dipindahkan dari preview supaya tampilan identik, dibagi per komponen.

## 7. Animasi

Memindahkan sistem gerak preview apa adanya ke komponen klien:
- **Hero:** kata naik dari mask, denah tergambar, 2 kereta beredar;
- **Antarruang:** wipe lingkaran dari titik denah; layar masuk dari kedalaman dengan parallax;
- **Angka:** menghitung naik;
- **Layanan & cara kerja:** garis tergambar;
- **Tentang:** foto terbuka seperti iris;
- **Kontak:** kata demi kata.

Prinsip yang dipertahankan:
- Satu kepribadian gerak (tenang, tanpa pantulan pada konten).
- `prefers-reduced-motion` mematikan semua animasi.
- Animasi berhenti di luar layar.
- Konten tetap terbaca bila JavaScript gagal.

Di admin, animasi dipakai seperlunya: transisi form dan notifikasi.

## 8. Kualitas & aksesibilitas

- **Aksesibilitas:** kontras AA, fokus keyboard terlihat, skip link, alt teks dua bahasa, heading berurutan, target sentuh ≥ 44 px.
- **Tampilan dan performa:**
  - lolos di 390 px dan desktop, mode terang/gelap;
  - gambar WebP, lazy load;
  - Lighthouse target ≥ 90 untuk Performance, Accessibility, Best Practices, dan SEO.
- **Keamanan:**
  - RLS di semua tabel;
  - validasi zod di server action;
  - upload hanya gambar dengan batas ukuran;
  - header keamanan standar.

## 9. Pengujian

- **Unit (Vitest):** skema konten, cek kontras, konversi seed, helper i18n.
- **SQL:** migrasi dan aturan RLS diuji di Postgres lokal (PGlite). Yang diuji: publik tidak bisa menulis, admin bisa, dan konten tidak terbit tidak terbaca publik.
- **End-to-end (Playwright, mode LocalStore):**
  - beranda ID/EN dan pindah bahasa;
  - filter jalur;
  - tombol Preview membuka tab baru ke file yang benar;
  - studi kasus;
  - menu HP;
  - reduced-motion;
  - login admin → ubah teks hero → tampil di beranda;
  - ubah warna proyek dengan peringatan kontras;
  - upload gambar.
- **Build produksi** `next build` harus bersih (TypeScript + lint).

## 10. Serah terima

`README.md` berbahasa Indonesia dengan perintah siap salin (seperti proyek Aliya Syifaa):
1. buat proyek Supabase;
2. jalankan SQL;
3. buat akun admin;
4. isi variabel lingkungan di Vercel;
5. hubungkan repo;
6. cara menambah file preview baru.

Disertai `npm run doctor` untuk memeriksa variabel lingkungan dan koneksi database.

## 11. Bahan yang masih menunggu dari Anda (tidak menghalangi pembangunan)

- **Untuk diisi lewat CMS:**
  - testimoni klien;
  - angka hasil nyata per proyek;
  - jawaban FAQ;
  - status ketersediaan.
- **File HTML preview Portal Klien:** ditambahkan saat dikirim.
- **Konfirmasi angka yang tampil:** 25 pengguna HRIS, 19 versi dalam 9 hari, Biansa di Tasikmalaya.
