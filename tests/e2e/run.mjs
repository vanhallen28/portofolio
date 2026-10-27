#!/usr/bin/env node
/* End-to-end check of the whole site + admin, in local mode (no Supabase needed).
   npm run test:e2e            build, start, test
   npm run test:e2e -- --no-build   reuse the last build (must have been built with PORTO_LOCAL=1)

   Uses the Chromium that ships with Playwright in this workspace. Exit code 1 on any failure. */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

/* Playwright is not a project dependency (keeps installs small). Use a local or global install:
   npm i -D playwright && npx playwright install chromium */
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
}

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = Number(process.env.E2E_PORT) || 3217;
const BASE = `http://localhost:${PORT}`;
const tmp = mkdtempSync(path.join(tmpdir(), "porto-e2e-"));
const env = {
  ...process.env,
  PORTO_LOCAL: "1",
  PORTO_DATA_FILE: path.join(tmp, "content.json"),
  ADMIN_LOCAL_PASSWORD: "rahasia-uji",
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  NEXT_TELEMETRY_DISABLED: "1",
};

const results = [];
let current = "";
async function test(name, fn) {
  current = name;
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e });
    console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n").join("\n      ")}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
/** Click "Simpan & tayangkan" and wait for the result toast; fails with the toast text. */
async function saveAndWait(p) {
  await p.getByRole("button", { name: "Simpan & tayangkan" }).click();
  const toast = p.locator(".adm-toast").last();
  await toast.waitFor({ timeout: 15000 });
  const bad = await toast.evaluate((el) => el.classList.contains("is-bad"));
  if (bad) throw new Error(`simpan gagal: ${await toast.textContent()}`);
  await toast.locator("button").click();
}
/** Public pages refresh right after a save; allow a short moment for regeneration. */
async function pageHas(url, text, want = true) {
  for (let i = 0; i < 10; i++) {
    const html = await (await fetch(url)).text();
    if (html.includes(text) === want) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

// The content file both the build and the server use: a fresh copy of the seed for every run.
const dump = spawnSync("npx", ["tsx", "-e", `import { writeFileSync } from "node:fs"; import { seed } from "./lib/content/seed"; writeFileSync(${JSON.stringify(path.join(tmp, "content.json"))}, JSON.stringify(seed));`], { cwd: ROOT, env, stdio: "inherit" });
if (dump.status !== 0) process.exit(1);

if (!process.argv.includes("--no-build")) {
  console.log("Build (mode lokal)…");
  rmSync(path.join(ROOT, ".next", "cache"), { recursive: true, force: true }); // no content cached by earlier runs
  const b = spawnSync("npx", ["next", "build"], { cwd: ROOT, env, stdio: "inherit" });
  if (b.status !== 0) process.exit(1);
}

console.log("Menjalankan server…");
try {
  await fetch(`${BASE}/robots.txt`);
  console.error(`Port ${PORT} sudah dipakai server lain. Hentikan dulu, lalu jalankan ulang.`);
  process.exit(1);
} catch { /* free */ }
// Own process group, so stopping it also stops the next-server child.
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
const stopServer = () => { try { process.kill(-server.pid, "SIGTERM"); } catch { /* already gone */ } };
process.on("exit", stopServer);
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${BASE}/robots.txt`)).ok) break; } catch { /* not up yet */ }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const consoleErrors = [];
async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`[${current}] ${m.text()}`); });
  p.on("pageerror", (e) => consoleErrors.push(`[${current}] ${e.message}`));
  return p;
}
const seed = JSON.parse(readFileSync(env.PORTO_DATA_FILE, "utf8"));
const firstSlug = seed.projects[0].slug;

try {
  console.log("\nSitus publik");
  const p = await page();

  await test("beranda Indonesia & English", async () => {
    await p.goto(`${BASE}/`);
    assert((await p.textContent("h1")).includes(seed.sections.hero.title.id.slice(0, 20)), "judul ID tidak tampil");
    assert((await p.getAttribute("html", "lang")) === "id", "lang bukan id");
    await p.goto(`${BASE}/en`);
    assert((await p.textContent("h1")).includes(seed.sections.hero.title.en.slice(0, 20)), "judul EN tidak tampil");
    assert((await p.getAttribute("html", "lang")) === "en", "lang bukan en");
  });

  await test("tombol bahasa menuju halaman padanan", async () => {
    await p.goto(`${BASE}/karya/${firstSlug}`);
    assert((await p.getAttribute('.lang a[hreflang="en"]', "href")) === `/en/work/${firstSlug}`, "link EN salah");
    await p.goto(`${BASE}/en/work/${firstSlug}`);
    assert((await p.getAttribute('.lang a[hreflang="id"]', "href")) === `/karya/${firstSlug}`, "link ID salah");
  });

  await test("8 ruang dan filter jalur", async () => {
    await p.goto(`${BASE}/`);
    await p.waitForTimeout(400);
    assert((await p.locator(".room").count()) === seed.projects.length, "jumlah ruang salah");
    await p.click('[data-filter="serve"]');
    const visible = await p.locator(".room:not([hidden])").count();
    const expected = seed.projects.filter((x) => x.lines.includes("serve")).length;
    assert(visible === expected, `filter Melayani: ${visible} ruang, harusnya ${expected}`);
    await p.click('[data-filter="all"]');
    assert((await p.locator(".room:not([hidden])").count()) === seed.projects.length, "filter Semua tidak mengembalikan semua ruang");
  });

  await test("tombol Preview membuka file yang benar di tab baru", async () => {
    const links = await p.$$eval("a[data-preview]", (as) => as.map((a) => ({ href: a.getAttribute("href"), target: a.target, rel: a.rel })));
    assert(links.length >= 6, `hanya ${links.length} tombol preview`);
    for (const l of links) {
      assert(l.target === "_blank" && l.rel.includes("noopener"), `${l.href} tidak membuka tab baru`);
      const r = await fetch(`${BASE}${l.href}`);
      assert(r.ok && (r.headers.get("content-type") ?? "").includes("text/html"), `${l.href} → ${r.status}`);
      assert(/sandbox/.test(r.headers.get("content-security-policy") ?? ""), `${l.href} tidak di-sandbox`);
    }
  });

  await test("file preview tetap berjalan di dalam sandbox", async () => {
    const files = [...new Set(seed.projects.map((x) => x.previewUrl).filter(Boolean))];
    for (const f of files) {
      const v = await page();
      const errors = [];
      // The Biansa screens load Tailwind from its CDN; without internet that global is missing.
      v.on("pageerror", (e) => { if (!/tailwind is not defined/.test(e.message)) errors.push(e.message); });
      await v.goto(`${BASE}${f}`, { waitUntil: "load" });
      await v.waitForTimeout(800);
      // Some previews render inside their own iframes, so count those as content too.
      const hasContent = await v.evaluate(() => document.body.innerText.trim().length > 40 || document.querySelectorAll("iframe").length > 0);
      assert(hasContent, `${f}: halaman kosong`);
      assert(errors.length === 0, `${f}: ${errors[0]}`);
      await v.context().close();
    }
  });

  await test("dinding berganti warna dan isi ruang tampil saat digulir", async () => {
    for (const proj of seed.projects.slice(0, 3)) {
      await p.evaluate((id) => document.getElementById(id).scrollIntoView({ block: "start" }), `ruang-${proj.slug}`);
      await p.waitForTimeout(1900);
      const wall = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--wall").trim().toUpperCase());
      assert(wall === proj.theme.wall.toUpperCase(), `${proj.slug}: --wall ${wall}, harusnya ${proj.theme.wall}`);
      const op = await p.$eval(`#ruang-${proj.slug} .room-text`, (el) => getComputedStyle(el).opacity);
      assert(op === "1", `${proj.slug}: teks ruang belum tampil (opacity ${op})`);
    }
  });

  await test("studi kasus ID/EN dan 404", async () => {
    await p.goto(`${BASE}/karya/${firstSlug}`);
    assert((await p.textContent("h1")).includes(seed.projects[0].name), "judul studi kasus tidak tampil");
    assert((await p.locator(".case-label dt").count()) >= 4, "label studi kasus kurang");
    await p.goto(`${BASE}/en/work/${firstSlug}`);
    assert((await p.textContent(".case-label")).includes("Client"), "label EN tidak tampil");
    const r = await fetch(`${BASE}/karya/tidak-ada`);
    assert(r.status === 404, `slug salah → ${r.status}`);
    const g = await fetch(`${BASE}/halaman-acak`);
    assert(g.status === 404, `URL acak → ${g.status}`);
  });

  await test("SEO: sitemap, robots, gambar kartu link", async () => {
    const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
    assert(sm.includes("/en</loc>") && sm.includes(`/karya/${firstSlug}`), "sitemap kurang lengkap");
    const rb = await (await fetch(`${BASE}/robots.txt`)).text();
    assert(/Disallow: \/admin/.test(rb), "robots tidak melarang /admin");
    await p.goto(`${BASE}/`);
    const og = await p.getAttribute('meta[property="og:image"]', "content");
    const r = await fetch(og.replace(/^https?:\/\/[^/]+/, BASE));
    assert(r.ok && r.headers.get("content-type") === "image/png", `og:image ${r.status} ${r.headers.get("content-type")}`);
  });

  await test("deretan klien, FAQ, dan riwayat kerja tampil", async () => {
    await p.goto(`${BASE}/`);
    const clients = seed.sections.hero.clients.items.length;
    assert((await p.locator(".clients-list li").count()) === clients, "jumlah klien salah");
    assert((await p.locator(".clients-list a").first().getAttribute("href")).startsWith("#ruang-"), "nama klien tidak menuju ruangnya");
    assert((await p.locator(".faq-list details").count()) === seed.sections.faq.items.length, "FAQ tidak lengkap");
    assert((await p.locator(".exp-list li").count()) === seed.sections.about.experience.length, "riwayat kerja tidak tampil");
    const withResult = seed.projects.find((x) => x.result);
    assert(await p.isVisible(`#ruang-${withResult.slug} .room-result`), "kalimat hasil tidak tampil di ruang");
  });

  await test("studi kasus memakai warna kliennya dan menampilkan blok hasil", async () => {
    const cs = seed.caseStudies.find((c) => c.theme && c.blocks.some((b) => b.type === "results"));
    await p.goto(`${BASE}/karya/${cs.projectSlug}`);
    const wall = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--wall").trim().toUpperCase());
    assert(wall === cs.theme.wall.toUpperCase(), `--wall ${wall}, harusnya ${cs.theme.wall}`);
    assert(await p.isVisible(".case-results .res-after"), "blok hasil tidak tampil");
  });

  await p.context().close();

  await test("bilah WhatsApp di HP muncul setelah hero dan sembunyi di kontak", async () => {
    const m = await page({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await m.goto(`${BASE}/`);
    await m.waitForTimeout(500);
    const hidden = () => m.$eval("[data-sticky-cta]", (el) => el.classList.contains("is-hidden"));
    assert(await hidden(), "bilah tampil padahal tombol hero masih terlihat");
    await m.evaluate(() => document.getElementById("karya").scrollIntoView({ behavior: "instant" }));
    await m.waitForTimeout(700);
    assert(!(await hidden()), "bilah tidak muncul setelah hero");
    assert((await m.getAttribute("[data-sticky-cta] a", "href")).startsWith("https://wa.me/"), "link bilah bukan WhatsApp");
    await m.evaluate(() => document.getElementById("kontak").scrollIntoView({ behavior: "instant" }));
    await m.waitForTimeout(700);
    assert(await hidden(), "bilah tidak sembunyi di bagian kontak");
    await m.context().close();
  });

  await test("menu HP terbuka dan tertutup", async () => {
    const m = await page({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await m.goto(`${BASE}/`);
    await m.click(".menu-btn");
    assert(await m.isVisible("#mnav"), "menu tidak terbuka");
    await m.keyboard.press("Escape");
    assert(!(await m.isVisible("#mnav")), "menu tidak tertutup dengan Escape");
    await m.click(".menu-btn");
    await m.click("#mnav li a >> nth=0");
    assert(!(await m.isVisible("#mnav")), "menu tidak tertutup setelah memilih link");
    await m.context().close();
  });

  await test("reduced motion: tidak ada isi yang tersembunyi", async () => {
    const r = await page({ reducedMotion: "reduce" });
    await r.goto(`${BASE}/`);
    await r.waitForTimeout(600);
    const hidden = await r.$$eval("h1, h2, h3, .room-text, .facts dt, .btn, .shot, .hero-lede", (els) =>
      els.filter((el) => getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden").map((el) => el.className || el.tagName));
    assert(hidden.length === 0, `tersembunyi: ${hidden.slice(0, 5).join(", ")}`);
    await r.context().close();
  });

  await test("tanpa JavaScript: isi dan warna ruang tetap tampil", async () => {
    const n = await page({ javaScriptEnabled: false });
    await n.goto(`${BASE}/`);
    const bg = await n.$eval(`#ruang-${firstSlug}`, (el) => getComputedStyle(el).backgroundColor);
    assert(bg !== "rgba(0, 0, 0, 0)", "ruang tidak berwarna tanpa JS");
    assert(await n.isVisible(`#ruang-${firstSlug} .room-title`), "judul ruang tidak terlihat");
    await n.context().close();
  });

  console.log("\nPanel admin");
  const a = await page();

  await test("login: tanpa sesi dialihkan, sandi salah ditolak, sandi benar masuk", async () => {
    await a.goto(`${BASE}/admin`);
    assert(a.url().includes("/admin/login"), `tidak dialihkan ke login: ${a.url()}`);
    await a.fill('input[name="password"]', "salah");
    await a.click('button[type="submit"]');
    await a.waitForSelector(".adm-error");
    assert((await a.textContent(".adm-error")).includes("salah"), "pesan sandi salah tidak jelas");
    await a.fill('input[name="password"]', env.ADMIN_LOCAL_PASSWORD);
    await a.click('button[type="submit"]');
    await a.waitForURL(`${BASE}/admin`);
    assert((await a.textContent("h1")) === "Ringkasan", "ringkasan tidak tampil");
  });

  await test("ubah judul hero → tampil di beranda", async () => {
    await a.goto(`${BASE}/admin/sections/hero`);
    const field = a.locator('textarea[aria-label="Judul besar (Indonesia)"]');
    await field.fill("Judul uji dari panel admin.");
    await saveAndWait(a);
    assert(await pageHas(`${BASE}/`, "Judul uji dari panel admin."), "judul baru belum tampil di beranda");
  });

  const pid = seed.projects[1].id, pslug = seed.projects[1].slug;
  await test("proyek: peringatan kontras, ganti nama tampil, sembunyikan hilang dari beranda", async () => {
    await a.goto(`${BASE}/admin/projects/${pid}`);
    const ink = a.locator(".adm-color").nth(1).locator("input.adm-input");
    await ink.fill(seed.projects[1].theme.wall);
    await a.waitForSelector(".adm-contrast li.is-bad");
    await ink.fill(seed.projects[1].theme.ink);
    const name = a.getByLabel("Nama proyek");
    await name.fill("Nama Uji Proyek");
    await saveAndWait(a);
    assert(await pageHas(`${BASE}/`, "Nama Uji Proyek"), "nama baru tidak tampil");
    await a.goto(`${BASE}/admin/projects`);
    await a.getByLabel("Tayangkan Nama Uji Proyek").uncheck();
    await a.waitForSelector(".adm-toast:not(.is-bad)");
    assert(await pageHas(`${BASE}/`, `id="ruang-${pslug}"`, false), "proyek draf masih tampil");
    await a.getByLabel("Tayangkan Nama Uji Proyek").check();
    await a.waitForSelector(".adm-toast:not(.is-bad)");
    assert(await pageHas(`${BASE}/`, `id="ruang-${pslug}"`), "proyek tidak kembali tampil");
  });

  await test("studi kasus: tambah blok prosa → tampil di halaman", async () => {
    await a.goto(`${BASE}/admin/projects/${pid}/case`);
    await a.click("text=Tambah blok: Prosa");
    const blocks = a.locator(".adm-card").filter({ hasText: "Isi (blok)" }).locator(".adm-item").filter({ hasText: "Prosa ·" });
    const last = blocks.last();
    await last.locator('textarea[aria-label="Isi (Indonesia)"]').first().fill("Paragraf uji dari editor blok.");
    await saveAndWait(a);
    assert(await pageHas(`${BASE}/karya/${pslug}`, "Paragraf uji dari editor blok."), "blok baru tidak tampil");
  });

  await test("upload gambar dikompres ke WebP dan tampil", async () => {
    const png = path.join(ROOT, "tests/e2e/fixture.png");
    await a.goto(`${BASE}/admin/settings`);
    await a.locator(".adm-image input[type=file]").first().setInputFiles(png);
    await a.waitForFunction(() => [...document.querySelectorAll(".adm-image input.adm-input")].some((i) => i.value.startsWith("/media-local/")));
    const url = await a.locator(".adm-image input.adm-input").first().inputValue();
    const r = await fetch(`${BASE}${url}`);
    assert(r.ok && r.headers.get("content-type") === "image/webp", `gambar upload ${r.status}`);
    await saveAndWait(a);
    assert(await pageHas(`${BASE}/`, url), "foto baru tidak tampil di beranda");
  });

  await test("CV PDF diunggah dan tombol unduhnya tampil", async () => {
    await a.goto(`${BASE}/admin/settings`);
    const cv = a.locator(".adm-card").filter({ hasText: "File CV" });
    await cv.locator('input[type=file]').setInputFiles(path.join(ROOT, "tests/e2e/fixture.pdf"));
    await a.waitForFunction(() => [...document.querySelectorAll(".adm-card input.adm-input")].some((i) => i.value.endsWith(".pdf")));
    await saveAndWait(a);
    const html = await (await fetch(`${BASE}/`)).text();
    const m = /href="(\/media-local\/[0-9a-f-]+\.pdf)"/.exec(html);
    assert(m, "tombol CV tidak tampil di beranda");
    const r = await fetch(`${BASE}${m[1]}`);
    assert(r.ok && r.headers.get("content-type") === "application/pdf", `PDF ${r.status}`);
  });

  await test("data tidak valid ditolak dengan pesan jelas", async () => {
    await a.goto(`${BASE}/admin/settings`);
    await a.getByLabel("Nomor WhatsApp").fill("12");
    await a.getByRole("button", { name: "Simpan & tayangkan" }).click();
    await a.waitForSelector(".adm-toast.is-bad");
    assert((await a.textContent(".adm-toast.is-bad")).includes("whatsapp"), "pesan galat tidak menyebut kolomnya");
  });

  await test("pindah halaman dengan perubahan belum disimpan meminta konfirmasi", async () => {
    await a.goto(`${BASE}/admin/sections/contact`);
    await a.locator('textarea[aria-label="Kalimat penutup (Indonesia)"]').fill("Belum disimpan");
    let asked = "";
    a.once("dialog", (d) => { asked = d.message(); void d.dismiss(); });
    await a.click('.adm-nav a[href="/admin/settings"]');
    await a.waitForTimeout(500);
    assert(asked.includes("belum disimpan"), "tidak ada konfirmasi");
    assert(a.url().endsWith("/admin/sections/contact"), "halaman tetap berpindah setelah Batal");
  });

  await a.context().close();

  await test("tidak ada error di konsol", async () => {
    // 404s are expected (404 tests); net::ERR_* are external files (e.g. Google Fonts in a preview) when offline.
    const real = consoleErrors.filter((e) => !/Failed to load resource: (the server responded with a status of 404|net::ERR_)|tailwind is not defined/.test(e));
    assert(real.length === 0, real.slice(0, 8).join("\n"));
  });
} finally {
  await browser.close();
  stopServer();
  rmSync(tmp, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  if (process.env.E2E_SERVER_LOG) console.log(serverLog.slice(-4000));
  process.exit(1);
}
