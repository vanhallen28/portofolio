import type { VitalName } from "./types";

/* Words for the admin's statistics: sources, countries, pages, devices, and web vitals. */

export const SOURCE_LABEL: Record<string, string> = {
  direct: "Langsung",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  yahoo: "Yahoo",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  behance: "Behance",
  dribbble: "Dribbble",
  x: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
  github: "GitHub",
  assistant: "ChatGPT, Perplexity, Gemini, dll.",
  internal: "Pindah halaman di situs",
};
export const sourceLabel = (k: string) => SOURCE_LABEL[k] ?? k;

export const DEVICE_LABEL: Record<string, string> = { desktop: "Desktop", phone: "HP", tablet: "Tablet" };
export const LANG_LABEL: Record<string, string> = { id: "Bahasa Indonesia", en: "English" };

let regions: Intl.DisplayNames | null = null;
export function countryLabel(code: string): string {
  if (!code) return "Tidak diketahui";
  try {
    regions ??= new Intl.DisplayNames(["id"], { type: "region" });
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}
export const flag = (code: string) => (/^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌐");

export function pageLabel(path: string, names: Record<string, string>): string {
  if (path === "/") return "Beranda";
  if (path === "/en") return "Beranda (English)";
  let m = /^\/karya\/([a-z0-9-]+)$/.exec(path);
  if (m) return `Studi kasus · ${names[m[1]] ?? m[1]}`;
  m = /^\/en\/work\/([a-z0-9-]+)$/.exec(path);
  if (m) return `Case study · ${names[m[1]] ?? m[1]} (English)`;
  return path;
}

/* ---- numbers ---- */
const nf = new Intl.NumberFormat("id-ID");
export const num = (n: number) => nf.format(n);
export const pct = (part: number, whole: number) => (whole ? `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: part / whole < 0.1 ? 1 : 0 }).format((part / whole) * 100)}%` : "0%");

/** Change against the previous period, e.g. "+12%", or null when there is nothing to compare with. */
export function delta(now: number, before: number): { text: string; dir: "up" | "down" | "same" } | null {
  if (!before) return now ? { text: "baru", dir: "up" } : null;
  const d = (now - before) / before;
  if (Math.abs(d) < 0.005) return { text: "0%", dir: "same" };
  return { text: `${d > 0 ? "+" : "−"}${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.abs(d) * 100)}%`, dir: d > 0 ? "up" : "down" };
}

/* ---- dates (WIB days as YYYY-MM-DD) ---- */
export const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const parts = (d: string) => d.split("-").map(Number) as [number, number, number];
export const dayShort = (d: string) => { const [, m, day] = parts(d); return `${day} ${MONTHS_SHORT[m - 1]}`; };
export const dayLong = (d: string) => { const [y, m, day] = parts(d); return `${day} ${MONTHS[m - 1]} ${y}`; };
export function rangeLabel(from: string, to: string): string {
  const [y1, m1, d1] = parts(from), [y2, m2, d2] = parts(to);
  if (from === to) return dayLong(from);
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MONTHS[m2 - 1]} ${y2}`;
  if (y1 === y2) return `${d1} ${MONTHS_SHORT[m1 - 1]} – ${d2} ${MONTHS_SHORT[m2 - 1]} ${y2}`;
  return `${d1} ${MONTHS_SHORT[m1 - 1]} ${y1} – ${d2} ${MONTHS_SHORT[m2 - 1]} ${y2}`;
}

/* ---- web vitals: Google's thresholds for the 75th percentile ---- */
export const VITAL_INFO: Record<VitalName, { label: string; what: string; good: number; poor: number; unit: "ms" | "" ; core: boolean }> = {
  LCP: { label: "LCP · Tampilan utama muncul", what: "Waktu sampai gambar atau teks terbesar di layar tampil.", good: 2500, poor: 4000, unit: "ms", core: true },
  INP: { label: "INP · Respons saat diklik", what: "Jeda dari ketukan atau klik sampai layar berubah.", good: 200, poor: 500, unit: "ms", core: true },
  CLS: { label: "CLS · Kestabilan tata letak", what: "Seberapa banyak isi bergeser sendiri saat halaman dimuat.", good: 0.1, poor: 0.25, unit: "", core: true },
  FCP: { label: "FCP · Isi pertama muncul", what: "Waktu sampai teks atau gambar pertama tampil.", good: 1800, poor: 3000, unit: "ms", core: false },
  TTFB: { label: "TTFB · Respons server", what: "Waktu sampai server mulai mengirim halaman.", good: 800, poor: 1800, unit: "ms", core: false },
};

export type Rating = "good" | "ni" | "poor";
export const rate = (name: VitalName, v: number): Rating => (v <= VITAL_INFO[name].good ? "good" : v <= VITAL_INFO[name].poor ? "ni" : "poor");
export const RATING_LABEL: Record<Rating, string> = { good: "Baik", ni: "Perlu perbaikan", poor: "Buruk" };

export function vitalValue(name: VitalName, v: number): string {
  if (VITAL_INFO[name].unit === "") return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  if (v >= 1000) return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(v / 1000)} s`;
  return `${Math.round(v)} ms`;
}
