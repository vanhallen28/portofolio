import type { CaseStudy, Content, Img, L, Line, Project, Sections, SiteSettings } from "./types";
import { SEED_CASES } from "./seed-cases";

/* Initial content. Everything here is editable from /admin; this file is only the first fill
   (and the fallback when the database is not connected yet). */

const l = (id: string, en: string): L => ({ id, en });
const img = (key: string, width: number, height: number, altId: string, altEn: string): Img => ({
  url: `/media/seed/${key}.webp`, width, height, alt: l(altId, altEn),
});

export const WA_MESSAGE = l(
  "Halo Virgiawan, saya ingin konsultasi soal sistem untuk bisnis saya.",
  "Hi Virgiawan, I'd like to talk about a system for my business.",
);

export const seedSettings: SiteSettings = {
  name: "Virgiawan Listanto",
  role: l("Desainer & pengembang produk digital, Bandung", "Digital product designer & developer, Bandung"),
  notice: l("", ""),
  showNotice: false,
  email: "virgiawanlistanto088@gmail.com",
  whatsapp: "6281332623033",
  whatsappDisplay: "0813 3262 3033",
  whatsappMessage: WA_MESSAGE,
  linkedin: "https://www.linkedin.com/in/virgiawan-listanto-5125b3333/",
  linkedinLabel: "virgiawan-listanto",
  github: "vanhallen28",
  photo: img("profile", 880, 880,
    "Foto Virgiawan Listanto, berkacamata dan berkemeja hijau zaitun, tersenyum",
    "Photo of Virgiawan Listanto in glasses and an olive shirt, smiling"),
  footer: l("Desain dan kode situs ini juga saya kerjakan sendiri.", "I designed and coded this site myself, too."),
  seoTitle: l("Virgiawan Listanto · Sistem untuk bisnis", "Virgiawan Listanto · Systems for business"),
  seoDescription: l(
    "Portofolio Virgiawan Listanto, desainer dan pengembang produk digital di Bandung. Delapan sistem yang menjalankan bisnis nyata.",
    "Portfolio of Virgiawan Listanto, a digital product designer and developer in Bandung. Eight systems that run real businesses.",
  ),
  availability: { show: false, text: l("Menerima proyek baru", "Taking on new projects") },
  ui: {
    skip: l("Langsung ke isi", "Skip to content"),
    nav: {
      works: l("Karya", "Work"),
      services: l("Layanan", "Services"),
      process: l("Cara kerja", "Process"),
      about: l("Tentang", "About"),
      contact: l("Kontak", "Contact"),
    },
    whatsappButton: l("Chat WhatsApp", "WhatsApp me"),
    menu: l("Menu", "Menu"),
    backToTop: l("Kembali ke atas", "Back to top"),
  },
};

export const seedLines: Line[] = [
  { key: "found", name: l("Ditemukan", "Get found"), color: "#2F6FE4", colorDark: "#5B8EF0", sort: 1 },
  { key: "sell", name: l("Menjual", "Sell"), color: "#E39A00", colorDark: "#F0B030", sort: 2 },
  { key: "serve", name: l("Melayani", "Serve"), color: "#12936A", colorDark: "#2DB386", sort: 3 },
  { key: "run", name: l("Mengelola", "Run"), color: "#D4417A", colorDark: "#E66A98", sort: 4 },
];

export const seedSections: Sections = {
  hero: {
    role: l("Desainer & pengembang produk digital, Bandung", "Digital product designer & developer, Bandung"),
    title: l(
      "Saya membangun sistem yang menjalankan bisnis Anda: dari toko online sampai payroll.",
      "I build the systems that run your business: from online stores to payroll.",
    ),
    lede: l(
      "Studio Manager di Invisual Studio. Delapan sistem di halaman ini saya rancang dan bangun sendiri, dari tampilan sampai database. Lima di antaranya sudah tayang dan dipakai.",
      "Studio Manager at Invisual Studio. I designed and built each of the eight systems on this page myself, from the interface to the database. Five of them are live and in use.",
    ),
    ctaPrimary: l("Konsultasi gratis via WhatsApp", "Free consultation on WhatsApp"),
    ctaSecondary: l("Lihat karya", "See the work"),
    mapCenter: l("Bisnis Anda", "Your business"),
    mapCaption: l(
      "Denah pameran. Empat sisi bisnis membentuk satu putaran, dan setiap karya adalah stasiun di jalurnya. Pilih stasiun untuk masuk ke ruangnya.",
      "Exhibition map. Four sides of a business form one loop, and each project is a station on its line. Pick a station to enter its room.",
    ),
  },
  works: {
    title: l("Karya", "Work"),
    intro: l(
      "Delapan ruang, delapan bisnis. Setiap ruang memakai warna dan huruf milik kliennya, karena sistem yang baik tampil sebagai brand Anda, bukan template saya.",
      "Eight rooms, eight businesses. Each room wears its client's own colours and type, because a good system looks like your brand, not my template.",
    ),
    allLabel: l("Semua", "All"),
    roomLabel: l("Ruang", "Room"),
    previewCta: l("Preview proyek", "Preview the project"),
    caseCta: l("Lihat studi kasus", "Read the case study"),
    visitCta: l("Kunjungi situs", "Visit the site"),
    nextRoom: l("Ruang berikutnya", "Next room"),
    newTab: l("tab baru", "new tab"),
    caseLabels: {
      client: l("Klien", "Client"), field: l("Bidang", "Field"), role: l("Peran saya", "My role"),
      year: l("Tahun", "Year"), lines: l("Jalur", "Lines"), site: l("Situs", "Site"),
    },
  },
  services: {
    visible: true,
    title: l("Apa yang bisa saya bangun untuk bisnis Anda", "What I can build for your business"),
    proofLabel: l("Contoh:", "See:"),
    items: [
      { line: "found", text: l("Website dan landing page yang bisa Anda ubah sendiri, siap untuk mesin pencari, dan mengarahkan pengunjung ke WhatsApp.", "Websites and landing pages you can edit yourself, ready for search engines, that send visitors to WhatsApp."), proof: ["website-invisual", "internet-bandung", "aliya-syifaa"] },
      { line: "sell", text: l("Toko online dengan QRIS, virtual account, dan e-wallet, aplikasi kasir, dan stok yang selalu cocok dengan rak.", "Online stores with QRIS, virtual accounts and e-wallets, point-of-sale apps, and stock that always matches the shelf."), proof: ["biansa", "ciri", "point-pos", "internet-bandung"] },
      { line: "serve", text: l("Portal klien dan aplikasi pelanggan: pemesanan, persetujuan, tagihan, dan riwayat, semuanya dari HP.", "Client portals and customer apps: bookings, approvals, invoices and history, all from the phone."), proof: ["aliya-syifaa", "portal-klien"] },
      { line: "run", text: l("Sistem internal: absensi, payroll, tugas tim, keuangan, dan arsip dokumen di balik satu login.", "Internal systems: attendance, payroll, team tasks, finance and documents behind one login."), proof: ["invisual-hris", "point-pos", "portal-klien"] },
    ],
  },
  process: {
    visible: true,
    title: l("Cara kerja", "How we'll work"),
    steps: [
      { title: l("Ngobrol dulu", "Start with a chat"), text: l("Ceritakan cara bisnis Anda berjalan hari ini, lewat WhatsApp atau tatap muka. Saya petakan bagian mana yang paling layak dibuatkan sistem lebih dulu.", "Tell me how your business runs today, on WhatsApp or in person. I map out which part is most worth turning into a system first.") },
      { title: l("Rancangan yang bisa diklik", "A design you can click"), text: l("Sebelum kode ditulis, Anda menerima prototipe yang bisa dicoba di HP dan laptop, seperti preview toko Ciri.", "Before any code is written, you get a prototype to try on your phone and laptop, like the Ciri store preview.") },
      { title: l("Dibangun dan dirilis bertahap", "Built and released in steps"), text: l("Fitur dirilis sedikit demi sedikit supaya Anda bisa mencoba dan memberi masukan sejak awal. Aliya Syifaa melewati 19 versi dalam sembilan hari.", "Features ship a little at a time so you can try them and give feedback early. Aliya Syifaa went through 19 versions in nine days.") },
      { title: l("Serah terima yang jelas", "A clear handover"), text: l("Anda mendapat panduan berbahasa Indonesia yang bisa diikuti langkah demi langkah, dan panel admin untuk mengurus isi tanpa developer.", "You get a step-by-step guide in Indonesian and an admin panel to manage content without a developer.") },
    ],
  },
  testimonials: { visible: false, title: l("Kata klien", "What clients say"), items: [] },
  about: {
    visible: true,
    title: l("Tentang saya", "About me"),
    paragraphs: [
      l("Saya Virgiawan Listanto, Studio Manager di Invisual Studio, Bandung. Selain mengurus studio, saya membangun seluruh sistemnya: website, portal klien, dan HRIS yang dipakai tim setiap hari.",
        "I'm Virgiawan Listanto, Studio Manager at Invisual Studio in Bandung. Besides running the studio, I built all of its systems: the website, the client portal and the HRIS the team uses every day."),
      l("Di luar studio, saya membantu bisnis lain, dari layanan home care sampai label pakaian, memindahkan pekerjaan harian mereka ke sistem yang rapi. Saya mengerjakan semuanya sendiri: desain tampilan, kode, database, pembayaran, sampai rilis.",
        "Outside the studio I help other businesses, from a home-care service to a clothing label, move their daily work into tidy systems. I handle all of it myself: interface design, code, database, payments and release."),
    ],
    skills: [l("Desain antarmuka", "Interface design"), l("Next.js & React", "Next.js & React"), l("Supabase & PostgreSQL", "Supabase & PostgreSQL"), l("Midtrans & Xendit", "Midtrans & Xendit"), l("Aplikasi PWA", "Installable web apps")],
  },
  faq: { visible: false, title: l("Pertanyaan yang sering diajukan", "Frequently asked questions"), items: [] },
  contact: {
    title: l("Ceritakan bisnis Anda. Saya balas di WhatsApp.", "Tell me about your business. I'll reply on WhatsApp."),
    button: l("Chat di WhatsApp", "Chat on WhatsApp"),
    labels: { email: l("Email", "Email"), whatsapp: l("WhatsApp", "WhatsApp"), linkedin: l("LinkedIn", "LinkedIn"), github: l("GitHub", "GitHub") },
  },
};

const P = (p: Omit<Project, "published"> & { published?: boolean }): Project => ({ published: true, ...p });

export const seedProjects: Project[] = [
  P({
    id: "73b8623d-c113-5ea0-ab63-d3aac3dee57e", slug: "aliya-syifaa", sort: 1, name: "Aliya Syifaa", mapLabel: "Aliya Syifaa", mapSlot: 1,
    titleFont: "marcellus", titleStyle: { size: "xl", uppercase: false, weight: 400, tracking: 0 },
    meta: l("Home care terapi Islami, 2026", "Islamic home-care therapy, 2026"),
    text: l("Layanan terapi yang datang ke rumah pasien butuh lebih dari sekadar website. Saya membangun satu sistem untuk seluruh alurnya: form konsultasi bertanda tangan, aplikasi pasien, aplikasi terapis, dan panel admin untuk jadwal, pembayaran, dan isi situs.",
      "A therapy service that visits patients at home needed more than a website. I built one system for the whole flow: a signed consultation form, a patient app, a therapist app, and an admin panel for schedules, payments and site content."),
    lines: ["serve", "found"],
    theme: { wall: "#15241E", ink: "#F8EADA", muted: "#B9C3B6", accent: "#D4B16E", btnBg: "#D4B16E", btnInk: "#15241E" },
    facts: [
      { value: "4", label: l("aplikasi dalam satu sistem", "apps in one system") },
      { value: "19", label: l("versi dirilis dalam 9 hari", "versions shipped in 9 days") },
      { value: "6", label: l("langkah anamnesa dengan tanda tangan", "step intake form with signature") },
    ],
    status: null, liveUrl: "https://www.aliyasyifaa.com/", liveLabel: "aliyasyifaa.com", liveNote: null, previewUrl: "/preview/aliya-syifaa.html",
    layout: "desk-phone",
    visuals: [
      { role: "desk", image: img("aliya-admin", 1600, 911, "Panel admin Aliya Syifaa: pesanan baru, kunjungan aktif, pendapatan, dan keluhan terbanyak", "Aliya Syifaa admin panel: new bookings, active visits, revenue and top complaints") },
      { role: "phone", image: img("aliya-hp-beranda", 390, 844, "Aplikasi pasien: kunjungan berikutnya dan daftar layanan", "Patient app: next visit and list of services") },
    ],
    brand: null, pattern: "none",
  }),
  P({
    id: "adb2f26d-61cb-549f-894d-957fd98ee546", slug: "invisual-hris", sort: 2, name: "Invisual HRIS", mapLabel: "Invisual HRIS", mapSlot: 7,
    titleFont: "archivo", titleStyle: { size: "lg", uppercase: true, weight: 400, tracking: -0.01 },
    meta: l("Sistem internal studio, Invisual Studio, 2026", "Internal studio system, Invisual Studio, 2026"),
    text: l("Satu portal untuk 25 orang di studio: absensi dengan selfie dan lokasi, payroll periode 21 sampai 20, task tracker, chat dengan panggilan suara, kanvas desain bersama, keuangan, dan arsip dokumen. Satu login menggantikan setumpuk aplikasi langganan.",
      "One portal for the studio's 25 people: selfie-and-location attendance, payroll on the 21st-to-20th cycle, a task tracker, chat with voice calls, a shared design canvas, finance and a document vault. One login replaces a stack of subscriptions."),
    lines: ["run"],
    theme: { wall: "#204DC6", ink: "#FFF6E0", muted: "#C9D4F6", accent: "#FFD23F", btnBg: "#FFD23F", btnInk: "#111111" },
    facts: [
      { value: "25", label: l("orang memakainya setiap hari", "people use it every day") },
      { value: "8", label: l("modul di balik satu login", "modules behind one login") },
      { value: "47rb", label: l("baris kode, dikerjakan sendiri", "lines of code, built solo") },
    ],
    status: null, liveUrl: "", liveLabel: "", liveNote: l("Versi live di hris.invisual.studio khusus tim", "The live version at hris.invisual.studio is team only"),
    previewUrl: "/preview/hris.html", layout: "back-desk",
    visuals: [
      { role: "back", image: img("hris-heatmap", 1600, 887, "Timesheet heatmap kehadiran harian per karyawan", "Daily attendance timesheet heatmap per employee") },
      { role: "desk", image: img("hris-dasbor", 1600, 903, "Dasbor HR: jumlah hadir, terlambat, WFH, log absensi live", "HR dashboard: present, late, WFH counts and live attendance log") },
    ],
    brand: null, pattern: "none",
  }),
  P({
    id: "5a58e7d3-0970-5cba-8abd-ffb43dc286b5", slug: "biansa", sort: 3, name: "Biansa", mapLabel: "Biansa", mapSlot: 4,
    titleFont: "marcellus", titleStyle: { size: "xl", uppercase: false, weight: 400, tracking: 0.04 },
    meta: l("Toko online sleepwear, Tasikmalaya, 2026", "Sleepwear online store, Tasikmalaya, 2026"),
    text: l("Toko milik sendiri untuk label sleepwear lokal, bukan lapak marketplace. Pembeli bisa checkout tanpa akun dan membayar lewat virtual account, QRIS, atau e-wallet. Harga selalu dihitung ulang di server, dan pesanan baru dianggap lunas setelah payment gateway mengonfirmasi.",
      "A store of its own for a local sleepwear label, not a marketplace listing. Shoppers check out as guests and pay by virtual account, QRIS or e-wallet. Prices are always recalculated on the server, and an order only counts as paid once the payment gateway confirms it."),
    lines: ["sell"],
    theme: { wall: "#ECE6DB", ink: "#2A241D", muted: "#5F5B45", accent: "#6E6A52", btnBg: "#2A241D", btnInk: "#F5F1E9" },
    facts: [
      { value: "34", label: l("halaman toko dan admin", "store and admin pages") },
      { value: "4", label: l("gaya beranda yang dipilih pemilik", "homepage styles the owner can pick") },
      { value: "4", label: l("lapis cek sebelum status lunas", "checks before an order is paid") },
    ],
    status: l("Belum tayang, menunggu keputusan klien", "Not live yet, awaiting the client's go-ahead"),
    liveUrl: "", liveLabel: "", liveNote: null, previewUrl: "/preview/biansa.html", layout: "brand-card", visuals: [],
    brand: {
      logoUrl: "/media/seed/biansa-logo.svg",
      swatches: [
        { name: "Oat", color: "#D9CDB8" }, { name: "Sage", color: "#A8A88F" }, { name: "Ivory", color: "#EFE9DD" },
        { name: "Espresso", color: "#4A3B2E" }, { name: "Indigo", color: "#3A4356" }, { name: "Clay", color: "#B08968" },
      ],
      note: l("14 layar toko dan admin ada di preview UI", "14 store and admin screens in the UI preview"),
    },
    pattern: "none",
  }),
  P({
    id: "f93ddd77-c3ef-5bfd-8c21-1c671327edc5", slug: "portal-klien", sort: 4, name: "Portal Klien", mapLabel: "Portal Klien", mapSlot: 8,
    titleFont: "unbounded", titleStyle: { size: "md", uppercase: false, weight: 800, tracking: -0.02 },
    meta: l("Portal klien studio desain, Invisual Studio, 2026", "Design studio client portal, Invisual Studio, 2026"),
    text: l("Klien studio desain tidak perlu lagi mencari draf di WhatsApp dan Drive. Di portal ini mereka melihat progres, menaruh catatan revisi langsung di gambar, menandatangani kontrak, dan membayar tagihan. Tim studio mengatur semuanya dari papan Kanban.",
      "A design studio's clients no longer dig through WhatsApp and Drive for drafts. In this portal they follow progress, pin revision notes on the artwork, sign the contract and pay invoices. The studio runs it all from a Kanban board."),
    lines: ["serve", "run"],
    theme: { wall: "#2243CE", ink: "#FFF4E0", muted: "#D6DDFF", accent: "#D1F360", btnBg: "#D1F360", btnInk: "#110B28" },
    facts: [
      { value: "1", label: l("link persetujuan, tanpa perlu login", "approval link, no login needed") },
      { value: "2", label: l("jenis revisi dengan kuota per tahap", "revision types with per-stage quotas") },
      { value: "3", label: l("cara bayar: QRIS, VA, e-wallet", "ways to pay: QRIS, VA, e-wallet") },
    ],
    status: l("Preview proyek menyusul", "Project preview coming soon"),
    liveUrl: "http://portal.invisual.studio/", liveLabel: "portal.invisual.studio", liveNote: null, previewUrl: "", layout: "two-phones",
    visuals: [
      { role: "phone", image: img("portal-top", 640, 1023, "Beranda portal klien: status proyek dan kartu proyek", "Client portal home: project status and project card") },
      { role: "phone", image: img("portal-progres", 640, 1015, "Progres tahapan, batas feedback 48 jam, sisa revisi", "Stage progress, 48-hour feedback window, revisions left") },
    ],
    brand: null, pattern: "checker",
  }),
  P({
    id: "917b706b-98ac-5382-ac9e-6928f98f53ec", slug: "ciri", sort: 5, name: "Ciri", mapLabel: "Ciri", mapSlot: 5,
    titleFont: "cormorant", titleStyle: { size: "xxl", uppercase: true, weight: 500, tracking: 0.02 },
    meta: l("Toko perhiasan perak AG925, 2026", "AG925 silver jewellery store, 2026"),
    text: l("Arah visual dan prototipe toko untuk koleksi perak AG925: huruf grafit, abu perak, tanpa warna aksen, supaya foto produknya yang berkilau. Tiga puluh lima halaman yang bisa diklik, masing-masing dalam versi desktop dan HP, untuk ditinjau klien sebelum dibangun.",
      "Visual direction and a clickable store prototype for an AG925 silver collection: graphite type, silver greys and no accent colour, so the photography brings the shine. Thirty-five clickable pages, each in desktop and phone versions, for the client to review before the build."),
    lines: ["sell"],
    theme: { wall: "#2F3031", ink: "#F9F9F9", muted: "#BFC3C7", accent: "#E4E6E8", btnBg: "#F9F9F9", btnInk: "#2F3031" },
    facts: [
      { value: "13", label: l("perhiasan dalam 8 bentuk", "pieces in 8 forms") },
      { value: "35", label: l("halaman, desktop dan HP", "pages, desktop and phone") },
      { value: "0", label: l("warna aksen, perak yang bicara", "accent colours, the silver speaks") },
    ],
    status: l("Dalam review klien", "In client review"), liveUrl: "", liveLabel: "", liveNote: null, previewUrl: "/preview/ciri.html", layout: "desk-phone",
    visuals: [
      { role: "desk", image: img("ciri-home", 1600, 1000, "Beranda Ciri: tangan memakai cincin perak, judul Your Personal Mark", "Ciri homepage: a hand wearing a silver ring, headline Your Personal Mark") },
      { role: "phone", image: img("ciri-hp", 600, 1298, "Halaman produk Hollow Ring versi HP", "Hollow Ring product page on phone") },
    ],
    brand: null, pattern: "none",
  }),
  P({
    id: "5ea9fd41-1964-5919-b1f3-b5405a6c86dc", slug: "website-invisual", sort: 6, name: "Website Invisual", mapLabel: "Website Invisual", mapSlot: 2,
    titleFont: "host", titleStyle: { size: "lg", uppercase: false, weight: 700, tracking: -0.03 },
    meta: l("Situs dan CMS studio desain, Bandung, 2026", "Design studio site and CMS, Bandung, 2026"),
    text: l("Situs portofolio studio yang seluruh isinya bisa diubah sendiri oleh tim, dalam dua bahasa. Ada form brief proyek satu pertanyaan per layar, kotak masuk, statistik pengunjung, dan editor blog yang memeriksa 14 poin SEO sebelum artikel terbit.",
      "A studio portfolio site whose every word the team can edit, in two languages. It has a one-question-per-screen project brief, an inbox, visitor statistics, and a blog editor that checks 14 SEO points before an article goes live."),
    lines: ["found"],
    theme: { wall: "#101011", ink: "#F2F2F2", muted: "#A6A6AC", accent: "#F65294", btnBg: "#F65294", btnInk: "#101011" },
    facts: [
      { value: "14", label: l("poin SEO dicek sebelum terbit", "SEO checks before publishing") },
      { value: "2", label: l("bahasa, satu alamat", "languages, one address") },
      { value: "20+", label: l("paket pembaruan dikirim", "update packages shipped") },
    ],
    status: null, liveUrl: "https://invisual.studio/", liveLabel: "invisual.studio", liveNote: null, previewUrl: "/preview/web-invi.html", layout: "desk-phone",
    visuals: [
      { role: "desk", image: img("web-contact", 1600, 1000, "Halaman kontak Invisual Studio versi Bahasa Indonesia, mode gelap", "Invisual Studio contact page in Indonesian, dark mode") },
      { role: "phone", image: img("web-hp", 600, 1298, "Halaman kontak di HP", "Contact page on phone") },
    ],
    brand: null, pattern: "none",
  }),
  P({
    id: "36416adb-ba98-597e-8c59-4fef26390a55", slug: "internet-bandung", sort: 7, name: "Internet Bandung", mapLabel: "Internet Bandung", mapSlot: 3,
    titleFont: "jakarta", titleStyle: { size: "lg", uppercase: false, weight: 800, tracking: -0.03 },
    meta: l("Landing page penjualan internet rumah, Bandung, 2026", "Home internet sales landing page, Bandung, 2026"),
    text: l("Landing page yang mengarahkan setiap pengunjung ke WhatsApp, karena di sanalah pembeli memutuskan. Pemilik mengubah harga, promo, dan kota jangkauan dari panel admin, dan perubahannya langsung tampil. Setiap klik WhatsApp tercatat dari tombol mana asalnya.",
      "A landing page that sends every visitor to WhatsApp, because that's where buyers decide. The owner edits prices, promos and coverage cities from an admin panel and the changes appear instantly. Every WhatsApp click is logged with the button it came from."),
    lines: ["found", "sell"],
    theme: { wall: "#D8006F", ink: "#FFFFFF", muted: "#FFF0F7", accent: "#FFC24B", btnBg: "#FFC24B", btnInk: "#26202E" },
    facts: [
      { value: "8", label: l("panel admin tanpa kode", "no-code admin panels") },
      { value: "3", label: l("pilihan durasi paket: 1, 6, 12 bulan", "plan lengths: 1, 6 or 12 months") },
      { value: "1", label: l("tujuan untuk setiap tombol: WhatsApp", "destination for every button: WhatsApp") },
    ],
    status: null, liveUrl: "https://www.internetbandung.com/", liveLabel: "internetbandung.com", liveNote: null, previewUrl: "/preview/internet-bandung.html", layout: "desk-phone",
    visuals: [
      { role: "desk", image: img("intbdg-paket", 1600, 1000, "Pilihan paket internet dengan tab 1, 6, dan 12 bulan", "Internet plans with 1, 6 and 12-month tabs") },
      { role: "phone", image: img("intbdg-hp", 600, 1298, "Paket internet di HP dengan tombol WhatsApp", "Internet plans on phone with a WhatsApp button") },
    ],
    brand: null, pattern: "glow",
  }),
  P({
    id: "4c7b3202-46ba-55fe-aed8-7695aac2189b", slug: "point-pos", sort: 8, name: "POINT POS", mapLabel: "POINT POS", mapSlot: 6,
    titleFont: "lora", titleStyle: { size: "md", uppercase: false, weight: 600, tracking: 0.01 },
    meta: l("Kasir dan inventori coffee shop, 2026", "Point of sale and inventory for coffee shops, 2026"),
    text: l("Kasir coffee shop yang tahu isi gudangnya. Setiap menu punya resep, jadi satu cappuccino yang terjual langsung mengurangi stok kopi dan susu, sementara HPP dan margin terhitung sendiri. Pesanan diteruskan ke layar barista, dan stock opname bisa memakai blind count supaya hitungan fisik tetap jujur.",
      "A coffee-shop point of sale that knows what's in the storeroom. Every menu item has a recipe, so each cappuccino sold deducts coffee and milk from stock while cost of goods and margin calculate themselves. Orders flow to a barista screen, and stock counts can run blind so the physical count stays honest."),
    lines: ["sell", "run"],
    theme: { wall: "#F1EBE1", ink: "#2B2620", muted: "#6B6355", accent: "#2F6BFF", btnBg: "#2B2620", btnInk: "#FBF8F2" },
    facts: [
      { value: "6", label: l("modul: kasir, barista, dashboard, riwayat, inventori, opname", "modules: till, barista, dashboard, history, inventory, counts") },
      { value: "4", label: l("cara bayar: tunai, QRIS, kartu, e-wallet", "ways to pay: cash, QRIS, card, e-wallet") },
      { value: "1", label: l("resep per menu, stok bahan terpotong sendiri", "recipe per item, ingredients deduct themselves") },
    ],
    status: l("Prototipe interaktif, bisa langsung dicoba", "Interactive prototype you can try now"),
    liveUrl: "", liveLabel: "", liveNote: null, previewUrl: "/preview/point-pos.html", layout: "desk-phone",
    visuals: [
      { role: "desk", image: img("point-kasir", 1600, 1000, "Layar kasir POINT: menu kopi, pesanan berisi varian dan add-on, pajak PB1, dan pilihan bayar", "POINT till screen: coffee menu, order with variants and add-ons, PB1 tax and payment options") },
      { role: "phone", image: img("point-hp", 600, 1298, "Katalog menu POINT di HP", "POINT menu catalogue on phone") },
    ],
    brand: null, pattern: "none",
  }),
];

export const aliyaCase: CaseStudy = {
  projectSlug: "aliya-syifaa",
  published: true,
  subtitle: l("Satu sistem untuk layanan home care terapi Islami: dari form konsultasi sampai kuitansi.", "One system for an Islamic home-care therapy service: from the consultation form to the receipt."),
  labels: { client: "Aliya Syifaa", field: l("Home care terapi Islami", "Islamic home-care therapy"), role: l("Desain, pengembangan, database, rilis", "Design, development, database, release"), year: "2026" },
  cover: img("aliya-laptop", 1280, 800, "Aplikasi pasien Aliya Syifaa di dalam bingkai ponsel, dengan pilihan tema terang dan gelap", "Aliya Syifaa patient app in a phone frame, with light and dark theme options"),
  theme: { wall: "#FBF7F0", ink: "#15241E", muted: "#55635B", accent: "#9E7B36", btnBg: "#15241E", btnInk: "#F8EADA" },
  blocks: [
    { type: "prose", title: l("Situasinya", "The situation"), paragraphs: [
      l("Aliya Syifaa mengirim terapis bersertifikat ke rumah pasien untuk bekam, ruqyah syar'iyyah, refleksi, konsultasi herbal, dan terapi lainnya. Layanan seperti ini melibatkan empat pihak sekaligus: calon pasien, pasien dan keluarganya, terapis di lapangan, dan admin. Masing-masing butuh tampilan sendiri, tapi datanya harus satu.",
        "Aliya Syifaa sends certified therapists to patients' homes for cupping, ruqyah, reflexology, herbal consultations and other therapies. A service like this involves four parties at once: prospective patients, patients and their families, therapists in the field, and the admin. Each needs its own view, but the data has to be one."),
      l("Karena menyimpan data kesehatan, sistemnya juga harus menjaga privasi sesuai UU Pelindungan Data Pribadi, dan cara bayarnya harus mengikuti kebiasaan pasien: bayar setelah terapi, tunai ke terapis atau transfer.",
        "Because it holds health data, the system also has to protect privacy under Indonesia's personal data protection law, and payments have to follow how patients actually pay: after the session, in cash to the therapist or by bank transfer."),
    ] },
    { type: "features", title: l("Satu sistem, empat pintu", "One system, four doors"), items: [
      { title: l("Situs dan form konsultasi", "Website and consultation form"), text: l("Calon pasien membaca layanan lalu mengisi anamnesa enam langkah: keluhan, riwayat kesehatan, gaya hidup, pin lokasi, dan tanda tangan persetujuan. Tanpa perlu membuat akun.", "Prospective patients read about the services, then fill in a six-step intake: complaints, health history, lifestyle, a location pin and a signed consent. No account needed."),
        images: [img("aliya-web", 1400, 1280, "Beranda situs Aliya Syifaa: Terapi Islami, datang ke rumah Anda", "Aliya Syifaa homepage: Islamic therapy, at your home")] },
      { title: l("Aplikasi pasien", "Patient app"), text: l("Pasien dan keluarganya memesan kunjungan, melihat jadwal, membaca catatan terapis, dan membayar tagihan. Aplikasinya bisa dipasang di layar utama HP.", "Patients and their families book visits, check the schedule, read the therapist's notes and pay invoices. The app installs on the phone's home screen."),
        images: [img("aliya-hp-layanan", 390, 844, "Daftar layanan dengan harga dan durasi", "Service list with prices and durations"), img("aliya-hp-jadwal", 390, 844, "Jadwal kunjungan mendatang dan riwayat", "Upcoming visits and history")] },
      { title: l("Aplikasi terapis", "Therapist app"), text: l("Terapis melihat kunjungan hari ini lengkap dengan rute Google Maps, mencatat tanda vital dan skala nyeri sebelum dan sesudah terapi, lalu menerbitkan tagihan atau mencatat pembayaran tunai. Uang tunai yang belum disetor terlihat jelas.", "Therapists see today's visits with Google Maps routes, record vital signs and pain scores before and after each session, then issue the invoice or log a cash payment. Cash not yet handed in stays visible."), images: [] },
      { title: l("Panel admin", "Admin panel"), text: l("Admin mengatur pesanan, pasien, pembayaran, layanan, tim terapis, dan isi situs. Statistik pengunjungnya berjalan tanpa cookie dan tanpa data pribadi.", "The admin manages bookings, patients, payments, services, the therapist team and site content. Visitor statistics run without cookies or personal data."),
        images: [img("aliya-statistik", 1600, 903, "Statistik situs: pengunjung per hari, sumber pengunjung, kalender kunjungan", "Site statistics: visitors per day, traffic sources, visit calendar")] },
    ] },
    { type: "flow", title: l("Alur layanan", "The service flow"), steps: [
      l("Calon pasien mengisi konsultasi online", "A prospective patient fills in the online consultation"),
      l("Admin menjadwalkan dan menugaskan terapis", "The admin schedules it and assigns a therapist"),
      l("Terapis datang dan mencatat terapinya", "The therapist visits and records the session"),
      l("Tagihan terbit: tunai, transfer, atau bayar nanti", "The invoice goes out: cash, transfer or pay later"),
      l("Kuitansi bisa dibuka dan dicetak dari link", "A receipt opens and prints from a link"),
    ] },
    { type: "decisions", title: l("Keputusan yang melindungi bisnis", "Decisions that protect the business"), items: [
      { title: l("Harga tidak bisa diakali dari HP", "Prices can't be tampered with from a phone"), text: l("Harga layanan dan ongkos transport selalu dihitung ulang di database. Diskon terapis punya batas, dan setiap perubahan tercatat.", "Service prices and transport fees are always recalculated in the database. Therapist discounts have a cap, and every change is logged.") },
      { title: l("Data kesehatan tidak tersimpan di perangkat", "Health data never stays on the device"), text: l("Aplikasinya tetap terbuka saat sinyal lemah, tapi halaman yang berisi data kesehatan tidak pernah disimpan offline.", "The app still opens on a weak signal, but pages with health data are never stored offline.") },
      { title: l("Ongkos transport mengikuti jarak", "Transport fees follow the distance"), text: l("Biaya transport dihitung dari jarak lokasi pasien ke klinik, berdasarkan zona yang diatur admin sendiri.", "Transport is priced from the patient's distance to the clinic, using zones the admin sets.") },
      { title: l("Pemilik mengatur akun sendiri", "The owner manages accounts"), text: l("Admin menambah terapis atau admin baru lewat link undangan sekali pakai, tanpa developer. Sistem memastikan selalu ada minimal satu admin.", "The admin adds therapists or other admins through single-use invite links, no developer needed. The system makes sure there is always at least one admin.") },
    ] },
    { type: "numbers", title: l("Dalam angka", "By the numbers"), facts: [
      { value: "51", label: l("halaman di empat aplikasi", "pages across four apps") },
      { value: "19", label: l("versi dalam sembilan hari", "versions in nine days") },
      { value: "30", label: l("aturan akses di database", "access rules in the database") },
      { value: "3", label: l("peran pengguna plus pengunjung", "user roles plus visitors") },
    ], stack: l("Dibangun dengan Next.js, React, TypeScript, Supabase (PostgreSQL), Leaflet & OpenStreetMap, PWA, Vercel.", "Built with Next.js, React, TypeScript, Supabase (PostgreSQL), Leaflet & OpenStreetMap, PWA, Vercel.") },
  ],
};

export const seed: Content = {
  settings: seedSettings,
  sections: seedSections,
  lines: seedLines,
  projects: seedProjects,
  caseStudies: [aliyaCase, ...SEED_CASES],
};
