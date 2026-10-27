# Portofolio + CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Situs portofolio Virgiawan Listanto (ID/EN) di Next.js 16 + Supabase + Vercel, tampil identik dengan `preview.html`, dengan panel admin yang membuat seluruh konten bisa diedit.

**Architecture:** Halaman publik adalah Server Components yang membaca konten lewat satu antarmuka `ContentStore`, di-cache dengan `unstable_cache` bertag `content`, dan dibersihkan dengan `updateTag('content')` setiap kali admin menyimpan. `SupabaseStore` dipakai di produksi (RLS: baca publik, tulis hanya admin). `LocalStore` (file JSON) dipakai saat pengembangan tanpa Supabase, sehingga semua alur bisa diuji. Animasi GSAP dipasang oleh komponen klien di atas DOM yang dirender server, persis seperti preview.

**Tech Stack:** Next.js 16.4.3 (App Router, `proxy.ts`), React 19.3, TypeScript, zod, @supabase/supabase-js + @supabase/ssr, GSAP 3.12 + ScrollTrigger, next/font/local, Vitest, PGlite (uji SQL), Playwright (uji E2E, Chromium bawaan workspace).

**Referensi implementasi:** `/home/claude/portfolio-preview/src/{index.html,styles.css,app.js}` adalah sumber markup, CSS, dan logika gerak yang sudah disetujui. Semua komponen situs adalah port langsung dari file ini. Isi konten awal: `/home/claude/portfolio-notes/*.md`.

## Global Constraints

- Node 22, npm. Next.js `16.4.3`, React `19.3.0` (versi dari create-next-app 16.4.3).
- Bahasa: Indonesia di `/`, English di `/en`. Semua teks konten bertipe `{ id: string; en: string }`.
- CSS biasa (tanpa Tailwind). Token warna dan kelas dari `portfolio-preview/src/styles.css`.
- Font lokal via `next/font/local` (woff2 dari @fontsource). Tidak ada request ke Google Fonts.
- Tidak menyebut AI dalam copy apa pun. Tidak ada nama/logo operator jaringan di Internet Bandung.
- Data pribadi di screenshot sudah samaran; gambar baru dari admin dikompres ke WebP ≤ 2400 px, ≤ 8 MB sebelum upload.
- RLS aktif di semua tabel. Server web tidak memakai service role key.
- `prefers-reduced-motion: reduce` mematikan semua animasi; konten tidak boleh tersembunyi tanpa JavaScript.
- Rilis: setiap rilis = zip utuh bernomor versi `portofolio-vX.Y.Z.zip` (dibuat dari `git archive`), ditinjau dulu (test + build + review independen), disertai perintah siap salin `unzip -o portofolio-vX.Y.Z.zip -d .`.
- Versi pertama: `0.1.0`.

---

### Task 1: Kerangka proyek, alat uji, font, CSS dasar

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `app/fonts/*.woff2` (Schibsted Grotesk 400/500/700/800, Marcellus 400, Plus Jakarta Sans 400/600/800, Archivo Black 400, Unbounded 800, Cormorant Garamond 500, Host Grotesk 500/700, Quicksand 700, Lora 600)
- Create: `lib/fonts.ts` — mengekspor `fontShell` dan `TITLE_FONTS: Record<FontKey, {className, variable, label}>`
- Create: `styles/tokens.css` (port bagian Tokens + Base dari `styles.css`)

- [ ] Salin isi `/home/claude/_scaffold/app` (tanpa `.git`, `node_modules`) ke repo, ganti `name` → `portofolio`, `version` → `0.1.0`.
- [ ] `npm install zod @supabase/supabase-js @supabase/ssr gsap@3.12.5` dan `npm install -D vitest @electric-sql/pglite tsx`.
- [ ] Tambahkan script: `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`, `"seed:sql": "tsx scripts/gen-seed-sql.ts"`, `"doctor": "node scripts/doctor.mjs"`, `"release": "node scripts/release.mjs"`.
- [ ] `next.config.ts`: header keamanan (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`), `images.unoptimized: true`.
- [ ] Jalankan `npm run build` → sukses; `npm test` → "No test files found" (exit 0 dengan `passWithNoTests`).
- [ ] Commit: `chore: kerangka Next.js 16 + alat uji + font lokal`.

### Task 2: Skema konten (zod) + data awal

**Files:**
- Create: `lib/content/schema.ts`, `lib/content/types.ts`, `lib/content/seed.ts`
- Test: `tests/unit/seed.test.ts`

**Interfaces (Produces):**
```ts
export type Lang = 'id' | 'en';
export type L = { id: string; en: string };
export type LineKey = 'found' | 'sell' | 'serve' | 'run';
export type FontKey = 'schibsted'|'marcellus'|'jakarta'|'archivo'|'unbounded'|'cormorant'|'host'|'quicksand'|'lora';
export type Img = { url: string; alt: L; width: number; height: number };
export type Theme = { wall: string; ink: string; muted: string; accent: string; btnBg: string; btnInk: string };
export type Fact = { value: string; label: L };
export type SiteSettings = { name: string; role: L; notice: L; showNotice: boolean; email: string; whatsapp: string; whatsappDisplay: string; whatsappMessage: L; linkedin: string; linkedinLabel: string; github: string; photo: Img | null; footer: L; seoTitle: L; seoDescription: L; availability: { show: boolean; text: L } };
export type Line = { key: LineKey; name: L; color: string; colorDark: string; sort: number };
export type Sections = { hero: Hero; works: Works; services: Services; process: Process; testimonials: Testimonials; about: About; faq: Faq; contact: Contact };
export type Project = { id: string; slug: string; sort: number; published: boolean; name: string; mapLabel: string; mapSlot: 1|2|3|4|5|6|7|8; titleFont: FontKey; titleStyle: { size: 'md'|'lg'|'xl'; uppercase: boolean; weight: 400|500|600|700|800; tracking: number }; meta: L; text: L; lines: LineKey[]; theme: Theme; facts: Fact[]; status: L | null; liveUrl: string; liveLabel: string; liveNote: L | null; previewUrl: string; layout: 'desk-phone'|'two-phones'|'back-desk'|'brand-card'; visuals: { role: 'desk'|'phone'|'back'; image: Img }[]; brand: { logoUrl: string; swatches: { name: string; color: string }[]; note: L } | null; pattern: 'none'|'checker'|'glow' };
export type Block = { type: 'prose'; title: L; paragraphs: L[] } | { type: 'features'; title: L; items: { title: L; text: L; images: Img[] }[] } | { type: 'flow'; title: L; steps: L[] } | { type: 'decisions'; title: L; items: { title: L; text: L }[] } | { type: 'numbers'; title: L; facts: Fact[]; stack: L };
export type CaseStudy = { projectSlug: string; published: boolean; subtitle: L; labels: { client: string; field: L; role: L; year: string }; cover: Img | null; blocks: Block[] };
export type Content = { settings: SiteSettings; sections: Sections; lines: Line[]; projects: Project[]; caseStudies: CaseStudy[] };
export const ContentSchema: z.ZodType<Content>; // plus per-part schemas: SettingsSchema, SectionSchemas[key], LineSchema, ProjectSchema, CaseStudySchema
export const seed: Content;
```

- [ ] Tulis test gagal `tests/unit/seed.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { ContentSchema } from '@/lib/content/schema';
import { seed } from '@/lib/content/seed';
describe('seed', () => {
  it('valid terhadap skema', () => { expect(ContentSchema.safeParse(seed).success).toBe(true); });
  it('slug & mapSlot unik', () => {
    const slugs = seed.projects.map(p => p.slug); const slots = seed.projects.map(p => p.mapSlot);
    expect(new Set(slugs).size).toBe(slugs.length); expect(new Set(slots).size).toBe(slots.length);
  });
  it('setiap studi kasus menunjuk proyek yang ada', () => {
    for (const c of seed.caseStudies) expect(seed.projects.some(p => p.slug === c.projectSlug)).toBe(true);
  });
  it('tidak ada kata AI atau merek operator di konten', () => {
    expect(JSON.stringify(seed)).not.toMatch(/<merek operator>|\bAI\b|kecerdasan buatan/i);
  });
});
```
- [ ] `npm test` → FAIL (modul belum ada).
- [ ] Implementasi `schema.ts` (zod, `L = z.object({id: z.string(), en: z.string()})`, hex `/^#[0-9a-fA-F]{6}$/`), `types.ts` (re-export `z.infer`), `seed.ts` (seluruh konten preview: settings, 8 sections, 4 lines, 8 projects urut Aliya, HRIS, Biansa, Portal, Ciri, Web, Internet Bandung, POINT POS; 8 studi kasus — Aliya dari preview, 7 lainnya disusun dari `portfolio-notes`).
- [ ] `npm test` → PASS. Commit: `feat(content): skema zod + konten awal`.

### Task 3: Utilitas kontras & i18n

**Files:** Create `lib/contrast.ts`, `lib/i18n.ts`; Test `tests/unit/contrast.test.ts`, `tests/unit/i18n.test.ts`

**Produces:** `contrastRatio(a: string, b: string): number`, `checkTheme(t: Theme): { pair: string; ratio: number; min: number; ok: boolean }[]` (ink/wall ≥ 4.5, muted/wall ≥ 4.5, btnInk/btnBg ≥ 4.5, accent/wall ≥ 3), `t(l: L, lang: Lang): string`, `homePath(lang)`, `workPath(lang, slug)`, `altLangPath(pathname: string): string`.

- [ ] Test: `contrastRatio('#000000','#ffffff')` ≈ 21; `contrastRatio('#777777','#ffffff')` ≈ 4.48; semua tema seed lolos `checkTheme`; `altLangPath('/karya/ciri') === '/en/work/ciri'`, `altLangPath('/en') === '/'`.
- [ ] Implementasi (rumus WCAG relative luminance). PASS. Commit.

### Task 4: ContentStore + LocalStore + getter ber-cache

**Files:** Create `lib/content/store.ts`, `lib/content/local-store.ts`, `lib/content/get.ts`, `lib/env.ts`; Test `tests/unit/local-store.test.ts`

**Produces:**
```ts
export interface ContentStore {
  read(): Promise<Content>;                       // semua (termasuk draf) — untuk admin
  saveSettings(v: SiteSettings): Promise<void>;
  saveSection<K extends keyof Sections>(key: K, v: Sections[K]): Promise<void>;
  saveLines(v: Line[]): Promise<void>;
  saveProject(v: Project): Promise<void>;          // insert atau update by id
  deleteProject(id: string): Promise<void>;
  reorderProjects(ids: string[]): Promise<void>;
  saveCaseStudy(v: CaseStudy): Promise<void>;
}
export function backend(): 'supabase' | 'local' | 'seed';   // lib/env.ts
export async function getStore(): Promise<ContentStore>;     // lib/content/store.ts
export const getPublicContent: () => Promise<Content>;       // lib/content/get.ts — unstable_cache tag 'content', hanya terbit
```
- [ ] Test LocalStore di direktori sementara: baca → sama dengan seed; `saveProject` mengubah nama → `read()` mengembalikan nama baru; `reorderProjects` membalik urutan; data rusak ditolak (zod) dan file tidak berubah.
- [ ] Implementasi: file `.data/content.json` (dibuat dari seed bila belum ada), tulis atomik (tmp + rename). `backend()`: `supabase` bila `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` ada; `local` bila tidak ada dan `NODE_ENV !== 'production'` atau `PORTO_LOCAL=1`; selain itu `seed` (baca-saja).
- [ ] PASS. Commit.

### Task 5: Skema Supabase + seed SQL + uji RLS

**Files:** Create `supabase/migrations/0001_init.sql`, `scripts/gen-seed-sql.ts`, `supabase/seed.sql` (hasil generate); Test `tests/sql/rls.test.ts`

Tabel: `site_settings(id int pk check (id=1), data jsonb, updated_at)`, `sections(key text pk check in (...), data jsonb)`, `lines(key text pk, sort int, data jsonb)`, `projects(id uuid pk default gen_random_uuid(), slug text unique, sort int, published bool, data jsonb, updated_at)`, `case_studies(project_slug text pk references projects(slug) on update cascade on delete cascade, published bool, data jsonb)`, `admins(user_id uuid pk references auth.users on delete cascade)`. Fungsi `public.is_admin()` security definer `stable`. Policy: `select` publik untuk settings/sections/lines; `select` publik `published = true` untuk projects & case_studies; `select` semua + `insert/update/delete` untuk `is_admin()`; admins: user bisa `select` barisnya sendiri. Storage: bucket `media` publik, policy insert/update/delete untuk `is_admin()`.

- [ ] Test PGlite: buat stub `auth` (`auth.users`, `auth.uid()` membaca `current_setting('request.jwt.claim.sub', true)`), role `anon` & `authenticated`, jalankan migrasi + seed. Kasus: anon membaca 8 proyek terbit; anon gagal `update projects`; draf tidak terbaca anon; authenticated non-admin gagal update; admin berhasil update & insert; `seed.sql` bisa dijalankan dua kali (idempoten, `on conflict do update`).
- [ ] Implementasi migrasi & generator. PASS. Commit.

### Task 6: SupabaseStore, klien Supabase, doctor

**Files:** Create `lib/supabase/server.ts` (`createServerSupabase()` dengan cookies, untuk admin), `lib/supabase/public.ts` (klien anon tanpa cookie, untuk cache publik), `lib/supabase/browser.ts`, `lib/content/supabase-store.ts`, `scripts/doctor.mjs`

- [ ] `SupabaseStore.read()` memilih semua tabel dan memvalidasi dengan zod (baris rusak dilaporkan, tidak membuat halaman crash; fallback ke seed per bagian). Tulis memakai klien ber-cookie (RLS admin).
- [ ] `doctor.mjs`: cek variabel lingkungan, ping tabel, hitung baris, cek bucket `media`, cek ada minimal satu admin (via RPC `admin_count()` security definer).
- [ ] `npm run typecheck` bersih. Commit.

### Task 7: Situs publik — beranda

**Files:** Create `app/(id)/layout.tsx`, `app/(id)/page.tsx`, `app/en/layout.tsx`, `app/en/page.tsx`, `components/site/{Header,MobileMenu,Notice,Hero,TransitMap,Works,Room,RoomVisual,Services,Process,Testimonials,About,Faq,Contact,Footer,HomePage}.tsx`, `components/site/site.css` (port semua bagian beranda dari `styles.css`), `public/media/seed/*.webp`, `public/preview/*.html`, `public/media/seed/biansa-logo.svg`; Test `tests/e2e/site.mjs`

- [ ] Port markup `index.html` ke komponen; teks dari konten via `t(x, lang)`. Ruang diberi nomor dari urutan. Denah: 8 slot tetap (koordinat dari preview), stasiun = proyek per `mapSlot`, label = `mapLabel`. Tombol Preview = `<a target="_blank" rel="noopener">` ke `previewUrl`. Bagian Testimoni/FAQ dirender hanya bila `visible` dan ada item.
- [ ] Salin 7 file preview ke `public/preview/` dan gambar ke `public/media/seed/` (WebP, skrip `scripts/export-seed-media.py`).
- [ ] E2E (Playwright, `next start` mode local): `/` berisi h1 Indonesia; `/en` berisi h1 English; tautan EN/ID menuju halaman padanan; 8 ruang; filter "Melayani" menyisakan 2 ruang; setiap tombol Preview punya `target=_blank` dan file-nya merespon 200; menu HP terbuka & tertutup; tidak ada error konsol.
- [ ] Commit.

### Task 8: Studi kasus

**Files:** Create `app/(id)/karya/[slug]/page.tsx`, `app/en/work/[slug]/page.tsx`, `components/site/{CaseStudyPage,blocks/*}.tsx`, `components/site/case.css`

- [ ] `generateStaticParams` dari proyek terbit yang studinya terbit; 404 bila tidak ada. Tombol "Lihat studi kasus" di ruang hanya muncul bila studi terbit. Navigasi "Ruang berikutnya".
- [ ] E2E: `/karya/aliya-syifaa` dan `/en/work/aliya-syifaa` render judul + label; slug salah → 404.
- [ ] Commit.

### Task 9: Animasi

**Files:** Create `components/motion/{HomeMotion,CaseMotion}.tsx`, `lib/motion/{split-words,wall-wipe,transit}.ts`

- [ ] Port `app.js` (bagian Theme, wipe, ScrollTrigger, matchMedia, split words, trains, count-up, iris, contact) ke `useEffect` + `gsap.context()` dengan cleanup. Tidak ada state tersembunyi sebelum JS berjalan (semua `from()` diset di dalam `matchMedia` gerak-penuh).
- [ ] E2E: mode `reducedMotion: 'reduce'` → tidak ada elemen konten ber-opacity 0; mode normal → setelah gulir ke tiap ruang 2 detik, teks ruang opacity 1; `--wall` berubah sesuai ruang.
- [ ] Commit.

### Task 10: SEO & metadata

**Files:** Create `app/(id)/opengraph-image.tsx`, `app/en/opengraph-image.tsx`, `lib/og.tsx`, `app/icon.svg`, `app/sitemap.ts`, `app/robots.ts`; Modify layouts (`generateMetadata` dari settings: title, description, `alternates.languages`, openGraph), JSON-LD `Person`.

- [ ] E2E: `/sitemap.xml` memuat `/`, `/en`, semua studi kasus; `/robots.txt` melarang `/admin`; `/opengraph-image` merespon `image/png`.
- [ ] Commit.

### Task 11: Admin — autentikasi & kerangka

**Files:** Create `proxy.ts`, `app/admin/layout.tsx`, `app/admin/login/{page.tsx,actions.ts}`, `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/page.tsx`, `lib/admin/auth.ts`, `components/admin/{AdminShell,Toast}.tsx`, `components/admin/admin.css`

**Produces:** `requireAdmin(): Promise<{ email: string }>` (melempar redirect ke `/admin/login` bila tidak sah) — dipanggil di setiap layout panel dan setiap server action.

- [ ] Mode supabase: `signInWithPassword`; cek baris di `admins`. Mode local: kata sandi dari `ADMIN_LOCAL_PASSWORD` (default `portofolio-lokal` hanya bila `NODE_ENV !== 'production'`), sesi cookie HMAC (`lib/admin/local-session.ts`). Mode seed: halaman login menampilkan langkah menghubungkan Supabase.
- [ ] `proxy.ts` (matcher `/admin/:path*`): segarkan sesi Supabase, alihkan ke login bila tidak ada sesi.
- [ ] E2E: `/admin` tanpa sesi → `/admin/login`; kata sandi salah → pesan galat jelas; benar → ringkasan.
- [ ] Commit.

### Task 12: Admin — pengaturan, bagian beranda, jalur

**Files:** Create `app/admin/(panel)/settings/page.tsx`, `app/admin/(panel)/sections/[key]/page.tsx`, `app/admin/(panel)/lines/page.tsx`, `app/admin/actions.ts`, `components/admin/fields/{LocalizedField,TextField,ToggleField,ListField,ImageField}.tsx`, `components/admin/forms/{SettingsForm,SectionForm,LinesForm}.tsx`

**Produces (server actions):** `saveSettingsAction(v)`, `saveSectionAction(key, v)`, `saveLinesAction(v)` → `{ ok: true } | { ok: false; error: string; issues?: string[] }`; semua memanggil `requireAdmin()`, validasi zod, `store.save*`, lalu `updateTag('content')` + `revalidatePath('/', 'layout')`.

- [ ] Form klien dengan field ID|EN berdampingan, daftar yang bisa ditambah/hapus/urut, sakelar tampil.
- [ ] E2E: ubah judul hero (ID) → simpan → `/` menampilkan teks baru.
- [ ] Commit.

### Task 13: Admin — proyek

**Files:** Create `app/admin/(panel)/projects/page.tsx`, `app/admin/(panel)/projects/[id]/page.tsx`, `components/admin/forms/ProjectForm.tsx`, `components/admin/fields/{ThemeField,FactsField,VisualsField}.tsx`, `components/admin/RoomPreview.tsx`; Modify `app/admin/actions.ts` (+ `saveProjectAction`, `deleteProjectAction`, `reorderProjectsAction`, `togglePublishAction`)

- [ ] Daftar: urut naik/turun, sakelar terbit, tambah proyek baru (slug unik), hapus dengan konfirmasi.
- [ ] Form: semua field `Project`; `ThemeField` menampilkan rasio kontras tiap pasangan (lolos/gagal); `RoomPreview` merender `<Room>` yang sama dengan situs dari state form.
- [ ] E2E: ubah warna `ink` ke warna yang mirip `wall` → peringatan kontras muncul; simpan nama baru → tampil di beranda; sembunyikan proyek → hilang dari beranda.
- [ ] Commit.

### Task 14: Admin — studi kasus (editor blok)

**Files:** Create `app/admin/(panel)/projects/[id]/case/page.tsx`, `components/admin/forms/CaseStudyForm.tsx`, `components/admin/blocks/*Editor.tsx`; Modify `app/admin/actions.ts` (+ `saveCaseStudyAction`)

- [ ] Tambah blok (5 jenis), ubah, urutkan, hapus; sakelar terbit.
- [ ] E2E: tambah blok prosa → tampil di `/karya/<slug>`.
- [ ] Commit.

### Task 15: Upload gambar

**Files:** Create `lib/admin/compress.ts` (canvas → WebP, maks 2400 px), `lib/admin/upload.ts` (`uploadImage(file): Promise<Img>`), `app/admin/upload-local/route.ts` (mode local saja, `requireAdmin`); Modify `ImageField.tsx`

- [ ] Mode supabase: upload ke bucket `media/<uuid>.webp` dengan klien browser bersesi. Mode local: POST ke route lokal → `public/media/uploads/`. Tolak non-gambar & > 8 MB.
- [ ] E2E: upload PNG kecil di form Tentang/Settings → URL WebP tersimpan dan tampil.
- [ ] Commit.

### Task 16: QA menyeluruh

- [ ] Screenshot desktop 1440 & HP 390 (terang/gelap) setiap bagian + studi kasus + admin; bandingkan dengan preview.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` bersih.
- [ ] Review independen (subagen tanpa konteks) atas kode & tampilan; perbaiki temuan.

### Task 17: Dokumentasi & rilis v0.1.0

**Files:** Create `README.md`, `CHANGELOG.md`, `docs/updates/BACA-INI-v0.1.0.txt`, `scripts/release.mjs`

- [ ] README Indonesia: langkah Supabase (SQL editor: migrasi lalu seed), buat akun admin + SQL `insert into admins`, variabel Vercel, hubungkan repo, cara menambah file preview, cara memasang update.
- [ ] `release.mjs`: cek tree bersih, jalankan lint/typecheck/test/build, `git archive --format=zip -o ../rilis/portofolio-v<versi>.zip HEAD`, cetak checksum.
- [ ] Commit `release: v0.1.0`, buat zip, kirim dengan perintah siap salin.
