import type { CaseStudy } from "./types";

/**
 * Draft case studies for seven projects, written from the project notes.
 * All personal data in screenshots is fictional. Review before publishing.
 */
export const SEED_CASES: CaseStudy[] = [
  // 1. Invisual HRIS
  {
    projectSlug: "invisual-hris",
    published: true,
    subtitle: {
      id: "Satu portal internal untuk 25 orang di studio desain, dari absen pagi sampai slip gaji.",
      en: "One internal portal for a design studio's 25 people, from the morning clock-in to the payslip.",
    },
    labels: {
      client: "Invisual Studio",
      field: { id: "Studio desain visual", en: "Visual design studio" },
      role: { id: "Desain, pengembangan, database, rilis", en: "Design, development, database, release" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/hris-dasbor.webp",
      alt: {
        id: "Dasbor HR: jumlah karyawan hadir, terlambat, dan WFH, dengan log absensi live",
        en: "HR dashboard: counts of staff present, late and working from home, with a live attendance log",
      },
      width: 1600,
      height: 903,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Invisual Studio adalah studio desain visual di Bandung dengan sekitar 25 orang, dan saya bekerja di sana sebagai Studio Manager. Absensi, tugas, obrolan tim, dan berkas studio dulu tersebar di sekitar enam aplikasi langganan yang terpisah, jadi saya membangun satu portal untuk menggantikannya.",
            en: "Invisual Studio is a visual design studio in Bandung with about 25 people, and I work there as Studio Manager. Attendance, tasks, team chat and studio files used to live in about six separate subscription apps, so I built one portal to replace them.",
          },
          {
            id: "Aturannya harus mengikuti cara kerja di Indonesia: periode gaji tanggal 21 sampai 20, libur nasional dan cuti bersama sesuai SKB 3 Menteri, izin WFH dan WFC, izin terlambat, dan lembur yang ditukar menjadi libur pengganti. Semua jam dihitung dalam WIB.",
            en: "The rules had to match how work runs in Indonesia: a pay period from the 21st to the 20th, national holidays and collective leave set by joint ministerial decree, remote-work and late-arrival permissions, and overtime traded for time off in lieu. Every hour runs on Jakarta time.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Satu login untuk seluruh studio", en: "One login for the whole studio" },
        items: [
          {
            title: { id: "Absensi dengan selfie dan lokasi", en: "Attendance with a selfie and location" },
            text: {
              id: "Karyawan absen masuk dan pulang dengan selfie, dan sistem mencocokkan lokasinya dengan area yang ditentukan. HR melihat siapa yang hadir, terlambat, atau WFH saat itu juga, lengkap dengan heatmap timesheet, kalender cuti, dan daftar kejanggalan.",
              en: "Staff clock in and out with a selfie, and the system checks their location against a set area. HR sees who is in, late or working from home as it happens, with a timesheet heatmap, a leave calendar and a list of anomalies.",
            },
            images: [
              {
                url: "/media/seed/hris-heatmap.webp",
                alt: {
                  id: "Timesheet heatmap: kehadiran harian setiap karyawan untuk periode 21 Oktober sampai 20 November",
                  en: "Timesheet heatmap: each employee's daily attendance for the 21 October to 20 November period",
                },
                width: 1600,
                height: 887,
              },
            ],
          },
          {
            title: { id: "Payroll periode 21 sampai 20", en: "Payroll on the 21st-to-20th cycle" },
            text: {
              id: "Gaji disusun per periode dan melewati tiga tahap: draf, final, lalu kirim. Slip gaji PDF terkirim ke email karyawan dan bisa diunduh lagi dari profil masing-masing. Pengumuman juga bisa dikirim massal lewat email atau WhatsApp.",
              en: "Payroll runs per period through three stages: draft, final, then send. PDF payslips go to each employee's email and can be downloaded again from their profile. Announcements can go out in bulk by email or WhatsApp.",
            },
            images: [],
          },
          {
            title: { id: "Tugas, chat, dan kanvas bersama", en: "Tasks, chat and a shared canvas" },
            text: {
              id: "Task tracker menampilkan pekerjaan sebagai tabel, Kanban, kalender, beban kerja, atau timeline. Chat tim punya channel, panggilan suara dan video, serta berbagi layar. Di kanvas desain, beberapa orang bisa menggambar dan berkomentar di file yang sama pada waktu yang sama.",
              en: "The task tracker shows work as a table, Kanban board, calendar, workload view or timeline. Team chat has channels, voice and video calls and screen sharing. On the design canvas, several people can draw and comment on the same file at the same time.",
            },
            images: [],
          },
          {
            title: { id: "Keuangan dan arsip studio", en: "Studio finance and records" },
            text: {
              id: "Pemilik mencatat transaksi, pendapatan, dan anggaran per kategori, lalu membaca laporannya di modul yang sama. Peringatan muncul saat satu kategori melewati 80% anggarannya. Dokumen perusahaan, email, dan daftar langganan software tersimpan di satu arsip.",
              en: "The owner records transactions, income and budgets by category, then reads the reports in the same module. An alert appears when a category passes 80% of its budget. Company documents, email and the list of software subscriptions sit in one archive.",
            },
            images: [
              {
                url: "/media/seed/hris-keuangan.webp",
                alt: {
                  id: "Ringkasan keuangan studio: pemasukan, pengeluaran, laba rugi, saldo kumulatif, peringatan anggaran, dan tren 6 bulan",
                  en: "Studio finance summary: income, expenses, profit and loss, running balance, budget alerts and a six-month trend",
                },
                width: 1600,
                height: 901,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Satu periode kerja", en: "One working period" },
        steps: [
          { id: "Karyawan absen masuk dengan selfie", en: "Staff clock in with a selfie" },
          { id: "HR menyetujui izin WFH, cuti, dan terlambat dari satu antrean", en: "HR approves remote work, leave and late requests from one queue" },
          { id: "Tim mengerjakan tugas dan menyetor bukti kerja harian di chat", en: "The team works through tasks and posts daily proof of work in chat" },
          { id: "Lembur tercatat dan menjadi jatah libur pengganti", en: "Overtime is logged and turns into time off in lieu" },
          { id: "Di akhir periode, payroll difinalkan dan slip gaji terkirim", en: "At the end of the period, payroll is finalised and payslips go out" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Gaji hanya terlihat oleh yang berhak", en: "Salaries stay with the people who need them" },
            text: {
              id: "Data gaji disembunyikan dari daftar karyawan, jadi rekan kerja tidak bisa melihat gaji satu sama lain. Ini salah satu perbaikan dari audit keamanan Oktober 2026.",
              en: "Salary data is hidden from the staff directory, so colleagues can't see each other's pay. It's one of the fixes from the October 2026 security audit.",
            },
          },
          {
            title: { id: "Selfie absen tidak disimpan selamanya", en: "Attendance selfies don't stay forever" },
            text: {
              id: "Foto selfie disimpan di folder tertutup, hanya bisa dibuka lewat link yang kedaluwarsa dalam satu jam, dan terhapus otomatis setelah tujuh hari. Bukti kerja harian di chat terhapus sendiri setelah 30 hari.",
              en: "Selfies sit in a private folder, open only through links that expire within an hour, and are deleted automatically after seven days. Daily proof-of-work screenshots in chat delete themselves after 30 days.",
            },
          },
          {
            title: { id: "Periode gaji yang sudah final terkunci", en: "Finalised pay periods are locked" },
            text: {
              id: "Setelah payroll difinalkan, database menolak perubahan apa pun pada periode itu. Angka di slip yang sudah terkirim selalu sama dengan angka di sistem.",
              en: "Once payroll is finalised, the database refuses any change to that period. The figures on a payslip that has gone out always match the system.",
            },
          },
          {
            title: { id: "Akses mengikuti peran", en: "Access follows the role" },
            text: {
              id: "Ada lima peran: HR atau admin, pemilik, manajer tracker, anggota tim, dan freelancer. Freelancer hanya bisa memakai chat, dan karyawan hanya bisa mengirim pesan pribadi ke HR atau manajer.",
              en: "There are five roles: HR or admin, owner, tracker manager, team member and freelancer. Freelancers can only use chat, and staff can only send direct messages to HR or a manager.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "25", label: { id: "orang memakainya setiap hari", en: "people use it every day" } },
          { value: "8", label: { id: "modul di balik satu login", en: "modules behind one login" } },
          { value: "5", label: { id: "peran pengguna dengan akses berbeda", en: "user roles with different access" } },
        ],
        stack: {
          id: "Dibangun dengan Next.js, React, TypeScript, Supabase (PostgreSQL), LiveKit untuk panggilan suara dan video, PWA, Vercel.",
          en: "Built with Next.js, React, TypeScript, Supabase (PostgreSQL), LiveKit for voice and video calls, PWA, Vercel.",
        },
      },
    ],
  },

  // 2. Biansa
  {
    projectSlug: "biansa",
    published: true,
    subtitle: {
      id: "Toko online milik sendiri untuk label sleepwear lokal di Tasikmalaya, dari katalog sampai pembayaran.",
      en: "An online store of its own for a local sleepwear label in Tasikmalaya, from catalogue to payment.",
    },
    labels: {
      client: "Biansa Style",
      field: { id: "Fesyen sleepwear dan daily wear", en: "Sleepwear and daily-wear fashion" },
      role: { id: "Desain, pengembangan, database, pembayaran", en: "Design, development, database, payments" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/biansa-beranda.webp",
      alt: {
        id: "Beranda Biansa: model memakai outer karamel dalam bingkai lengkung, dengan judul Nyaman itu tidak harus mahal",
        en: "Biansa homepage: a model in a caramel outer inside an arched frame, under the headline Nyaman itu tidak harus mahal",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Biansa Style adalah label sleepwear dan daily wear di Tasikmalaya: kimono, daster, dan piyama seharga Rp 65 ribu sampai Rp 445 ribu. Pemiliknya ingin toko sendiri, bukan lapak marketplace, dengan cara bayar yang biasa dipakai pembeli Indonesia dan isi toko yang bisa diubah tanpa developer.",
            en: "Biansa Style is a sleepwear and daily-wear label in Tasikmalaya: kimonos, house dresses and pyjamas priced from Rp 65,000 to Rp 445,000. The owner wanted a store of their own rather than a marketplace listing, with the payment methods Indonesian shoppers already use and content they can change without a developer.",
          },
          {
            id: "Toko ini berawal dari POINT Store, template toko yang saya bangun dari tujuh layar arah visual. Merek Biansa dipasang dengan mengubah satu file, tanpa membongkar kode lainnya. Tokonya belum tayang dan sedang menunggu keputusan klien.",
            en: "The store started as POINT Store, a shop template I built from seven visual-direction screens. Biansa's branding went in by editing a single file, without touching the rest of the code. The store isn't live yet and is waiting on the client's decision.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Etalase dan dapur toko", en: "Storefront and back office" },
        items: [
          {
            title: { id: "Etalase yang bisa diatur pemilik", en: "A storefront the owner can shape" },
            text: {
              id: "Pemilik memilih satu dari empat gaya beranda: editorial, etalase, marquee, atau mozaik. Pembeli menyaring dan mengurutkan produk, melihat galeri foto dan pilihan warna, tahu ukuran mana yang habis, dan membuka panduan ukuran tanpa pindah halaman.",
              en: "The owner picks one of four homepage styles: editorial, shop window, marquee or mosaic. Shoppers filter and sort products, browse the photo gallery and colour options, see which sizes are sold out, and open the size guide without leaving the page.",
            },
            images: [
              {
                url: "/media/seed/biansa-produk.webp",
                alt: {
                  id: "Halaman produk Outer Piping Espresso: galeri foto dengan thumbnail, enam pilihan warna, ukuran XXL habis, dan sisa stok",
                  en: "Outer Piping Espresso product page: photo gallery with thumbnails, six colour options, size XXL sold out, and the stock left",
                },
                width: 1600,
                height: 1144,
              },
            ],
          },
          {
            title: { id: "Checkout tanpa akun", en: "Guest checkout" },
            text: {
              id: "Pembeli bisa checkout tanpa membuat akun, lalu membayar lewat virtual account, GoPay, ShopeePay, atau QRIS. Transfer bank manual juga diterima dan ditandai lunas oleh admin. Harga sudah termasuk PPN 11%, dan setiap pesanan bisa dilacak lewat timeline status.",
              en: "Shoppers can check out without an account and pay by virtual account, GoPay, ShopeePay or QRIS. Manual bank transfers work too, marked as paid by the admin. Prices include 11% VAT, and every order can be followed on a status timeline.",
            },
            images: [
              {
                url: "/media/seed/biansa-hp-tas.webp",
                alt: {
                  id: "Tas belanja di HP: tiga produk dengan ukuran dan jumlahnya, lalu ringkasan",
                  en: "Shopping bag on a phone: three products with their sizes and quantities, then the summary",
                },
                width: 600,
                height: 1300,
              },
              {
                url: "/media/seed/biansa-hp-checkout.webp",
                alt: {
                  id: "Checkout tanpa akun di HP: nama, nomor WhatsApp, dan alamat pengiriman",
                  en: "Guest checkout on a phone: name, WhatsApp number and delivery address",
                },
                width: 600,
                height: 1300,
              },
            ],
          },
          {
            title: { id: "Pesanan dan stok", en: "Orders and stock" },
            text: {
              id: "Admin menyaring pesanan menurut tahap: belum bayar, perlu dibuat, perlu dikirim, dan terkirim, lalu mengisi nomor resi. Stok bisa diisi massal dari file Excel, dengan pratinjau sebelum disimpan. Dasbor menampilkan omzet, jumlah terjual, dan stok menipis.",
              en: "The admin filters orders by stage: unpaid, to make, to ship and shipped, then adds the tracking number. Stock can be bulk-imported from an Excel file, with a preview before saving. The dashboard shows revenue, units sold and low stock.",
            },
            images: [
              {
                url: "/media/seed/biansa-dasbor.webp",
                alt: {
                  id: "Dasbor admin Biansa: pendapatan 30 hari, pesanan, produk terjual, stok menipis, terlaris, dan pesanan terbaru",
                  en: "Biansa admin dashboard: 30-day revenue, orders, units sold, low stock, best sellers and latest orders",
                },
                width: 1600,
                height: 1144,
              },
            ],
          },
          {
            title: { id: "Isi toko di tangan pemilik", en: "Content in the owner's hands" },
            text: {
              id: "Pemilik mengubah beranda, halaman, dan blog sendiri. Pajak, ongkir, dan promo diatur dengan pratinjau keranjang yang langsung berubah, dan 200 aksi admin terakhir tercatat di log audit.",
              en: "The owner edits the homepage, pages and blog directly. Tax, shipping and promos are set with a live cart preview, and the last 200 admin actions are kept in an audit log.",
            },
            images: [
              {
                url: "/media/seed/biansa-blog-admin.webp",
                alt: {
                  id: "Editor blog di admin: judul, slug, ringkasan, dan gambar sampul tulisan",
                  en: "Blog editor in the admin: the post's title, slug, summary and cover image",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Perjalanan satu pesanan", en: "The life of an order" },
        steps: [
          { id: "Pembeli memilih produk, warna, dan ukuran", en: "A shopper picks a product, colour and size" },
          { id: "Checkout tanpa akun dan bayar lewat VA, e-wallet, atau QRIS", en: "They check out as a guest and pay by VA, e-wallet or QRIS" },
          { id: "Payment gateway mengonfirmasi, pesanan berubah lunas", en: "The payment gateway confirms and the order turns paid" },
          { id: "Admin membuat dan mengirim pesanan, lalu mengisi nomor resi", en: "The admin makes and ships the order, then adds the tracking number" },
          { id: "Pembeli memantau status pesanan dari halaman pelacakan", en: "The shopper follows the order on its tracking page" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Harga selalu dihitung ulang di server", en: "Prices are always recalculated on the server" },
            text: {
              id: "Harga di keranjang pembeli tidak pernah dipakai mentah-mentah. Setiap checkout menghitung ulang harga dan total di server, jadi harga tidak bisa diakali dari browser.",
              en: "The prices in a shopper's cart are never taken at face value. Every checkout recalculates prices and totals on the server, so nobody can tamper with them from the browser.",
            },
          },
          {
            title: { id: "Status lunas hanya dari payment gateway", en: "Only the payment gateway can mark an order paid" },
            text: {
              id: "Pesanan baru dianggap lunas setelah payment gateway mengonfirmasi. Konfirmasinya dicek keasliannya, tidak bisa diproses dua kali, nominalnya harus sama dengan total pesanan, dan status hanya bisa maju, tidak mundur.",
              en: "An order only counts as paid once the payment gateway confirms it. Each confirmation is checked for authenticity, can't be processed twice, must match the order total exactly, and can only move the status forward.",
            },
          },
          {
            title: { id: "Stok tercatat sebagai riwayat", en: "Stock is kept as a history" },
            text: {
              id: "Angka stok tidak pernah ditimpa begitu saja. Setiap barang masuk dan keluar tercatat, jadi selisih stok selalu bisa ditelusuri ke pesanan, impor, atau penyesuaian admin.",
              en: "Stock figures are never simply overwritten. Every item in and out is recorded, so any difference can be traced back to an order, an import or an admin adjustment.",
            },
          },
          {
            title: { id: "Pembaruan tidak menimpa isi pemilik", en: "Updates don't overwrite the owner's edits" },
            text: {
              id: "Alat pembaruan membandingkan versi lama, versi baru, dan versi milik toko sebelum memasang apa pun. Bagian yang sudah diubah pemilik tidak ditimpa, dan foto toko tidak disentuh.",
              en: "The update tool compares the old version, the new version and the store's own copy before installing anything. Parts the owner has changed stay as they are, and the store's photos are left alone.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "34", label: { id: "halaman toko dan admin", en: "store and admin pages" } },
          { value: "4", label: { id: "gaya beranda pilihan pemilik", en: "homepage styles the owner can pick" } },
          { value: "4", label: { id: "lapis cek sebelum status lunas", en: "checks before an order counts as paid" } },
          { value: "5", label: { id: "cara bayar, termasuk transfer manual", en: "ways to pay, including manual transfer" } },
        ],
        stack: {
          id: "Dibangun dengan Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Midtrans, Cloudinary.",
          en: "Built with Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Midtrans, Cloudinary.",
        },
      },
    ],
  },

  // 3. Portal Klien
  {
    projectSlug: "portal-klien",
    published: true,
    subtitle: {
      id: "Portal tempat klien studio desain mengikuti proyek, menyetujui draf, dan membayar tagihan dari HP.",
      en: "A portal where a design studio's clients follow their project, approve drafts and pay invoices from their phone.",
    },
    labels: {
      client: "Invisual Studio",
      field: { id: "Studio desain visual", en: "Visual design studio" },
      role: { id: "Desain, pengembangan, database, rilis", en: "Design, development, database, release" },
      year: "2026",
    },
    cover: null,
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Invisual Studio mengerjakan identitas visual, ilustrasi, dan kemasan untuk banyak klien sekaligus. Tanpa satu tempat bersama, draf, revisi, kontrak, dan tagihan tercecer di WhatsApp, email, dan Drive, dan klien sulit tahu proyeknya sudah sampai mana atau apa yang perlu mereka lakukan berikutnya.",
            en: "Invisual Studio handles visual identity, illustration and packaging for many clients at once. Without one shared place, drafts, revisions, contracts and invoices get scattered across WhatsApp, email and Drive, and clients struggle to tell where their project stands or what they need to do next.",
          },
          {
            id: "Pekerjaan saya di portal ini berawal dari audit keamanan. Data di 11 tabel belum dibatasi menurut siapa yang boleh melihatnya, dan 66 dari 92 uji hak akses gagal. Setelah diperbaiki, semuanya lolos. Dari situ portalnya tumbuh lewat puluhan paket fitur menjadi alur kerja studio yang utuh.",
            en: "My work on the portal began with a security audit. Data in 11 tables had no limits on who could see it, and 66 of 92 access tests failed. After the fixes, every test passed. From there the portal grew through dozens of feature batches into the studio's full workflow.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Dua sisi, satu proyek", en: "Two sides, one project" },
        items: [
          {
            title: { id: "Beranda klien", en: "Client home" },
            text: {
              id: "Klien langsung melihat status proyek dan satu langkah berikutnya yang perlu mereka ambil. Ada hitung mundur batas feedback 48 jam, sisa kuota revisi, jadwal tahapan, tanda tangan kontrak, dan laporan PDF.",
              en: "Clients see the project status and the one next step they need to take. There's a countdown for the 48-hour feedback window, the revisions left, a stage timeline, contract signing and a PDF report.",
            },
            images: [
              {
                url: "/media/seed/portal-top.webp",
                alt: {
                  id: "Beranda portal klien di HP: status proyek dan kartu proyek dengan target selesai",
                  en: "Client portal home on a phone: project status and a project card with its target date",
                },
                width: 640,
                height: 1023,
              },
              {
                url: "/media/seed/portal-progres.webp",
                alt: {
                  id: "Lima tahap progres proyek, batas feedback 48 jam, sisa revisi, dan menu tanda tangan kontrak di HP",
                  en: "Five project stages, the 48-hour feedback window, revisions left and the contract signing menu, on a phone",
                },
                width: 640,
                height: 1015,
              },
            ],
          },
          {
            title: { id: "Draf dan revisi", en: "Drafts and revisions" },
            text: {
              id: "Klien menyetujui draf atau meminta revisi mayor atau minor, menaruh catatan langsung di titik gambar, dan membandingkan dua versi dengan slider. Catatan revisi yang panjang diringkas otomatis menjadi paling banyak enam poin, dan file final diunduh dalam satu ZIP.",
              en: "Clients approve a draft or ask for a major or minor revision, pin notes right on the artwork, and compare two versions with a slider. Long revision notes are summarised automatically into six points at most, and final files download as one ZIP.",
            },
            images: [],
          },
          {
            title: { id: "Tagihan dan chat", en: "Invoices and chat" },
            text: {
              id: "Tagihan dibayar lewat QRIS, virtual account, atau e-wallet, atau dengan mengunggah bukti transfer, lalu bisa dicetak sebagai PDF. Chat dengan studio punya terjemahan otomatis Indonesia dan Inggris, jadi klien dan tim bisa menulis dalam bahasa masing-masing.",
              en: "Invoices are paid by QRIS, virtual account or e-wallet, or by uploading proof of transfer, and print as PDFs. Chat with the studio has automatic Indonesian-English translation, so clients and the team can each write in their own language.",
            },
            images: [],
          },
          {
            title: { id: "Ruang kerja studio", en: "The studio's workspace" },
            text: {
              id: "Tim studio memindahkan proyek di papan Kanban: briefing dan MoU, desain, review dan revisi, lalu selesai. Halaman ringkasan menampilkan piutang, pendapatan bulanan, tagihan lewat jatuh tempo, dan fokus hari ini, lengkap dengan tombol pengingat ke klien.",
              en: "The studio team moves projects across a Kanban board: briefing and MoU, design, review and revision, then done. The overview shows receivables, monthly revenue, overdue invoices and today's focus, with a button to send the client a reminder.",
            },
            images: [],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Alur satu proyek", en: "How a project runs" },
        steps: [
          { id: "Studio membuka proyek dan klien menandatangani kontrak di portal", en: "The studio opens the project and the client signs the contract in the portal" },
          { id: "Studio mengunggah draf, klien mendapat notifikasi di aplikasi, email, dan HP", en: "The studio uploads a draft and the client is notified in the app, by email and on their phone" },
          { id: "Klien menyetujui atau meminta revisi dalam batas 48 jam", en: "The client approves or asks for revisions within 48 hours" },
          { id: "Studio merevisi, dan sisa kuota revisi terlihat oleh kedua pihak", en: "The studio revises, and both sides can see how many revisions are left" },
          { id: "Klien membayar tagihan dan mengunduh file final", en: "The client pays the invoice and downloads the final files" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Ruang studio hanya untuk email studio", en: "The studio side is for studio emails only" },
            text: {
              id: "Akses ke ruang studio dicek dengan aturan yang sama di aplikasi dan di database. Alamat email yang sekadar meniru domain studio ditolak, jadi orang luar tidak bisa masuk ke data seluruh klien.",
              en: "Access to the studio side is checked by the same rule in the app and in the database. An email address that merely imitates the studio's domain is rejected, so outsiders can't reach every client's data.",
            },
          },
          {
            title: { id: "Link persetujuan bisa dicabut", en: "Approval links can be revoked" },
            text: {
              id: "Pihak klien yang tidak punya akun, misalnya atasan yang harus menyetujui, bisa membuka draf lewat link rahasia. Link itu kedaluwarsa dalam 14 hari dan bisa dicabut studio kapan saja.",
              en: "People on the client's side without an account, such as a manager who has to sign off, can open the draft through a private link. The link expires after 14 days and the studio can revoke it at any time.",
            },
          },
          {
            title: { id: "Lunas setelah payment gateway mengonfirmasi", en: "Paid only when the payment gateway confirms" },
            text: {
              id: "Tagihan baru berubah lunas setelah payment gateway mengonfirmasi pembayaran. Konfirmasi yang tidak membawa kode rahasia studio ditolak, jadi status lunas tidak bisa dipalsukan.",
              en: "An invoice only turns paid after the payment gateway confirms the payment. Confirmations without the studio's secret code are rejected, so nobody can fake a paid status.",
            },
          },
          {
            title: { id: "Setiap bug punya tes sendiri", en: "Every bug gets its own test" },
            text: {
              id: "Setiap bug yang pernah ditemukan diberi tes dengan namanya sendiri supaya tidak muncul lagi, dan 145 skenario hak akses diuji langsung di database.",
              en: "Every bug ever found gets a named test so it can't come back, and 145 access scenarios are tested directly against the database.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "145", label: { id: "skenario hak akses kini diuji otomatis", en: "access scenarios now tested automatically" } },
          { value: "3", label: { id: "cara bayar online: QRIS, VA, e-wallet", en: "ways to pay online: QRIS, VA, e-wallet" } },
          { value: "14", label: { id: "hari masa berlaku link persetujuan", en: "days an approval link stays valid" } },
          { value: "4", label: { id: "tahap di papan Kanban studio", en: "stages on the studio's Kanban board" } },
        ],
        stack: {
          id: "Dibangun dengan Next.js, React, TypeScript, Supabase (PostgreSQL), Xendit, Resend, PWA.",
          en: "Built with Next.js, React, TypeScript, Supabase (PostgreSQL), Xendit, Resend, PWA.",
        },
      },
    ],
  },

  // 4. Ciri
  {
    projectSlug: "ciri",
    published: true,
    subtitle: {
      id: "Arah visual dan prototipe toko online untuk koleksi perhiasan perak AG925, kini dalam review klien.",
      en: "Visual direction and an online store prototype for an AG925 sterling-silver collection, now in client review.",
    },
    labels: {
      client: "Ciri",
      field: { id: "Perhiasan perak", en: "Silver jewellery" },
      role: { id: "Arah visual, desain UI, prototipe", en: "Visual direction, UI design, prototype" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/ciri-home.webp",
      alt: {
        id: "Beranda Ciri: tangan memakai cincin perak, dengan judul Your Personal Mark",
        en: "Ciri homepage: a hand wearing a silver ring under the headline Your Personal Mark",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Ciri menjual koleksi perhiasan perak sterling AG925: 13 perhiasan dalam 8 bentuk, terdiri dari cincin, anting, dan kalung. Perhiasan perak dijual lewat fotonya, jadi tampilan toko harus memberi ruang untuk kilau logamnya, bukan bersaing dengannya.",
            en: "Ciri sells an AG925 sterling-silver collection: 13 pieces in 8 forms across rings, earrings and necklaces. Silver jewellery sells through its photos, so the store has to give the metal room to shine, not compete with it.",
          },
          {
            id: "Sebelum toko dibangun, klien perlu melihat dan mencobanya lebih dulu. Saya menyerahkan satu file preview berisi 35 halaman yang bisa diklik, masing-masing dalam versi desktop dan HP. Klien sedang meninjaunya sekarang, dan tokonya belum dibangun.",
            en: "Before anything gets built, the client needs to see and try the store. I handed over a single preview file with 35 clickable pages, each in a desktop and a phone version. The client is reviewing it now, and the store itself hasn't been built yet.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Toko yang bisa diklik", en: "A store you can click through" },
        items: [
          {
            title: { id: "Arah visual tanpa warna aksen", en: "A visual direction with no accent colour" },
            text: {
              id: "Huruf grafit dan abu perak, tanpa warna aksen sama sekali, supaya foto perhiasan yang paling menonjol. Judul memakai Cormorant yang klasik, sedangkan teks memakai Inter Tight yang ringkas dan mudah dibaca di HP.",
              en: "Graphite type and silver greys with no accent colour at all, so the jewellery photos stand out most. Headings use the classic Cormorant, while body text uses the compact Inter Tight, which reads easily on a phone.",
            },
            images: [
              {
                url: "/media/seed/ciri-hp-home.webp",
                alt: {
                  id: "Beranda Ciri di HP: cincin perak di jari dengan judul Your Personal Mark dan tombol Shop Now",
                  en: "Ciri homepage on a phone: a silver ring on a finger with the headline Your Personal Mark and a Shop Now button",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: { id: "Koleksi dan kategori", en: "Collection and categories" },
            text: {
              id: "Halaman koleksi menampilkan ketiga belas perhiasan dalam satu grid. Pembeli bisa memilih kategori cincin, kalung, atau anting, menyaring menurut ketersediaan dan bentuk, lalu mengurutkan hasilnya.",
              en: "The collection page lays out all 13 pieces in one grid. Shoppers can pick rings, necklaces or earrings, filter by availability and form, then sort the results.",
            },
            images: [
              {
                url: "/media/seed/ciri-katalog.webp",
                alt: {
                  id: "Halaman koleksi Ciri: pilihan kategori, filter ketersediaan dan bentuk, dan grid cincin perak",
                  en: "Ciri collection page: category choices, availability and form filters, and a grid of silver rings",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: { id: "Halaman produk dan tas belanja", en: "Product pages and the bag" },
            text: {
              id: "Setiap perhiasan punya halaman sendiri dengan foto, detail produk, dan catatan perawatan perak. Tas belanja terbuka dari samping, jadi pembeli bisa menambah barang tanpa meninggalkan halaman.",
              en: "Each piece has its own page with photos, product details and silver care notes. The bag slides open from the side, so shoppers can add items without leaving the page.",
            },
            images: [
              {
                url: "/media/seed/ciri-produk.webp",
                alt: {
                  id: "Halaman produk Hollow Ring versi desktop",
                  en: "Hollow Ring product page on desktop",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/ciri-hp.webp",
                alt: {
                  id: "Halaman produk Hollow Ring versi HP",
                  en: "Hollow Ring product page on a phone",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: { id: "Journal dan alur belanja lengkap", en: "Journal and the full shopping flow" },
            text: {
              id: "Delapan artikel journal mengisi sisi editorial toko. Halaman tentang, kontak, bantuan, akun, checkout, dan konfirmasi pesanan juga dirancang, jadi klien bisa mencoba belanja dari beranda sampai pesanan selesai.",
              en: "Eight journal articles carry the editorial side of the store. The about, contact, help, account, checkout and order confirmation pages are designed too, so the client can try a purchase from the homepage to the final confirmation.",
            },
            images: [],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Dari arah visual ke toko", en: "From visual direction to store" },
        steps: [
          { id: "Menetapkan arah visual: grafit, abu perak, tanpa aksen", en: "Set the visual direction: graphite, silver greys, no accent" },
          { id: "Merancang 35 halaman dalam versi desktop dan HP", en: "Design 35 pages in desktop and phone versions" },
          { id: "Menyatukannya dalam satu file preview yang bisa diklik", en: "Put them together in one clickable preview file" },
          { id: "Klien mencoba alur belanja dan memberi catatan", en: "The client clicks through the shopping flow and leaves notes" },
          { id: "Toko dibangun setelah desainnya disetujui", en: "The store gets built once the design is approved" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Prototipe sebelum kode", en: "Prototype before code" },
            text: {
              id: "Klien bisa mengklik seluruh toko sebelum satu baris kode toko ditulis. Mengubah desain di tahap ini jauh lebih murah dan cepat daripada mengubah toko yang sudah jadi.",
              en: "The client can click through the whole store before a single line of store code is written. Changing a design at this stage is far cheaper and quicker than changing a finished store.",
            },
          },
          {
            title: { id: "Perak yang menjadi warnanya", en: "The silver is the colour" },
            text: {
              id: "Tanpa warna aksen, tombol dan tautan tidak berebut perhatian dengan produk. Satu-satunya kilau di halaman datang dari foto perak itu sendiri.",
              en: "With no accent colour, buttons and links don't compete with the products for attention. The only shine on the page comes from the silver in the photos.",
            },
          },
          {
            title: { id: "Setiap halaman punya versi HP", en: "Every page has a phone version" },
            text: {
              id: "Ke-35 halaman dirancang untuk desktop dan HP sekaligus, jadi klien menilai keduanya sebelum toko dibangun, bukan menemukan masalah tampilan HP setelah tayang.",
              en: "All 35 pages are designed for desktop and phone together, so the client judges both before the build instead of finding phone layout problems after launch.",
            },
          },
          {
            title: { id: "Catatan perawatan di halaman produk", en: "Care notes on the product page" },
            text: {
              id: "Perak bisa menghitam jika salah dirawat. Catatan perawatan ditaruh di halaman produk, supaya pembeli tahu cara menjaganya sejak sebelum membeli.",
              en: "Silver can tarnish if it's cared for the wrong way. Care notes sit on the product page, so shoppers know how to look after a piece before they buy it.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "13", label: { id: "perhiasan dalam 8 bentuk", en: "pieces in 8 forms" } },
          { value: "35", label: { id: "halaman, desktop dan HP", en: "pages, desktop and phone" } },
          { value: "8", label: { id: "artikel journal", en: "journal articles" } },
          { value: "0", label: { id: "warna aksen, perak yang bicara", en: "accent colours, the silver speaks" } },
        ],
        stack: {
          id: "Dibangun dengan HTML, CSS, dan JavaScript dalam satu file preview, memakai huruf Cormorant dan Inter Tight.",
          en: "Built with HTML, CSS and JavaScript as a single preview file, set in Cormorant and Inter Tight.",
        },
      },
    ],
  },

  // 5. Website Invisual
  {
    projectSlug: "website-invisual",
    published: true,
    subtitle: {
      id: "Situs portofolio dan CMS dua bahasa untuk studio desain di Bandung, dengan seluruh isi yang bisa diubah tim sendiri.",
      en: "A bilingual portfolio site and CMS for a Bandung design studio, with every word editable by the team.",
    },
    labels: {
      client: "Invisual Studio",
      field: { id: "Studio desain visual", en: "Visual design studio" },
      role: { id: "Desain, pengembangan, database, rilis", en: "Design, development, database, release" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/web-contact.webp",
      alt: {
        id: "Halaman kontak Invisual Studio versi Bahasa Indonesia, mode gelap",
        en: "Invisual Studio contact page in Indonesian, dark mode",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Invisual Studio adalah studio desain visual di Bandung yang mengerjakan identitas visual, ilustrasi, dan kemasan. Situsnya harus menampilkan karya, mendatangkan calon klien lewat pencarian Google, dan bisa diurus tim yang bukan programmer, dalam bahasa Indonesia dan Inggris.",
            en: "Invisual Studio is a visual design studio in Bandung working on visual identity, illustration and packaging. Its site has to show the work, bring in prospective clients through Google search, and be run by a team of non-programmers, in Indonesian and English.",
          },
          {
            id: "Saya mengirim pembaruannya bertahap, lebih dari 20 paket, sebagian besar disertai catatan berbahasa sederhana untuk pemilik studio. Salah satu paket berisi audit keamanan yang saya jalankan sendiri, termasuk memperbarui framework situs untuk menutup sebuah celah keamanan.",
            en: "I shipped the updates in stages, more than 20 packages, most with plain-language notes for the studio owner. One package was a security audit I ran myself, which included updating the site's framework to close a security hole.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Situs publik dan panel tim", en: "The public site and the team's panel" },
        items: [
          {
            title: { id: "Brief proyek satu pertanyaan per layar", en: "A one-question-per-screen project brief" },
            text: {
              id: "Calon klien mengisi brief proyek seperti sedang mengobrol: tujuh pertanyaan, satu per layar, termasuk kisaran budget, dalam bahasa Indonesia atau Inggris. Brief yang masuk langsung tersimpan di kotak masuk admin.",
              en: "Prospective clients fill in the brief as if they're having a conversation: seven questions, one per screen, including a budget range, in Indonesian or English. Each brief lands straight in the admin inbox.",
            },
            images: [
              {
                url: "/media/seed/web-brief.webp",
                alt: {
                  id: "Form Start a Project, langkah 5 dari 7: pilihan kisaran budget",
                  en: "Start a Project form, step 5 of 7: choosing a budget range",
                },
                width: 1440,
                height: 1300,
              },
            ],
          },
          {
            title: { id: "Karya, blog, dan halaman studio", en: "Work, blog and studio pages" },
            text: {
              id: "Karya bisa disaring menurut lingkup dan industri, masing-masing dengan halaman studi kasus. Artikel blog menampilkan waktu baca dan artikel terkait, dan halaman tentang memuat layanan, tim, dan testimoni.",
              en: "Work can be filtered by scope and industry, each piece with its own case study. Blog posts show reading time and related articles, and the about page covers services, the team and testimonials.",
            },
            images: [],
          },
          {
            title: { id: "Semua isi bisa diubah sendiri", en: "Every word is editable" },
            text: {
              id: "Tim mengubah karya, klien, testimoni, tim, layanan, FAQ, dan kontak dari panel admin, dalam bahasa Indonesia dan Inggris. Kedua bahasa memakai alamat halaman yang sama, dan pengunjung tinggal menekan tombol EN atau ID.",
              en: "The team edits work, clients, testimonials, team, services, FAQ and contact details from the admin panel, in Indonesian and English. Both languages share the same page address, and visitors just tap EN or ID.",
            },
            images: [
              {
                url: "/media/seed/web-hp.webp",
                alt: {
                  id: "Halaman kontak Invisual Studio di HP, dengan tombol pilihan bahasa EN dan ID",
                  en: "Invisual Studio contact page on a phone, with the EN and ID language switch",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: { id: "Editor blog yang memeriksa SEO", en: "A blog editor that checks SEO" },
            text: {
              id: "Sebelum artikel terbit, editor memeriksa 14 poin SEO dan memperbaiki sebagian dengan satu klik. Penulis bisa melihat pratinjau tampilan di Google dan media sosial, menjadwalkan terbit dalam WIB, dan tulisannya tersimpan otomatis.",
              en: "Before a post goes live, the editor checks 14 SEO points and fixes some of them in one click. Writers can preview how it looks on Google and social media, schedule it in Jakarta time, and their work saves automatically.",
            },
            images: [],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Dari pencarian ke brief", en: "From search to brief" },
        steps: [
          { id: "Calon klien menemukan artikel blog lewat Google", en: "A prospective client finds a blog post through Google" },
          { id: "Membuka karya dan studi kasus yang relevan", en: "They browse relevant work and case studies" },
          { id: "Mengisi brief proyek satu pertanyaan per layar", en: "They fill in the one-question-per-screen brief" },
          { id: "Brief masuk ke kotak masuk dan bisa ditandai penting", en: "The brief lands in the inbox, where it can be flagged as important" },
          { id: "Statistik menunjukkan dari mana pengunjung datang", en: "Visitor stats show where people came from" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Mesin pencari langsung diberi tahu", en: "Search engines hear about new posts right away" },
            text: {
              id: "Saat artikel atau karya terbit, situs langsung memberi tahu Google dan mesin pencari lain, tanpa menunggu dirayapi. Artikel juga bisa dijadwalkan terbit di jam tertentu.",
              en: "When a post or project goes live, the site notifies Google and other search engines straight away instead of waiting to be crawled. Posts can also be scheduled for a set time.",
            },
          },
          {
            title: { id: "Form dan login terlindungi dari spam", en: "Forms and login are guarded against spam" },
            text: {
              id: "Form kontak punya jebakan tersembunyi untuk bot, dan jumlah percobaan kirim serta login dibatasi. Login admin yang gagal berkali-kali akan tertahan sementara.",
              en: "Contact forms carry hidden traps for bots, and the number of submissions and login attempts is limited. Repeated failed admin logins are put on hold for a while.",
            },
          },
          {
            title: { id: "Pelacakan iklan menunggu izin", en: "Ad tracking waits for consent" },
            text: {
              id: "Pixel iklan Meta baru aktif setelah pengunjung menyetujuinya. Statistik pengunjung milik studio sendiri dikelompokkan menurut waktu Jakarta, jadi angka harian mengikuti hari kalender di Indonesia.",
              en: "Meta's ad pixel only switches on after the visitor agrees. The studio's own visitor stats are grouped by Jakarta time, so daily numbers follow the Indonesian calendar day.",
            },
          },
          {
            title: { id: "Cadangan data bisa diunduh pemilik", en: "The owner can download backups" },
            text: {
              id: "Pemilik bisa mengunduh cadangan isi situs dalam file JSON atau CSV. File CSV-nya aman dibuka di Excel, karena isian yang menyerupai rumus tidak ikut dijalankan.",
              en: "The owner can download a backup of the site's content as JSON or CSV. The CSV files are safe to open in Excel, because entries that look like formulas won't run.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "22", label: { id: "halaman: 8 publik, 14 admin", en: "pages: 8 public, 14 admin" } },
          { value: "14", label: { id: "poin SEO dicek sebelum terbit", en: "SEO checks before publishing" } },
          { value: "2", label: { id: "bahasa, satu alamat", en: "languages, one address" } },
          { value: "20+", label: { id: "paket pembaruan dikirim", en: "update packages shipped" } },
        ],
        stack: {
          id: "Dibangun dengan Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Cloudinary, Resend, Vercel.",
          en: "Built with Next.js, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Cloudinary, Resend, Vercel.",
        },
      },
    ],
  },

  // 6. Internet Bandung
  {
    projectSlug: "internet-bandung",
    published: true,
    subtitle: {
      id: "Situs penjualan internet rumah di Bandung yang mengarahkan setiap pengunjung ke WhatsApp.",
      en: "A home internet sales site in Bandung that sends every visitor to WhatsApp.",
    },
    labels: {
      client: "Internet Bandung",
      field: { id: "Penjualan internet rumah", en: "Home internet sales" },
      role: { id: "Desain, pengembangan, database, rilis", en: "Design, development, database, release" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/intbdg-paket.webp",
      alt: {
        id: "Pilihan paket internet rumah dengan tab durasi 1, 6, dan 12 bulan",
        en: "Home internet plans with 1, 6 and 12-month tabs",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Internet Bandung menjual paket internet rumah, fiber dan 5G, untuk wilayah Bandung. Calon pelanggan biasanya ingin bertanya dulu soal jangkauan dan harga sebelum berlangganan, dan percakapan itu terjadi di WhatsApp.",
            en: "Internet Bandung sells fibre and 5G home internet plans around Bandung. Prospective customers usually want to ask about coverage and price before they subscribe, and that conversation happens on WhatsApp.",
          },
          {
            id: "Jadi situsnya punya satu tugas: membawa pengunjung ke WhatsApp, lalu memberi tahu pemilik tombol mana yang paling banyak menghasilkan percakapan. Harga, promo, dan kota jangkauan juga harus bisa diubah pemilik sendiri, tanpa developer.",
            en: "So the site has one job: get visitors onto WhatsApp, then tell the owner which buttons start the most conversations. The owner also needs to change prices, promos and coverage cities without a developer.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Halaman jualan dan panel pemilik", en: "The sales page and the owner's panel" },
        items: [
          {
            title: { id: "Paket dan harga", en: "Plans and prices" },
            text: {
              id: "Paket tampil dengan tab durasi 1, 6, dan 12 bulan, lengkap dengan harga coret. Setiap tombol paket membuka WhatsApp, dan kliknya tercatat per paket.",
              en: "Plans come with 1, 6 and 12-month tabs and struck-through original prices. Every plan button opens WhatsApp, and clicks are logged per plan.",
            },
            images: [
              {
                url: "/media/seed/intbdg-hp.webp",
                alt: {
                  id: "Paket internet di HP dengan tombol WhatsApp",
                  en: "Internet plans on a phone with a WhatsApp button",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: { id: "Cek jangkauan dan pendaftaran", en: "Coverage check and sign-up" },
            text: {
              id: "Pengunjung mencari kotanya di daftar jangkauan, lalu mengisi form singkat: nama, nomor WhatsApp, alamat, kota, dan paket yang diminati. Datanya tersimpan sebagai calon pelanggan, kemudian WhatsApp terbuka dengan pesan yang sudah terisi.",
              en: "Visitors look up their city in the coverage list, then fill in a short form: name, WhatsApp number, address, city and the plan they want. Their details are saved as a lead, and WhatsApp opens with the message already written.",
            },
            images: [
              {
                url: "/media/seed/intbdg-form.webp",
                alt: {
                  id: "Pop-up Cek coverage dan daftar: nama, nomor WhatsApp, alamat, kota, paket, dan tombol lanjut ke WhatsApp",
                  en: "Coverage check and sign-up pop-up: name, WhatsApp number, address, city, plan and a button that continues to WhatsApp",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: { id: "Panel admin tanpa kode", en: "A no-code admin panel" },
            text: {
              id: "Delapan panel untuk mengubah slide hero, paket dan harga, isi halaman, kota jangkauan, footer, nomor WhatsApp, promo, jam layanan, dan SEO. Perubahan langsung tampil di layar pengunjung yang sedang membuka situs, tanpa perlu dimuat ulang.",
              en: "Eight panels cover the hero slides, plans and prices, page content, coverage cities, footer, WhatsApp number, promos, opening hours and SEO. Changes appear on the screens of visitors already on the site, with no reload needed.",
            },
            images: [],
          },
          {
            title: { id: "Ringkasan dan daftar pendaftar", en: "Summary and sign-up list" },
            text: {
              id: "Pemilik melihat kunjungan, klik WhatsApp, dan pendaftar per hari, untuk hari ini, 7, 30, atau 90 hari terakhir, atau rentang tanggal sendiri. Setiap pendaftar punya tombol untuk langsung menghubunginya lewat WhatsApp.",
              en: "The owner sees visits, WhatsApp clicks and sign-ups per day, for today, the last 7, 30 or 90 days, or a custom date range. Each sign-up has a button to contact them on WhatsApp directly.",
            },
            images: [
              {
                url: "/media/seed/intbdg-admin.webp",
                alt: {
                  id: "Dasbor admin: kunjungan, klik WhatsApp, pendaftar, paket aktif, kota jangkauan, dan grafik tren harian",
                  en: "Admin dashboard: visits, WhatsApp clicks, sign-ups, active plans, coverage cities and a daily trend chart",
                },
                width: 1280,
                height: 789,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Dari kunjungan ke percakapan", en: "From visit to conversation" },
        steps: [
          { id: "Pengunjung datang dan melihat promo di bagian atas", en: "A visitor arrives and sees the promo at the top" },
          { id: "Memilih durasi paket dan membandingkan harga", en: "They pick a plan length and compare prices" },
          { id: "Mengecek apakah kotanya sudah terjangkau", en: "They check whether their city is covered" },
          { id: "Mengisi form atau langsung menekan tombol WhatsApp", en: "They fill in the form or tap a WhatsApp button" },
          { id: "Pemilik melanjutkan percakapan dan melihat tombol mana yang berhasil", en: "The owner picks up the chat and sees which button worked" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "WhatsApp tetap terbuka walau penyimpanan gagal", en: "WhatsApp opens even if saving fails" },
            text: {
              id: "Jika data pendaftar gagal tersimpan karena gangguan, WhatsApp tetap terbuka dengan pesan yang sudah terisi. Calon pelanggan tidak hilang hanya karena masalah teknis.",
              en: "If a sign-up fails to save because of a glitch, WhatsApp still opens with the message filled in. A technical hiccup doesn't cost a lead.",
            },
          },
          {
            title: { id: "Setiap klik tahu asalnya", en: "Every click knows where it came from" },
            text: {
              id: "Klik WhatsApp dicatat menurut tombolnya: menu atas, kartu paket, tombol melayang, atau form. Data yang sama dikirim ke Google Analytics dan Meta Pixel untuk mengukur iklan.",
              en: "WhatsApp clicks are logged by button: top menu, plan card, floating button or form. The same data goes to Google Analytics and Meta Pixel to measure ads.",
            },
          },
          {
            title: { id: "Angka di dasbor adalah angka asli", en: "The dashboard shows real numbers" },
            text: {
              id: "Versi awal dasbor masih memakai angka contoh. Pada 14 Oktober, angka itu diganti data kunjungan dan klik yang sebenarnya, dan dasbor ikut diperbarui setiap ada aktivitas baru di situs.",
              en: "The first version of the dashboard used sample numbers. On 14 October they were replaced with real visit and click data, and the dashboard now updates whenever there's new activity on the site.",
            },
          },
          {
            title: { id: "Siap dibaca mesin pencari", en: "Ready for search engines" },
            text: {
              id: "Judul, deskripsi, dan gambar pratinjau media sosial diatur dari admin. Setiap paket juga ditandai sebagai penawaran harga yang bisa dibaca Google.",
              en: "The title, description and social preview image are set from the admin. Each plan is also marked up as a priced offer that Google can read.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "8", label: { id: "panel admin tanpa kode", en: "no-code admin panels" } },
          { value: "3", label: { id: "pilihan durasi paket: 1, 6, 12 bulan", en: "plan lengths: 1, 6 or 12 months" } },
          { value: "4", label: { id: "jenis tombol WhatsApp yang dilacak", en: "kinds of WhatsApp button tracked" } },
          { value: "1", label: { id: "tujuan untuk setiap tombol: WhatsApp", en: "destination for every button: WhatsApp" } },
        ],
        stack: {
          id: "Dibangun dengan Next.js, React, TypeScript, Supabase (PostgreSQL), Google Analytics 4, Meta Pixel, Vercel.",
          en: "Built with Next.js, React, TypeScript, Supabase (PostgreSQL), Google Analytics 4, Meta Pixel, Vercel.",
        },
      },
    ],
  },

  // 7. POINT POS
  {
    projectSlug: "point-pos",
    published: true,
    subtitle: {
      id: "Prototipe kasir coffee shop yang memotong stok bahan baku di setiap penjualan.",
      en: "A coffee-shop point-of-sale prototype that deducts ingredients with every sale.",
    },
    labels: {
      client: "POINT",
      field: { id: "Coffee shop", en: "Coffee shops" },
      role: { id: "Desain produk, prototipe interaktif", en: "Product design, interactive prototype" },
      year: "2026",
    },
    cover: {
      url: "/media/seed/point-kasir.webp",
      alt: {
        id: "Layar kasir POINT: menu kopi, pesanan berisi varian dan add-on, pajak PB1, dan pilihan bayar",
        en: "POINT till screen: coffee menu, an order with variants and add-ons, PB1 tax and payment options",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: { id: "Situasinya", en: "The situation" },
        paragraphs: [
          {
            id: "Di coffee shop, satu gelas memakai beberapa bahan sekaligus: biji kopi, susu UHT, gula aren, sirup, mint, dan cup. Kasir yang hanya mencatat gelas terjual tidak bisa memberi tahu kapan bahan akan habis, berapa modal setiap menu, atau berapa margin yang tersisa.",
            en: "In a coffee shop, one drink uses several ingredients at once: coffee beans, UHT milk, palm sugar, syrup, mint and the cup itself. A till that only counts cups sold can't tell you when ingredients will run out, what each item costs to make, or how much margin is left.",
          },
          {
            id: "POINT POS adalah prototipe interaktif untuk menjawab itu: kasir, layar barista, dashboard, riwayat, inventori, dan stock opname dalam satu aplikasi. Prototipe ini belum dipakai di toko sungguhan, tapi setiap alurnya bisa langsung dicoba di browser.",
            en: "POINT POS is an interactive prototype built to answer that: till, barista screen, dashboard, history, inventory and stock counts in one app. It isn't running in a real shop yet, but every flow can be tried right in the browser.",
          },
        ],
      },
      {
        type: "features",
        title: { id: "Enam modul, satu kasir", en: "Six modules, one till" },
        items: [
          {
            title: { id: "Kasir dengan lembar opsi", en: "A till with an option sheet" },
            text: {
              id: "Setiap menu membuka lembar opsi: ukuran Regular atau Large (+Rp 6.000), panas atau dingin, extra shot (+Rp 5.000), extra syrup (+Rp 3.000), dan catatan. Pembayaran bisa tunai, QRIS, kartu, atau e-wallet, dengan numpad dan tombol uang pas untuk tunai.",
              en: "Each item opens an option sheet: Regular or Large (+Rp 6,000), hot or iced, extra shot (+Rp 5,000), extra syrup (+Rp 3,000) and notes. Customers pay by cash, QRIS, card or e-wallet, with a numpad and exact-amount buttons for cash.",
            },
            images: [
              {
                url: "/media/seed/point-opsi.webp",
                alt: {
                  id: "Lembar opsi Caramel Macchiato: ukuran, suhu, add-on, dan catatan",
                  en: "Caramel Macchiato option sheet: size, temperature, add-ons and notes",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/point-hp.webp",
                alt: {
                  id: "Katalog menu POINT di HP dengan harga dan SKU setiap menu",
                  en: "POINT menu catalogue on a phone with each item's price and SKU",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: { id: "Layar barista", en: "Barista screen" },
            text: {
              id: "Pesanan dari kasir langsung masuk ke layar barista, lengkap dengan keterangan dine-in atau takeaway. Barista menekan mulai buat, lalu tandai selesai, jadi antrean di bar selalu jelas.",
              en: "Orders from the till go straight to the barista screen, marked dine-in or takeaway. Baristas tap start, then done, so the queue at the bar is always clear.",
            },
            images: [
              {
                url: "/media/seed/point-barista.webp",
                alt: {
                  id: "Layar barista dengan dua pesanan: satu sedang diproses, satu baru masuk",
                  en: "Barista screen with two orders: one in progress, one just in",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: { id: "Resep dan inventori", en: "Recipes and inventory" },
            text: {
              id: "Setiap menu punya resep bahan, jadi penjualan langsung mengurangi stok biji kopi, susu, gula aren, sirup, mint, dan cup. SKU dibuat otomatis, misalnya BEV-CML-001, dan HPP serta margin per menu terhitung sendiri.",
              en: "Every item has a recipe, so each sale deducts coffee beans, milk, palm sugar, syrup, mint and cups from stock. SKUs are generated automatically, like BEV-CML-001, and cost of goods and margin per item calculate themselves.",
            },
            images: [
              {
                url: "/media/seed/point-inventori.webp",
                alt: {
                  id: "Tabel inventori menu dengan SKU, harga, HPP, margin, stok, dan status",
                  en: "Menu inventory table with SKU, price, cost of goods, margin, stock and status",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: { id: "Dashboard, riwayat, dan stock opname", en: "Dashboard, history and stock counts" },
            text: {
              id: "Dashboard menampilkan penjualan dan transaksi hari ini, menu terlaris, stok menipis, dan penjualan per jam. Riwayat menyimpan setiap transaksi, dan stock opname berjalan per sesi dengan catatan selisih.",
              en: "The dashboard shows today's sales and transactions, the best seller, low stock and sales per hour. History keeps every transaction, and stock counts run in sessions with a log of differences.",
            },
            images: [
              {
                url: "/media/seed/point-dashboard.webp",
                alt: {
                  id: "Dashboard hari ini: penjualan, transaksi, menu terlaris, stok menipis, dan grafik penjualan per jam",
                  en: "Today's dashboard: sales, transactions, best seller, low stock and an hourly sales chart",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/point-opname.webp",
                alt: {
                  id: "Stock opname: mulai sesi baru, sakelar blind count, dan riwayat sesi dengan jumlah selisih",
                  en: "Stock count: starting a new session, the blind count toggle and a session history with differences",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: { id: "Satu pesanan, dari kasir ke gudang", en: "One order, from till to storeroom" },
        steps: [
          { id: "Kasir memilih menu, lalu mengatur ukuran, suhu, dan add-on", en: "The cashier picks an item and sets size, temperature and add-ons" },
          { id: "Sistem mengecek bahan dan menambahkan pajak PB1 11%", en: "The system checks ingredients and adds 11% PB1 tax" },
          { id: "Pelanggan membayar tunai, QRIS, kartu, atau e-wallet", en: "The customer pays by cash, QRIS, card or e-wallet" },
          { id: "Stok bahan terpotong sesuai resep", en: "Ingredients come off stock according to the recipe" },
          { id: "Pesanan masuk ke layar barista sampai ditandai selesai", en: "The order goes to the barista screen until it's marked done" },
          { id: "Stock opname mencocokkan stok sistem dengan hitungan fisik", en: "A stock count checks system stock against what's on the shelf" },
        ],
      },
      {
        type: "decisions",
        title: { id: "Keputusan yang melindungi bisnis", en: "Decisions that protect the business" },
        items: [
          {
            title: { id: "Penjualan ditahan saat bahan habis", en: "Sales stop when ingredients run out" },
            text: {
              id: "Jika bahan untuk satu menu tidak cukup, kasir tidak bisa menjualnya dan muncul pesan “Bahan tidak cukup”. Tidak ada pesanan yang terlanjur dibayar lalu ternyata tidak bisa dibuat.",
              en: "If there aren't enough ingredients for an item, the till won't sell it and shows “Bahan tidak cukup” (not enough ingredients). No order gets paid for and then turns out impossible to make.",
            },
          },
          {
            title: { id: "Blind count untuk stock opname", en: "Blind counts for stock takes" },
            text: {
              id: "Saat menghitung, stok menurut sistem disembunyikan dan dibekukan, jadi petugas mencatat yang benar-benar ada di rak, bukan menyalin angka di layar. Selisihnya baru terlihat setelah hitungan selesai.",
              en: "During a count, the system's stock figure is hidden and frozen, so staff record what's actually on the shelf instead of copying the number on screen. Differences only show once the count is done.",
            },
          },
          {
            title: { id: "Modal dan margin selalu terlihat", en: "Cost and margin always in view" },
            text: {
              id: "Karena setiap menu punya resep, HPP dan margin terhitung per item. Pemilik bisa melihat menu mana yang laris tapi untungnya tipis, lalu menyesuaikan harga atau resepnya.",
              en: "Because every item has a recipe, cost of goods and margin are worked out per item. The owner can spot what sells well but earns little, then adjust the price or the recipe.",
            },
          },
          {
            title: { id: "Tambahan kecil tidak lupa ditagih", en: "Small extras always get charged" },
            text: {
              id: "Ukuran Large, extra shot, dan extra syrup langsung menambah harga di pesanan, dan pajak PB1 11% dihitung otomatis. Kasir tidak perlu menghitung tambahan di kepala.",
              en: "Large sizes, extra shots and extra syrup add to the order price straight away, and the 11% PB1 tax is calculated automatically. The cashier never has to add up extras in their head.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: { id: "Dalam angka", en: "By the numbers" },
        facts: [
          { value: "6", label: { id: "modul dalam satu aplikasi", en: "modules in one app" } },
          { value: "4", label: { id: "cara bayar: tunai, QRIS, kartu, e-wallet", en: "ways to pay: cash, QRIS, card, e-wallet" } },
          { value: "11%", label: { id: "pajak PB1 dihitung otomatis", en: "PB1 tax calculated automatically" } },
          { value: "1", label: { id: "resep per menu, stok terpotong sendiri", en: "recipe per item, stock deducts itself" } },
        ],
        stack: {
          id: "Dibangun sebagai prototipe interaktif dengan HTML, CSS, dan JavaScript, langsung berjalan di browser.",
          en: "Built as an interactive prototype in HTML, CSS and JavaScript that runs right in the browser.",
        },
      },
    ],
  },
  {
    projectSlug: "vale",
    published: true,
    subtitle: {
      id: "Situs golf clubhouse yang menjadikan setiap pegolf seorang ksatria: peta kerajaan, enam bab, dan pemesanan tee time.",
      en: "A golf clubhouse site where every golfer becomes a knight: a map of the realm, six chapters and tee-time booking.",
    },
    labels: {
      client: "VALE Golf Clubhouse",
      field: {
        id: "Golf clubhouse",
        en: "Golf clubhouse",
      },
      role: {
        id: "Desain situs, interaksi, dan front-end, bersama Invisual Studio",
        en: "Site design, interaction and front-end, with Invisual Studio",
      },
      year: "2026",
    },
    cover: {
      url: "/media/seed/vale-peta.webp",
      alt: {
        id: "Beranda VALE: peta kerajaan bergaya cetak dengan enam landmark, kompas, dan daftar Legend of the Realm",
        en: "VALE homepage: a printed-style map of the realm with six landmarks, a compass and the Legend of the Realm list",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: {
          id: "Situasinya",
          en: "The situation",
        },
        paragraphs: [
          {
            id: "VALE adalah destinasi golf modern yang terinspirasi semangat ksatria abad pertengahan: setiap pegolf menjadi ksatria, setiap fairway menjadi kerajaan, dan setiap ronde menjadi petualangan. Situsnya harus membawa cerita itu sampai terasa, tanpa membuat pengunjung tersesat saat ingin memesan tee time.",
            en: "VALE is a modern golf destination inspired by the spirit of medieval knights: every golfer becomes a knight, every fairway a realm and every round a quest. The site had to carry that story until you could feel it, without losing visitors who just want to book a tee time.",
          },
          {
            id: "Proyek ini dikerjakan di Invisual Studio. Hasilnya satu file preview berisi peta kerajaan dan enam bab, lengkap di desktop dan HP, yang berjalan tanpa server. Situsnya belum tayang, dan formulir di dalamnya tidak mengirim apa pun.",
            en: "The project was made at Invisual Studio. The result is a single preview file holding the realm map and six chapters, complete on desktop and phone, that runs without a server. The site isn't live yet, and its forms send nothing.",
          },
        ],
      },
      {
        type: "features",
        title: {
          id: "Negeri yang bisa dikelilingi",
          en: "A realm you can explore",
        },
        items: [
          {
            title: {
              id: "Peta negeri",
              en: "The map of the realm",
            },
            text: {
              id: "Beranda adalah peta lapangan yang bisa digeser dan diperbesar. Enam landmark, dari Training Ground sampai King's Reach, membuka kartu cerita masing-masing dan menuju babnya. Setiap landmark yang dibuka memberi satu segel di Quest Log.",
              en: "The homepage is a map of the course you can drag and zoom. Six landmarks, from the Training Ground to the King's Reach, each open a story card that leads into its chapter. Every landmark you open stamps a seal in the Quest Log.",
            },
            images: [
              {
                url: "/media/seed/vale-kartu.webp",
                alt: {
                  id: "Peta dengan kartu landmark The Great Hall terbuka di sisi kanan",
                  en: "The map with The Great Hall landmark card open on the right",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/vale-hp-peta.webp",
                alt: {
                  id: "Kartu landmark The Great Hall di HP",
                  en: "The Great Hall landmark card on phone",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: {
              id: "Enam bab, satu buku",
              en: "Six chapters, one book",
            },
            text: {
              id: "The Legend, The Course, The Great Hall, The Knights Cup, The Order, dan Begin the Quest dibaca seperti buku: berpindah bab terasa seperti membalik halaman, dan The Chronicle menjadi daftar isinya. Di The Legend, Green Knight berganti pose sambil digulir dan enam companion bisa dibalik seperti medali.",
              en: "The Legend, The Course, The Great Hall, The Knights Cup, The Order and Begin the Quest read like a book: moving between chapters feels like turning a page, and The Chronicle is the table of contents. In The Legend, the Green Knight changes pose as you scroll and six companions turn over like medallions.",
            },
            images: [
              {
                url: "/media/seed/vale-legenda.webp",
                alt: {
                  id: "Enam companion dalam bingkai oval, dua di antaranya sudah dibalik dan menampilkan ceritanya",
                  en: "Six companions in oval frames, two of them turned over to show their story",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Lapangan dalam detail",
              en: "The course in detail",
            },
            text: {
              id: "Bab The Course memperkenalkan kontur lapangan, lima bendera dengan angka dan kata, dan hole VII The Dragon's Bunker lengkap dengan par dan jarak dari setiap tee. Kode ksatria ditutup dengan tiga aturan sederhana di lapangan.",
              en: "The Course chapter introduces the contours, five flags each with a numeral and a word, and hole VII, The Dragon's Bunker, with its par and the distance from every tee. The knight's code closes it with three simple rules on the green.",
            },
            images: [
              {
                url: "/media/seed/vale-hole.webp",
                alt: {
                  id: "Hole VII The Dragon's Bunker: par 4, jarak tiga tee, dan foto batu penanda",
                  en: "Hole VII, The Dragon's Bunker: par 4, three tee distances and photos of the marker stone",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Great Hall dan Armoury",
              en: "The Great Hall and the Armoury",
            },
            text: {
              id: "Clubhouse tampil lewat foto ruangannya, papan pengumuman yang posternya bisa digeser, dan rak Armoury berisi delapan barang yang bisa ditarik untuk dijelajahi.",
              en: "The clubhouse comes through its room photographs, a notice board whose posters you can drag about, and an Armoury rack of eight goods you pull to browse.",
            },
            images: [
              {
                url: "/media/seed/vale-armoury.webp",
                alt: {
                  id: "New Goods from the Armoury: polo, topi, kaus kaki, dan sweater dalam rak yang bisa digeser",
                  en: "New Goods from the Armoury: a polo, cap, socks and sweater on a rack you can drag",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Kartu anggota The Order",
              en: "The Order's member card",
            },
            text: {
              id: "Pengunjung menulis namanya dan langsung melihatnya di kartu anggota, lengkap dengan nomor anggota. Kartunya miring mengikuti kursor dan bisa dibalik. Di bawahnya ada empat hak anggota dan formulir untuk meminta undangan.",
              en: "Visitors write their name and see it on the member card straight away, with a member number. The card tilts with the cursor and turns over. Below are the four privileges of the Order and a form to request an invitation.",
            },
            images: [
              {
                url: "/media/seed/vale-order.webp",
                alt: {
                  id: "Kartu anggota VALE bertuliskan Sir Galahad, di samping teks A true member of the Vale",
                  en: "A VALE member card reading Sir Galahad, beside the line A true member of the Vale",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Pesan tee time",
              en: "Booking a tee time",
            },
            text: {
              id: "Begin the Quest memandu pemesanan dalam enam langkah, dari tanggal sampai data diri. Tiket di sampingnya terisi sambil pengunjung memilih, dan jam pagi ditandai Early Knight. Di HP, ringkasannya menempel sebagai bilah di bawah layar.",
              en: "Begin the Quest walks through the booking in six steps, from the date to the player's details. The ticket beside it fills in as the visitor chooses, and dawn slots are marked Early Knight. On phones the summary sits in a bar at the bottom of the screen.",
            },
            images: [
              {
                url: "/media/seed/vale-quest.webp",
                alt: {
                  id: "Formulir tee time: tanggal, jam 7:00 bertanda Early Knight, dan tiket VALE yang sudah terisi",
                  en: "The tee-time form: a date, the 7:00 slot marked Early Knight, and the filled VALE ticket",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/vale-hp-quest.webp",
                alt: {
                  id: "Segel lilin dan pesan Your quest begins setelah booking di HP",
                  en: "A wax seal and the message Your quest begins after booking on phone",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: {
          id: "Alur memesan tee time",
          en: "Booking a tee time",
        },
        steps: [
          {
            id: "Pilih tanggal dari empat belas hari ke depan",
            en: "Pick a date from the next fourteen days",
          },
          {
            id: "Pilih jam; jam pagi bertanda Early Knight",
            en: "Choose a time; dawn slots are marked Early Knight",
          },
          {
            id: "Atur jumlah ksatria, satu sampai empat",
            en: "Set the party, one to four knights",
          },
          {
            id: "Pilih sembilan atau delapan belas hole",
            en: "Choose nine or eighteen holes",
          },
          {
            id: "Tambah caddie atau cart bila perlu",
            en: "Add a caddie or a cart if needed",
          },
          {
            id: "Isi nama dan email, lalu segel booking",
            en: "Enter a name and email, then seal the booking",
          },
        ],
      },
      {
        type: "decisions",
        title: {
          id: "Keputusan desain",
          en: "Design decisions",
        },
        items: [
          {
            title: {
              id: "Terasa tercetak, bukan datar",
              en: "Printed, not flat",
            },
            text: {
              id: "Judul dan ilustrasinya punya tekstur tinta seperti hasil cetak buku tua. Teksturnya dibuat dengan filter SVG ringan, bukan gambar besar, jadi tetap tajam di layar mana pun.",
              en: "Headings and illustrations carry an ink texture like an old printed book. The texture comes from a light SVG filter rather than large images, so it stays sharp on any screen.",
            },
          },
          {
            title: {
              id: "Peta yang bisa dimainkan",
              en: "A map you can play",
            },
            text: {
              id: "Quest Log mengumpulkan segel setiap landmark yang dibuka. Progresnya disimpan di perangkat pengunjung, dan situs tetap berjalan normal bila penyimpanan itu diblokir browser.",
              en: "The Quest Log collects a seal for every landmark opened. Progress is kept on the visitor's device, and the site keeps working normally when the browser blocks that storage.",
            },
          },
          {
            title: {
              id: "Cerita tidak menghalangi booking",
              en: "The story never blocks the booking",
            },
            text: {
              id: "Tombol Begin the Quest selalu ada di header dan di peta, dan ringkasan booking terus terlihat. Pengunjung yang hanya ingin memesan bisa langsung memesan.",
              en: "The Begin the Quest button is always in the header and on the map, and the booking summary stays in view. Visitors who only want to book can book straight away.",
            },
          },
          {
            title: {
              id: "Tenang bila diminta",
              en: "Calm when asked",
            },
            text: {
              id: "Bila pengunjung memilih gerak dikurangi, animasinya ikut berhenti. Dialog, kartu, dan formulirnya memakai tombol dan label asli, jadi bisa dipakai dengan keyboard dan pembaca layar.",
              en: "When visitors ask for reduced motion, the animation stops. Dialogs, cards and forms use real buttons and labels, so they work with a keyboard and a screen reader.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: {
          id: "Dalam angka",
          en: "By the numbers",
        },
        facts: [
          {
            value: "7",
            label: {
              id: "halaman: peta dan enam bab",
              en: "pages: the map and six chapters",
            },
          },
          {
            value: "6",
            label: {
              id: "landmark dan enam companion",
              en: "landmarks and six companions",
            },
          },
          {
            value: "50",
            label: {
              id: "gambar vektor dalam satu file",
              en: "vector drawings in one file",
            },
          },
          {
            value: "20",
            label: {
              id: "pilihan jam tee time per hari",
              en: "tee times to choose from each day",
            },
          },
        ],
        stack: {
          id: "Dibuat dengan HTML, CSS, dan JavaScript, GSAP (ScrollTrigger, Draggable, SplitText), Lenis, dan ilustrasi SVG. Satu file, berjalan tanpa server.",
          en: "Built with HTML, CSS and JavaScript, GSAP (ScrollTrigger, Draggable, SplitText), Lenis and SVG illustration. One file that runs without a server.",
        },
      },
    ],
  },
  {
    projectSlug: "loma",
    published: true,
    subtitle: {
      id: "Situs restoran Amerika Latin di Lima: tenang tapi berani, dengan carta, kisah merek, dan reservasi meja.",
      en: "A Latin American restaurant site for Lima: quiet but bold, with the carta, the brand story and table reservations.",
    },
    labels: {
      client: "Loma",
      field: {
        id: "Restoran",
        en: "Restaurant",
      },
      role: {
        id: "Desain situs, interaksi, dan front-end, bersama Invisual Studio",
        en: "Site design, interaction and front-end, with Invisual Studio",
      },
      year: "2026",
    },
    cover: {
      url: "/media/seed/loma-hero.webp",
      alt: {
        id: "Beranda Loma: lampu dinding hangat di ruang makan gelap, wordmark Loma besar di bawah",
        en: "Loma homepage: a warm wall lamp in a dark dining room, the large Loma wordmark below",
      },
      width: 1600,
      height: 1000,
    },
    blocks: [
      {
        type: "prose",
        title: {
          id: "Situasinya",
          en: "The situation",
        },
        paragraphs: [
          {
            id: "Loma adalah ruang makan Amerika Latin kontemporer di Lima, Peru: berakar pada tanah, dibentuk oleh api, dibuat untuk dibagi. Situsnya perlu terasa seperti ruangannya, gelap, hangat, dan pelan, sambil tetap membuat dua hal mudah: melihat carta dan memesan meja.",
            en: "Loma is a contemporary Latin American dining room in Lima, Peru: rooted in the land, shaped by fire, made to share. The site had to feel like the room, dark, warm and unhurried, while keeping two things easy: reading the carta and booking a table.",
          },
          {
            id: "Proyek ini dikerjakan di Invisual Studio sebagai satu file preview berisi empat halaman, lengkap di desktop dan HP. Situsnya belum tayang, dan formulir reservasinya tidak mengirim apa pun.",
            en: "The project was made at Invisual Studio as a single preview file with four pages, complete on desktop and phone. The site isn't live yet, and its reservation form sends nothing.",
          },
        ],
      },
      {
        type: "features",
        title: {
          id: "Empat halaman, satu suasana",
          en: "Four pages, one mood",
        },
        items: [
          {
            title: {
              id: "Tierra, Fuego, Tiempo",
              en: "Tierra, Fuego, Tiempo",
            },
            text: {
              id: "Beranda bercerita lewat tiga unsur, tanah, api, dan waktu, yang bergeser ke samping saat digulir. Fotonya melengkung halus mengikuti gerak gulir, dan tetap tampil sebagai foto biasa bila browser tidak mendukung WebGL.",
              en: "The homepage tells its story through three elements, land, fire and time, which slide sideways as you scroll. The photographs bend gently with the scroll, and still show as ordinary photos when the browser has no WebGL.",
            },
            images: [
              {
                url: "/media/seed/loma-bab.webp",
                alt: {
                  id: "Bab Fuego di beranda: koki menuang saus di atas piring, kata FUEGO besar di bawah",
                  en: "The Fuego chapter on the homepage: a chef pouring sauce over a plate, the word FUEGO large below",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Tujuh signature",
              en: "Seven signatures",
            },
            text: {
              id: "Tujuh menu signature tersusun sebagai daftar. Di desktop, foto piringnya berganti saat nama menu disorot; di HP, setiap menu tampil dengan fotonya sendiri.",
              en: "The seven signature plates sit in a list. On desktop, the photo changes as you point at each name; on phones, every plate shows with its own photo.",
            },
            images: [
              {
                url: "/media/seed/loma-signature.webp",
                alt: {
                  id: "Daftar signature dengan Grilled Octopus disorot dan fotonya di sebelah kanan",
                  en: "The signature list with Grilled Octopus highlighted and its photo on the right",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/loma-hp.webp",
                alt: {
                  id: "Daftar signature di HP, setiap menu dengan fotonya",
                  en: "The signature list on phone, each plate with its photo",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: {
              id: "Lima tempat duduk",
              en: "Five places to sit",
            },
            text: {
              id: "La Sala, El Salón, El Jardín, La Terraza, dan El Bar bisa dipilih satu per satu, masing-masing dengan foto dan suasananya. Tombol reservasinya ikut berganti nama, dan tempat duduk itu sudah terpilih saat formulir reservasi terbuka.",
              en: "La Sala, El Salón, El Jardín, La Terraza and El Bar can be chosen one at a time, each with its photo and mood. The reserve button takes the space's name, and that seating is already selected when the reservation form opens.",
            },
            images: [
              {
                url: "/media/seed/loma-ruang.webp",
                alt: {
                  id: "Five places to sit dengan El Jardín terpilih: taman berlampu dengan bantal duduk di bawah pepohonan",
                  en: "Five places to sit with El Jardín selected: a lantern-lit garden with floor cushions under the trees",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "La Carta",
              en: "La Carta",
            },
            text: {
              id: "Carta berisi 33 menu dalam delapan kategori, dari Signature sampai Without Spirits. Navigasi kategori menempel di sisi halaman, dan foto signature menemani daftar menu.",
              en: "The carta holds 33 items in eight courses, from Signature to Without Spirits. The course navigation stays at the side of the page, and a signature photo keeps the list company.",
            },
            images: [
              {
                url: "/media/seed/loma-carta.webp",
                alt: {
                  id: "La Carta: kategori Signature dan To Begin, navigasi kategori di kiri, foto Grilled Octopus di kanan",
                  en: "La Carta: the Signature and To Begin courses, the course navigation on the left, a Grilled Octopus photo on the right",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/loma-hp-carta.webp",
                alt: {
                  id: "La Carta di HP dengan navigasi kategori di atas",
                  en: "La Carta on phone with the course navigation at the top",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
          {
            title: {
              id: "Historia",
              en: "Historia",
            },
            text: {
              id: "Halaman kisah memperkenalkan tanda jaguar, palet warna yang diambil dari material ruangan (walnut, kayu bergalur, linen zaitun, travertine), dapurnya, dan enam ikon yang digambar tangan seperti cap.",
              en: "The story page introduces the jaguar mark, a palette taken from the room's materials (walnut, fluted wood, olive linen, travertine), the kitchen, and six hand-drawn icons cut like stamps.",
            },
            images: [
              {
                url: "/media/seed/loma-historia.webp",
                alt: {
                  id: "What the room is made of: empat foto material dengan nama warnanya",
                  en: "What the room is made of: four material photos with their colour names",
                },
                width: 1600,
                height: 1000,
              },
            ],
          },
          {
            title: {
              id: "Reservar",
              en: "Reservar",
            },
            text: {
              id: "Reservasi berjalan dalam enam langkah. Hari Senin otomatis tertutup, jam hanya muncul dalam jam buka, tamu dibatasi enam orang dengan jalan pintas ke private dining, lalu ringkasannya tampil dengan kalimat Nos vemos pronto.",
              en: "Reservations run in six steps. Mondays close on their own, times only appear within opening hours, guests are capped at six with a shortcut to private dining, and the summary closes with Nos vemos pronto.",
            },
            images: [
              {
                url: "/media/seed/loma-reservasi.webp",
                alt: {
                  id: "Formulir reservasi: tanggal, jam, tiga tamu, El Jardín, dan acara Celebration terpilih",
                  en: "The reservation form: a date, a time, three guests, El Jardín and the Celebration occasion selected",
                },
                width: 1600,
                height: 1000,
              },
              {
                url: "/media/seed/loma-hp-reservasi.webp",
                alt: {
                  id: "Konfirmasi Nos vemos pronto dengan ringkasan reservasi di HP",
                  en: "The Nos vemos pronto confirmation with the reservation summary on phone",
                },
                width: 600,
                height: 1298,
              },
            ],
          },
        ],
      },
      {
        type: "flow",
        title: {
          id: "Alur reservasi",
          en: "Booking a table",
        },
        steps: [
          {
            id: "Pilih tanggal; hari Senin tutup",
            en: "Pick a date; Mondays are closed",
          },
          {
            id: "Pilih jam antara 5.30 dan 10.00 malam",
            en: "Choose a time between 5.30 and 10.00 PM",
          },
          {
            id: "Atur jumlah tamu, satu sampai enam",
            en: "Set the guests, one to six",
          },
          {
            id: "Pilih tempat duduk bila ingin",
            en: "Choose a seating area if you like",
          },
          {
            id: "Pilih acaranya bila ingin",
            en: "Choose the occasion if you like",
          },
          {
            id: "Isi nama dan email, lalu kirim permintaan",
            en: "Enter a name and email, then send the request",
          },
        ],
      },
      {
        type: "decisions",
        title: {
          id: "Keputusan desain",
          en: "Design decisions",
        },
        items: [
          {
            title: {
              id: "Foto yang terasa hidup, dengan cadangan",
              en: "Photos that feel alive, with a fallback",
            },
            text: {
              id: "Foto dirender lewat WebGL supaya bisa melengkung halus saat digulir. Di balik itu tetap ada gambar biasa, jadi semua foto tampil di browser tanpa WebGL.",
              en: "The photographs render through WebGL so they can bend gently on scroll. Ordinary images sit underneath, so every photo still shows in a browser without WebGL.",
            },
          },
          {
            title: {
              id: "Warna dari ruangannya",
              en: "Colours from the room",
            },
            text: {
              id: "Palet Boho Black, Tribal Brown, Nato Green, dan Silk Grey diambil dari walnut, kayu bergalur, linen, dan travertine di ruang makan, jadi situs dan ruangannya bicara dengan bahasa yang sama.",
              en: "The Boho Black, Tribal Brown, Nato Green and Silk Grey palette comes from the walnut, fluted wood, linen and travertine in the dining room, so the site and the room speak the same language.",
            },
          },
          {
            title: {
              id: "Detail yang digambar tangan",
              en: "Details drawn by hand",
            },
            text: {
              id: "Enam ikon tempat (entrada, meja host, ruang tunggu, private dining, bar, teras) digambar seperti cap lama dan dipakai dari papan nama sampai kantong kertas.",
              en: "Six place icons (entrance, host desk, waiting area, private dining, bar, terrace) are drawn like old stamps and used from signage to paper bags.",
            },
          },
          {
            title: {
              id: "Reservasi yang jujur",
              en: "An honest booking form",
            },
            text: {
              id: "Formulir hanya menawarkan yang benar-benar bisa dipesan: hari Senin tutup, jam sesuai jam buka, dan rombongan tujuh orang atau lebih diarahkan ke private dining.",
              en: "The form only offers what can really be booked: Mondays closed, times within opening hours, and parties of seven or more sent to private dining.",
            },
          },
        ],
      },
      {
        type: "numbers",
        title: {
          id: "Dalam angka",
          en: "By the numbers",
        },
        facts: [
          {
            value: "4",
            label: {
              id: "halaman dalam satu file",
              en: "pages in one file",
            },
          },
          {
            value: "33",
            label: {
              id: "menu dalam delapan kategori",
              en: "items across eight courses",
            },
          },
          {
            value: "5",
            label: {
              id: "tempat duduk untuk dipilih",
              en: "places to sit",
            },
          },
          {
            value: "6",
            label: {
              id: "langkah memesan meja",
              en: "steps to book a table",
            },
          },
        ],
        stack: {
          id: "Dibuat dengan HTML, CSS, dan JavaScript, GSAP (ScrollTrigger, Flip, SplitText), dan Three.js untuk foto WebGL. Satu file, berjalan tanpa server.",
          en: "Built with HTML, CSS and JavaScript, GSAP (ScrollTrigger, Flip, SplitText) and Three.js for the WebGL photographs. One file that runs without a server.",
        },
      },
    ],
  },
];
