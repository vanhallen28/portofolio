# Catatan perubahan

Format: setiap rilis dikirim sebagai `portofolio-vX.Y.Z.zip`. Nomor versi naik setiap kali, jadi zip tidak pernah saling tumpuk.
Petunjuk pasang per versi: `docs/updates/BACA-INI-vX.Y.Z.txt`.

## v0.2.6 — 29 Oktober 2026

Layar desktop dan HP di setiap ruang karya punya efek gulir sendiri.

- Efeknya mengikuti gulir dua arah: layar masuk saat ruangnya digulir ke layar, dan mundur lagi saat digulir ke atas. Setelah tampil penuh, layar tetap bergerak pelan dengan kedalaman berbeda (HP lebih cepat dari desktop).
- Delapan efek, satu per ruang, disesuaikan dengan proyeknya:
  - **Aliya Syifaa · Gerbang:** layar desktop naik dari bawah melalui bentuk lengkung, HP masuk lembut.
  - **Invisual HRIS · Geser:** panel masuk dari sisi yang berlawanan, lalu terus bergeser berlawanan.
  - **Biansa · Tirai:** layar desktop terbuka dari tengah seperti tirai, HP berayun dari tepi atasnya.
  - **Portal Klien · Kipas:** dua layar HP bertumpuk di tengah lalu menyebar ke tempatnya.
  - **Ciri · Fokus:** dari buram dan dekat menjadi tajam, seperti lensa kamera.
  - **Website Invisual · Putar 3D:** layar desktop terangkat dari tepi bawah, HP berputar menghadap pengunjung.
  - **Internet Bandung · Sinyal:** layar desktop membesar, HP jatuh dan memantul.
  - **POINT POS · Cetak:** layar keluar baris demi baris seperti struk dari printer kasir.
- **Admin → Proyek → Tampilan visual:** pilihan baru "Efek layar saat digulir". "Otomatis" memilih berdasarkan urutan ruang, jadi ruang yang bersebelahan selalu berbeda.
- Database yang sudah berjalan langsung mendapat efek ini tanpa SQL. Dengan urutan ruang sekarang, pilihan "Otomatis" menghasilkan efek yang sama seperti daftar di atas.
- Tanpa efek bila pengunjung memilih gerak dikurangi. Bagian Karya tidak lagi bisa tergeser ke samping di HP saat layar masuk dari tepi.

## v0.2.5 — 29 Oktober 2026

Hero baru bergaya poster. Bagian lain (Karya, ruang berwarna saat digulir, Layanan, dan seterusnya) tidak berubah.

- **Judul poster:** "SISTEM *yang menjalankan* BISNIS ANDA" dalam huruf besar condensed (Anton) dengan frasa miring (Instrument Serif). EN: "SYSTEMS *that run your* BUSINESS". Ukurannya mengikuti lebar layar; di HP kata-katanya bersusun dan baris kedua menjorok.
- **Putaran jalur menimpa judul:** denah empat jalur (Ditemukan, Menjual, Melayani, Mengelola) kini berbentuk putaran lebar yang melingkari kata "ANDA", miring sedikit. Efeknya tetap: garis tergambar saat halaman dibuka, dua kereta berjalan, stasiun membesar saat dilewati. Saat stasiun disorot, nama proyeknya muncul dan jalurnya menyala. Klik stasiun membawa ke ruangnya, klik nama jalur menyaring karya.
- **Garis kolom tipis** di belakang hero (6 kolom, 3 di HP), peran di kiri atas, dan daftar "Yang bisa saya bangun" berhuruf kapital kecil di kanan atas.
- **Lencana bulat** berisi avatar dengan teks berputar "Masuk ke pameran • 8 ruang karya •", menuju Karya. Teks berhenti berputar bila pengunjung memilih gerak dikurangi.
- **Admin → Bagian → Hero:** kartu baru "Judul poster" (baris 1, frasa miring, baris 2, teks kanan atas, teks lencana). "Judul besar" kini bernama "Kalimat utama": tetap dibaca mesin pencari dan pembaca layar, dan tetap dipakai di gambar pratinjau tautan. Kosongkan baris 1 dan 2 untuk kembali ke hero lama.
- Database yang sudah berjalan langsung memakai hero baru tanpa SQL: isi bawaannya terisi otomatis sampai Anda mengubahnya di admin.

## v0.2.4 — 29 Oktober 2026

Avatar karakter di header, foto About di tengah, dan ruang Biansa yang berisi.

- **Avatar karakter menggantikan logo VL** di pojok kiri atas, di beranda dan halaman studi kasus. Lingkaran di belakangnya mengikuti warna ruang yang sedang dibaca: berganti pelan saat Anda menggulir dari satu karya ke karya berikutnya, lalu kembali pink di About, Layanan, dan Kontak. Di halaman studi kasus, warnanya mengikuti warna proyek itu.
- **Ikon tab browser** ikut memakai avatar (lingkaran pink).
- **Foto About di HP** kini di tengah (sebelumnya rata kiri).
- **Ruang Biansa:** kotak "layar di preview" yang kosong di HP dirapikan supaya tidak tampil sebagai lengkungan besar tanpa isi. Layar desktop dan HP Biansa sudah ada sejak v0.2.2, tetapi database yang sudah berjalan baru menampilkannya setelah `supabase/updates/v0.2.2.sql` dijalankan (lihat BACA-INI-v0.2.4).

## v0.2.3 — 29 Oktober 2026

Prototipe POINT POS diperbaiki supaya sesuai dengan studi kasusnya.

- **Lembar opsi menutup** setelah "Tambah" ditekan. Sebelumnya lembar opsi tetap tampil sampai layar diklik lagi, dan mengetuk pilihan di lembar itu bisa memunculkan galat.
- **Kasir mengecek bahan untuk seluruh pesanan.** Sebelumnya tiap baris dicek sendiri-sendiri, jadi beberapa menu yang memakai bahan yang sama (mis. susu) bisa terjual melebihi stok. Sekarang menu yang bahannya tidak cukup ditolak dengan pesan "Bahan tidak cukup", dan pembayaran mengecek sekali lagi.
- **Stock opname:** stok sistem dikunci saat sesi dimulai. Dengan blind count, selisih juga disembunyikan sampai berita acara. Berita acara menampilkan selisih sampai 3 angka di belakang koma (sama seperti stok), memuat semua 6 bahan tanpa perlu digulir, dan stok disesuaikan sebesar selisihnya, jadi penjualan selama penghitungan tetap terpotong. Riwayat sesi kini mencatat jumlah selisih dengan benar (sebelumnya selalu "Semua sesuai").
- **Grafik penjualan per jam** tampil di HP (sebelumnya batangnya rata), dan label jamnya tepat di bawah batangnya.

## v0.2.2 — 28 Oktober 2026

Biansa dengan foto produk asli.

- **Preview Biansa** kini memakai 7 foto produk asli dari Biansa Style di beranda (tiga gaya), katalog, halaman produk, keranjang, wishlist, lookbook, jurnal, dan admin. Foto disimpan sebagai file kecil di `public/preview/biansa/` (± 1 MB total).
- Katalog contoh di preview disesuaikan dengan fotonya: Outer Piping (Espresso, Karamel, Blush), Setelan Peplum (Maroon, Hitam), Setelan Monokrom, Daster Rayon (Navy, Hitam). Halaman produk menampilkan Outer Piping Espresso dengan galeri 4 foto dan 6 pilihan warna. Angka stok, terlaris, dan stok menipis di admin ikut dicocokkan.
- Alamat email dan domain yang mirip asli di preview Biansa diganti alamat contoh.
- **Ruang Biansa** di beranda sekarang menampilkan layar desktop dan HP (sebelumnya kartu merek tanpa layar).
- **Studi kasus Biansa** mendapat gambar sampul dan gambar di tiap fitur: halaman produk, tas belanja dan checkout di HP, dasbor admin, dan editor blog.
- `supabase/updates/v0.2.2.sql`: memasang layar dan gambar Biansa ke database yang sudah berjalan, tanpa menimpa yang sudah Anda ubah di admin; berjalan sekali saja.
- `supabase/seed.sql` yang dijalankan ulang di database yang sudah berisi tidak lagi menandai pembaruan isi (v0.2.0, v0.2.2) sebagai sudah dijalankan, jadi file pembaruannya tetap bisa dipakai.
- Preview Aliya Syifaa: tanggal dan jam di tabel admin tidak lagi menempel ("28 Okt 2026 · 08:00", sebelumnya "28 Okt 202608:00").

## v0.2.1 — 28 Oktober 2026

- Membuka studi kasus lain (kartu "Ruang berikutnya", tombol "Lihat studi kasus" di ruang, atau menu) sekarang selalu mulai dari atas halaman. Sebelumnya halaman baru terbuka di posisi gulir halaman sebelumnya.
- Tombol Back browser tetap kembali ke posisi semula, dan link ke bagian tertentu (mis. Karya) tetap menuju bagiannya.
- Menu header di halaman studi kasus (Karya, Layanan, …) kini berpindah tanpa memuat ulang dan berhenti tepat di bagiannya.
- "Kembali ke atas" di footer kini benar-benar sampai ke paling atas.

## v0.2.0 — 28 Oktober 2026

Tampilan yang membantu pemilik bisnis percaya lalu menghubungi.

**Situs**
- Bilah **Chat WhatsApp** menempel di bawah layar HP; otomatis tersembunyi saat tombol WhatsApp lain (hero, kontak) atau footer sedang terlihat.
- **Deretan klien** di bawah hero: Aliya Syifaa, Invisual Studio, Biansa, Ciri, Internet Bandung, masing-masing dengan huruf mereknya dan menuju ruangnya.
- **Kalimat hasil** di ruang proyek (contoh: HRIS, Portal Klien).
- **FAQ** tampil dengan 6 pertanyaan yang paling sering ditanyakan calon klien (biaya, waktu, ubah isi sendiri, pembayaran, hosting, dukungan).
- **Riwayat kerja** di bagian Tentang, dan tombol **Unduh CV** begitu file PDF diunggah.
- **Harga opsional** per layanan dan **perkiraan waktu** per langkah Cara kerja (tampil bila diisi).
- **Studi kasus berwarna klien**: tujuh halaman lain sekarang memakai warna merek masing-masing, judul mengikuti gaya huruf ruangnya.
- Blok studi kasus baru: **Hasil (sebelum → sesudah)**, dipakai di HRIS dan Portal Klien.
- Testimoni menampilkan inisial berwarna proyek terkait.

**Admin**
- Kolom untuk semua hal di atas, upload **PDF** (CV), editor blok Hasil, tombol **Salin warna ruang proyek**.

**Database**
- Data dari v0.1.x tetap terbaca (kolom baru punya nilai bawaan).
- `supabase/updates/v0.2.0.sql`: mengisi konten baru ke database yang sudah berjalan tanpa menimpa hasil edit; berjalan sekali saja (dicatat di tabel baru `content_updates`).
- Penyimpanan `media` kini menerima PDF (jalankan ulang `0001_init.sql`).

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
