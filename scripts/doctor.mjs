#!/usr/bin/env node
/* npm run doctor — checks the Supabase setup end to end, in plain language.
   Reads .env.local / .env when present (Node's built-in loader), otherwise the shell environment. */
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m, fix) => {
  console.log(`  ✗ ${m}${fix ? `\n      → ${fix}` : ""}`);
  failed = true;
};
let failed = false;

console.log("\nPemeriksaan portofolio\n");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();

console.log("Variabel lingkungan");
if (url) ok(`NEXT_PUBLIC_SUPABASE_URL = ${url}`);
else bad("NEXT_PUBLIC_SUPABASE_URL kosong", "Supabase → Project Settings → API → Project URL");
if (key) ok("NEXT_PUBLIC_SUPABASE_ANON_KEY terisi");
else bad("NEXT_PUBLIC_SUPABASE_ANON_KEY kosong", "Supabase → Project Settings → API → anon public key");
if (site) ok(`NEXT_PUBLIC_SITE_URL = ${site}`);
else console.log("  • NEXT_PUBLIC_SITE_URL kosong (boleh; Vercel memakai domain produksinya)");
if (process.env.SUPABASE_SERVICE_ROLE_KEY) bad("SUPABASE_SERVICE_ROLE_KEY ada di environment", "Hapus. Situs ini tidak memerlukannya dan kunci itu melewati semua aturan akses.");

if (!url || !key) {
  console.log("\nTanpa dua variabel di atas, situs memakai isi awal (baca saja) dan admin tidak bisa menyimpan.\n");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

console.log("\nDatabase");
const tables = [
  ["site_settings", 1],
  ["sections", 1],
  ["lines", 4],
  ["projects", 1],
  ["case_studies", 0],
];
for (const [t, min] of tables) {
  const r = await db.from(t).select("*", { count: "exact", head: true });
  if (r.error) bad(`Tabel ${t}: ${r.error.message}`, "Jalankan supabase/migrations/0001_init.sql di Supabase → SQL Editor");
  else if ((r.count ?? 0) < min) bad(`Tabel ${t} kosong`, "Jalankan supabase/seed.sql di Supabase → SQL Editor");
  else ok(`Tabel ${t}: ${r.count} baris terbaca publik`);
}

// Harmless probe: at worst it only touches updated_at.
const w = await db.from("site_settings").update({ updated_at: new Date().toISOString() }).eq("id", 1).select("id");
if (w.error || !w.data?.length) ok("Pengunjung tidak bisa mengubah konten (aturan akses aktif)");
else bad("Pengunjung BISA mengubah konten!", "Jalankan ulang 0001_init.sql agar aturan akses (RLS) terpasang");

const admins = await db.rpc("admin_count");
if (admins.error) bad(`Fungsi admin_count: ${admins.error.message}`, "Jalankan ulang 0001_init.sql");
else if (!admins.data) bad("Belum ada akun admin", "Lihat README langkah 4: buat user di Authentication, lalu jalankan insert into public.admins …");
else ok(`Akun admin: ${admins.data}`);

console.log("\nPenyimpanan gambar");
const probe = `doctor-${Date.now()}.webp`;
const up = await db.storage.from("media").upload(probe, new Blob(["x"], { type: "image/webp" }));
if (up.error && /bucket not found/i.test(up.error.message)) bad("Bucket media belum ada", "Jalankan ulang 0001_init.sql");
else if (up.error) ok("Bucket media ada, dan pengunjung tidak bisa upload");
else {
  await db.storage.from("media").remove([probe]);
  bad("Pengunjung BISA upload ke bucket media!", "Jalankan ulang 0001_init.sql");
}

console.log(failed ? "\nAda yang perlu dibereskan (lihat tanda ✗).\n" : "\nSemua beres.\n");
process.exit(failed ? 1 : 0);
