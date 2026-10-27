# Portofolio Virgiawan Listanto

Situs portofolio dua bahasa (Indonesia di `/`, English di `/en`) dengan panel admin di `/admin`. Semua teks, gambar, warna ruang, urutan proyek, dan studi kasus bisa diubah dari admin tanpa menyentuh kode.

- **Next.js 16** (App Router), **React 19**, TypeScript
- **Supabase**: database Postgres + login admin + penyimpanan gambar
- **Vercel**: hosting, deploy otomatis setiap `git push`

Versi saat ini ada di `package.json` dan `CHANGELOG.md`. Catatan untuk setiap rilis ada di `docs/updates/BACA-INI-v<versi>.txt`.

---

## Daftar isi

1. [Coba di laptop (5 menit, tanpa Supabase)](#1-coba-di-laptop-5-menit-tanpa-supabase)
2. [Buat proyek Supabase](#2-buat-proyek-supabase)
3. [Jalankan SQL](#3-jalankan-sql)
4. [Buat akun admin](#4-buat-akun-admin)
5. [Hubungkan laptop ke Supabase dan periksa](#5-hubungkan-laptop-ke-supabase-dan-periksa)
6. [Deploy ke Vercel](#6-deploy-ke-vercel)
7. [Memakai panel admin](#7-memakai-panel-admin)
8. [Menambah file preview HTML](#8-menambah-file-preview-html)
9. [Memasang update (zip bernomor versi)](#9-memasang-update-zip-bernomor-versi)
10. [Perintah yang tersedia](#10-perintah-yang-tersedia)
11. [Kalau ada masalah](#11-kalau-ada-masalah)

---

## 1. Coba di laptop (5 menit, tanpa Supabase)

Butuh **Node.js 22.12 atau lebih baru** (cek dengan `node -v`; unduh dari nodejs.org bila perlu).

Pertama kali, dari zip `portofolio-v0.1.0.zip`:

```bash
cd ~/Documents/Virgiawan/PROJECT
git clone https://github.com/vanhallen28/portofolio.git
cd portofolio
unzip -o ~/Downloads/portofolio-v0.1.0.zip -d .
npm install
npm run dev
```

Buka:

- Situs: http://localhost:3000 dan http://localhost:3000/en
- Admin: http://localhost:3000/admin, kata sandi **`portofolio-lokal`**

Tanpa variabel Supabase, situs berjalan dalam **mode lokal**: isi disimpan di file `.data/content.json` di laptop Anda (tidak ikut ke GitHub). Cocok untuk mencoba-coba. Untuk situs sungguhan, lanjutkan ke langkah 2.

Lalu simpan kode ke GitHub. Baris pertama cukup sekali per repo: repo ini berisi file preview yang besar (± 7,5 MB), dan tanpa baris itu `git push` lewat HTTPS bisa gagal dengan `HTTP 400`.

```bash
git config http.postBuffer 524288000
git add -A
git commit -m "v0.1.0: portofolio + panel admin"
git push
```

Pastikan push benar-benar berhasil: baris terakhirnya berbunyi `main -> main`, dan kode terlihat di https://github.com/vanhallen28/portofolio.

## 2. Buat proyek Supabase

1. Buka https://supabase.com/dashboard → **New project**.
2. Name: `portofolio` · Region: **Southeast Asia (Singapore)** · buat Database Password yang kuat (simpan di password manager).
3. Tunggu sampai proyek siap (± 2 menit).

## 3. Jalankan SQL

Di Supabase: **SQL Editor** → **New query**.

1. Salin seluruh isi `supabase/migrations/0001_init.sql`, tempel, klik **Run**. Ini membuat tabel, aturan akses (RLS), dan tempat penyimpanan gambar.
2. Buat query baru, salin seluruh isi `supabase/seed.sql`, tempel, klik **Run**. Ini mengisi semua konten awal (8 proyek dan 8 studi kasus).

Di Mac, cara cepat menyalin isi file ke clipboard:

```bash
pbcopy < supabase/migrations/0001_init.sql
# setelah Run, lanjut:
pbcopy < supabase/seed.sql
```

Bila perlu, kedua file boleh dijalankan ulang: `seed.sql` hanya mengisi baris yang belum ada, jadi tidak menimpa isi yang sudah Anda ubah di admin. Satu pengecualian: proyek awal yang sudah Anda hapus di admin akan muncul lagi. Setelah situs berjalan, cukup ubah isi lewat admin.

## 4. Buat akun admin

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
   Email: `virgiawanlistanto088@gmail.com`, isi kata sandi, centang **Auto Confirm User**, lalu **Create user**.
2. Kembali ke **SQL Editor**, jalankan:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'virgiawanlistanto088@gmail.com'
   on conflict do nothing;
   ```

3. Disarankan: **Authentication** → **Sign In / Providers** → matikan **Allow new users to sign up**, supaya tidak ada orang lain yang bisa membuat akun. (Akun lain tetap tidak bisa mengubah apa pun, karena hanya user di tabel `admins` yang boleh menulis.)

## 5. Hubungkan laptop ke Supabase dan periksa

Supabase → **Project Settings** → **API Keys**. Anda butuh **Project URL** dan **Publishable key** (atau **anon public** key di tab Legacy). **Jangan pakai secret / service_role key.**

```bash
cp .env.example .env.local
open -e .env.local   # isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY, lalu simpan
npm run doctor
```

`npm run doctor` memeriksa variabel, tabel, aturan akses, akun admin, dan penyimpanan gambar, lalu memberi tahu apa yang perlu dibereskan. Bila semua ✓, jalankan `npm run dev` dan masuk ke http://localhost:3000/admin dengan email + kata sandi dari langkah 4.

## 6. Deploy ke Vercel

1. https://vercel.com/new → **Import** repo `vanhallen28/portofolio`. (Bila proyek Vercel-nya sudah ada, jangan Import lagi: langsung ke Settings → Environment Variables, lalu Redeploy.)
2. Framework: Next.js (sudah dikunci oleh file `vercel.json`). Buka **Environment Variables**, tambahkan:

   | Nama | Isi |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari langkah 5 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key dari langkah 5 |
   | `NEXT_PUBLIC_SITE_URL` | Alamat situs, mis. `https://virgiawan.com` (boleh dikosongkan dulu) |

3. Klik **Deploy**. Setelah selesai, buka alamatnya dan `/admin`.
4. Bila memakai domain sendiri: Vercel → Project → **Settings** → **Domains**, lalu perbarui `NEXT_PUBLIC_SITE_URL` dan **Redeploy**.

Setiap `git push` ke `main` otomatis memicu deploy baru. Mengubah variabel lingkungan butuh **Redeploy** (Deployments → ⋯ → Redeploy).

## 7. Memakai panel admin

Masuk di `https://alamat-situs/admin`.

- **Ringkasan**: semua bagian yang bisa diubah dan status setiap proyek.
- **Pengaturan situs**: nama, kontak, WhatsApp, foto profil, **file CV (PDF)**, **tombol WhatsApp yang menempel di HP**, judul & deskripsi untuk Google, bilah info, status ketersediaan.
- **Beranda**: Hero & denah (termasuk **deretan klien**), Karya, Layanan (**harga opsional** per layanan), Cara kerja (**perkiraan waktu** per langkah), Testimoni, Tentang (**riwayat kerja**), FAQ, Kontak, dan Jalur & warna. Setiap teks punya kolom **ID** dan **EN** berdampingan. Testimoni dan FAQ baru tampil di situs setelah sakelar **Tampilkan** aktif dan ada isinya.
- **Proyek**: urutkan ruang (↑ ↓), tayangkan/sembunyikan, tambah, hapus. Halaman edit proyek punya **pratinjau ruang langsung**, **cek keterbacaan warna** (WCAG), dan kolom **Hasil untuk bisnisnya** yang ditonjolkan di ruang.
- **Studi kasus**: susun halaman dari blok (prosa, fitur bergambar, alur bernomor, keputusan penting, **hasil sebelum → sesudah**, angka & stack), atur warna halaman (atau **salin warna ruang proyek**), lalu nyalakan **Tayang**.

Klik **Simpan & tayangkan** (atau tekan ⌘S / Ctrl+S): perubahan langsung tampil di situs. Gambar yang diunggah otomatis dikecilkan dan diubah ke WebP di browser sebelum dikirim.

> Draf studi kasus untuk 7 proyek selain Aliya Syifaa disusun dari kode dan dokumen proyeknya. Baca dan sesuaikan dulu sebelum situs dibagikan. Daftar yang perlu dicek ada di `docs/updates/BACA-INI-v0.1.0.txt`.

## 8. Menambah file preview HTML

File HTML preview proyek (tombol **Preview proyek**, dibuka di tab baru) disimpan di folder `public/preview/`, karena ukurannya bisa besar (Ciri 7,7 MB).

Contoh untuk Portal Klien:

```bash
cp ~/Downloads/portal-klien.html public/preview/portal-klien.html
git add public/preview/portal-klien.html
git commit -m "preview: portal klien"
git push
```

Setelah Vercel selesai deploy: admin → Proyek → Portal Klien → **Link preview proyek** isi `/preview/portal-klien.html` → **Cek link** (harus ✓) → **Simpan & tayangkan**. Kosongkan juga kolom Status "Preview proyek menyusul".

Pastikan file preview tidak memuat data pribadi asli, logo atau nama merek yang tidak boleh dipakai.

## 9. Memasang update (zip bernomor versi)

Setiap update dikirim sebagai **satu zip utuh** bernama `portofolio-vX.Y.Z.zip` (nomor versi selalu naik, jadi file tidak saling tumpuk). Isinya seluruh kode proyek di root zip; `unzip -o` menimpa file lama dengan versi baru.

```bash
cd ~/Documents/Virgiawan/PROJECT/portofolio
unzip -o ~/Downloads/portofolio-vX.Y.Z.zip -d .
npm install
npm run build
git add -A
git commit -m "vX.Y.Z"
git push
```

Selalu baca `docs/updates/BACA-INI-vX.Y.Z.txt` dulu. Di situ tertulis:

- apa yang berubah;
- apakah ada SQL yang harus dijalankan di Supabase (`supabase/migrations/…` untuk struktur, `supabase/updates/vX.Y.Z.sql` untuk mengisi konten baru ke database yang sudah berjalan, tanpa menimpa hasil edit Anda);
- file yang dihapus. `unzip -o` tidak menghapus file lama, jadi perintah `rm` untuk file itu ada di BACA-INI.

Isi yang sudah Anda ubah di admin tersimpan di Supabase, jadi tidak tertimpa oleh update kode.

## 10. Perintah yang tersedia

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Jalankan di laptop (http://localhost:3000) |
| `npm run build` | Build produksi, memastikan tidak ada error |
| `npm run doctor` | Periksa koneksi Supabase, tabel, aturan akses, admin, penyimpanan gambar |
| `npm test` | Uji otomatis: konten, warna, penyimpanan, aturan akses database |
| `npm run test:e2e` | Uji situs + admin di browser (butuh `npm i -D playwright && npx playwright install chromium`) |
| `npm run seed:sql` | Buat ulang `supabase/seed.sql` dari `lib/content/seed.ts` |
| `npm run lint` · `npm run typecheck` | Pemeriksaan kode |
| `npm run release` | Untuk developer: uji semua lalu buat `../rilis/portofolio-v<versi>.zip` |

## 11. Kalau ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Admin bilang "Database belum terhubung" | Variabel Supabase belum diisi di Vercel, atau belum Redeploy setelah diisi. |
| "Email atau kata sandi salah" | Cek di Supabase → Authentication → Users. Bisa reset kata sandi dari menu ⋯ user. |
| "Akun ini belum terdaftar sebagai admin" | Jalankan SQL `insert into public.admins …` di langkah 4. |
| Simpan gagal "tidak tersimpan (sesi admin habis…)" | Keluar lalu masuk lagi. |
| Ada kotak kuning "data tidak valid" di Ringkasan | Data di database rusak (mis. diedit manual). Buka bagian yang disebut, perbaiki, simpan. |
| Tombol Preview membuka halaman 404 | File belum ada di `public/preview/` atau belum di-push. Lihat langkah 8. |
| `git push` gagal: `RPC failed; HTTP 400` | Jalankan `git config http.postBuffer 524288000`, lalu `git push` lagi. Bila masih gagal, tambahkan `git config http.version HTTP/1.1`. |
| Situs Vercel menampilkan `404 NOT_FOUND` (halaman hitam Vercel) | Kode belum sampai di GitHub (cek push di atas), atau proyek Vercel dibuat saat repo masih kosong. Setelah push berhasil, Vercel otomatis deploy ulang; `vercel.json` memastikan Vercel membangunnya sebagai Next.js. Cek di Vercel → Deployments: status harus **Ready**. |
| Peringatan `Next.js ignored package-lock.json in /Users/…` | Ada file `package-lock.json` nyasar di folder home. Tidak berbahaya; sejak v0.1.1 peringatan ini tidak muncul lagi. |
| Upload gambar ditolak | Hanya JPG, PNG, WebP, AVIF, GIF. Jalankan `npm run doctor` untuk memeriksa penyimpanan gambar. |

## Struktur kode (untuk developer)

```
app/(id)/            beranda & studi kasus Indonesia  (/, /karya/[slug])
app/en/              beranda & studi kasus English    (/en, /en/work/[slug])
app/admin/           panel admin (login, form, server actions)
components/site/     komponen situs (Room dipakai juga untuk pratinjau di admin)
components/admin/    komponen form admin
lib/content/         skema (zod), isi awal, penyimpanan: SupabaseStore & LocalStore
lib/motion/site.ts   seluruh animasi (GSAP + ScrollTrigger), mati bila pengunjung memilih "kurangi gerakan"
supabase/            migrasi SQL + seed
public/preview/      file HTML preview proyek
public/media/seed/   gambar awal (WebP, semua data pribadi sudah disamarkan)
tests/               uji unit, SQL (PGlite), end-to-end (Playwright)
```

Keamanan: semua tabel memakai Row Level Security. Pengunjung hanya bisa membaca konten yang tayang; menulis dan mengunggah hanya untuk user di tabel `admins`. Server web tidak memakai secret/service_role key.
