# Catatan perubahan

Format: setiap rilis dikirim sebagai `portofolio-vX.Y.Z.zip`. Nomor versi naik setiap kali, jadi zip tidak pernah saling tumpuk.
Petunjuk pasang per versi: `docs/updates/BACA-INI-vX.Y.Z.txt`.

## v0.1.1 — 28 Oktober 2026

Perbaikan pemasangan.

- `vercel.json` mengunci framework ke Next.js, supaya proyek Vercel yang dibuat saat repo masih kosong tetap membangun situs ini (sebelumnya tampil `404 NOT_FOUND`).
- `turbopack.root` diatur ke folder proyek: peringatan "Next.js ignored package-lock.json in /Users/…" hilang.
- README: langkah `git config http.postBuffer` agar `git push` pertama (± 7,5 MB) tidak gagal `HTTP 400`, dan cara memastikan push berhasil.

## v0.1.0 — 28 Oktober 2026

Rilis pertama.

**Situs**
- Beranda dua bahasa (`/` Indonesia, `/en` English) dengan konsep "Ruang pamer" + "Denah jalur bisnis".
- Denah jalur: 4 jalur (Ditemukan, Menjual, Melayani, Mengelola), 8 stasiun, 2 kereta berjalan, garis menyala saat stasiun disorot.
- 8 ruang karya, masing-masing memakai warna dan huruf klien. Dinding situs berganti warna saat ruang masuk layar, menyebar dari titik denah ruang.
- Filter karya per jalur, denah ruang di sisi kanan, angka fakta menghitung naik.
- Tombol **Preview proyek** membuka file HTML proyek di tab baru (7 file; Portal Klien menyusul).
- Studi kasus per proyek di `/karya/<slug>` dan `/en/work/<slug>`, disusun dari blok.
- Layanan, Cara kerja, Tentang (foto bulat), Kontak; Testimoni dan FAQ tampil otomatis setelah diisi.
- Animasi GSAP dengan satu karakter gerak; mati total bila pengunjung memilih "kurangi gerakan"; isi tetap terbaca tanpa JavaScript.
- SEO: judul & deskripsi per bahasa, hreflang, sitemap, robots, gambar kartu link (WhatsApp/LinkedIn), data Person untuk Google.

**Panel admin** (`/admin`)
- Login email + kata sandi (Supabase Auth, hanya akun di tabel `admins`).
- Semua teks bisa diubah dalam dua bahasa berdampingan; daftar bisa ditambah, diurutkan, dihapus.
- Proyek: urutan, tayang/draf, tambah/hapus, pratinjau ruang langsung, cek keterbacaan warna (WCAG).
- Studi kasus: editor blok (prosa, fitur bergambar, alur, keputusan, angka & stack).
- Upload gambar: dikompres ke WebP di browser (maks. 2400 px, 8 MB), disimpan di Supabase Storage.
- Simpan = langsung tayang. Perubahan tidak hilang saat upload/simpan berjalan; pindah halaman dengan perubahan belum disimpan meminta konfirmasi.

**Fondasi**
- Supabase: 6 tabel dengan Row Level Security, bucket `media`, seed SQL idempoten.
- `npm run doctor` memeriksa seluruh setup Supabase.
- File preview HTML berjalan di sandbox, terpisah dari sesi admin.
- Uji: 43 uji unit & SQL (termasuk aturan akses di Postgres), 19 skenario end-to-end di browser.
