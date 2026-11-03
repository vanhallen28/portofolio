import type { DayRange, Device } from "./types";

/* Turning a raw hit into a tidy row: where it came from, on what, and on which WIB day. */

/** WIB has no daylight saving: a fixed UTC+7. */
const WIB_MS = 7 * 3600 * 1000;

/** The WIB calendar day of a moment, as YYYY-MM-DD. */
export function wibDay(t: Date | number = Date.now()): string {
  return new Date(+t + WIB_MS).toISOString().slice(0, 10);
}

/** Start of a WIB day as a UTC instant. */
export function wibStart(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) - WIB_MS);
}

export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
}

/** Every day of a range, oldest first. */
export function eachDay(r: DayRange): string[] {
  const n = daysBetween(r.from, r.to);
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(r.from, i));
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_RANGE_DAYS = 400;

/** The range asked for in ?from=&to=, made safe: valid days, in order, at most 400 days, not after today. */
export function parseRange(from: string | undefined, to: string | undefined, today = wibDay()): DayRange {
  const ok = (d: string | undefined) => !!d && DAY.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && addDays(d, 0) === d;
  let a = ok(from) ? from! : addDays(today, -29);
  let b = ok(to) ? to! : today;
  if (a > b) [a, b] = [b, a];
  if (b > today) b = today;
  if (a > b) a = b;
  if (daysBetween(a, b) > MAX_RANGE_DAYS) a = addDays(b, -(MAX_RANGE_DAYS - 1));
  return { from: a, to: b };
}

/** The same number of days right before a range (for "vs previous period"). */
export function previousRange(r: DayRange): DayRange {
  const n = daysBetween(r.from, r.to);
  return { from: addDays(r.from, -n), to: addDays(r.from, -1) };
}

/* ---- source ---- */

const ALIASES: Record<string, string> = {
  ig: "instagram", insta: "instagram", fb: "facebook", meta: "facebook", wa: "whatsapp", li: "linkedin", tw: "x", twitter: "x", yt: "youtube", gg: "google",
};

/** Known referrer hosts → one name per service. */
const HOSTS: [RegExp, string][] = [
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, "assistant"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)yahoo\.[a-z.]+$/, "yahoo"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "facebook"],
  [/(^|\.)(threads\.net|threads\.com)$/, "threads"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)behance\.net$/, "behance"],
  [/(^|\.)dribbble\.com$/, "dribbble"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "x"],
  [/(^|\.)(tiktok\.com)$/, "tiktok"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)github\.com$/, "github"],
];

export function refHost(referrer: string): string {
  try {
    const u = new URL(referrer);
    if (!/^https?:$/.test(u.protocol)) return "";
    return u.hostname.toLowerCase().replace(/^(www|m|l|lm|mobile)\./, "").slice(0, 120);
  } catch {
    return "";
  }
}

/** Where a visit came from: utm_source first, then ad click ids, then the referrer; nothing = "direct". */
export function sourceOf(input: { referrer?: string; utm?: string; fbclid?: boolean; gclid?: boolean; ownHosts?: string[] }): { source: string; referrer: string } {
  const host = refHost(input.referrer ?? "");
  const own = (input.ownHosts ?? []).map((h) => h.toLowerCase().replace(/^www\./, ""));
  if (host && own.includes(host) && !input.utm) return { source: "internal", referrer: "" };
  const referrer = own.includes(host) ? "" : host;
  const utm = (input.utm ?? "").toLowerCase().trim().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (utm) return { source: ALIASES[utm] ?? utm, referrer };
  if (input.gclid) return { source: "google", referrer };
  if (input.fbclid) return { source: "facebook", referrer };
  if (!referrer) return { source: "direct", referrer: "" };
  for (const [re, name] of HOSTS) if (re.test(referrer)) return { source: name, referrer };
  return { source: referrer.replace(/[^a-z0-9.-]/g, "").slice(0, 60) || "direct", referrer };
}

/* ---- device and robots ---- */

export function deviceOf(ua: string): Device {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return "phone";
  return "desktop";
}

const ROBOT = /bot|crawl|spider|slurp|facebookexternalhit|meta-externalagent|headless|lighthouse|pagespeed|preview|monitor|uptime|curl|wget|python|axios|node-fetch|go-http|java\/|okhttp|vercel|scrapy|phantom|puppeteer|playwright/i;
export function isRobot(ua: string): boolean {
  return !ua || ROBOT.test(ua);
}

/* ---- path ---- */

/** Only the path, never the query (it can carry personal data); admin and API calls are never counted. */
export function cleanPath(p: string): string | null {
  if (typeof p !== "string" || !p.startsWith("/")) return null;
  const path = p.split(/[?#]/)[0].replace(/\/{2,}/g, "/").slice(0, 200);
  if (/^\/(admin|api|_next)(\/|$)/.test(path)) return null;
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export const langOf = (path: string): "id" | "en" => (path === "/en" || path.startsWith("/en/") ? "en" : "id");

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
