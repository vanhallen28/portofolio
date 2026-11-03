import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { aggregateVisits, aggregateVitals, p75, withAllDays } from "@/lib/stats/aggregate";
import { cleanPath, deviceOf, isRobot, langOf, parseRange, previousRange, sourceOf, wibDay, wibStart } from "@/lib/stats/classify";
import { delta, rangeLabel, rate, vitalValue } from "@/lib/stats/labels";
import { adsTxtLine, pixelCode } from "@/lib/ads";
import { SettingsSchema } from "@/lib/content/schema";
import { seed } from "@/lib/content/seed";
import type { Visit } from "@/lib/stats/types";

vi.mock("server-only", () => ({}));

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("where a visit came from", () => {
  const own = ["virgiawan.point.lat"];
  it("names the big services from their referrer", () => {
    expect(sourceOf({ referrer: "https://www.google.co.id/", ownHosts: own }).source).toBe("google");
    expect(sourceOf({ referrer: "https://l.instagram.com/?u=x", ownHosts: own })).toEqual({ source: "instagram", referrer: "instagram.com" });
    expect(sourceOf({ referrer: "https://lm.facebook.com/l.php", ownHosts: own }).source).toBe("facebook");
    expect(sourceOf({ referrer: "https://www.behance.net/gallery/1", ownHosts: own }).source).toBe("behance");
    expect(sourceOf({ referrer: "https://lnkd.in/abc", ownHosts: own }).source).toBe("linkedin");
    expect(sourceOf({ referrer: "https://t.co/xyz", ownHosts: own }).source).toBe("x");
    expect(sourceOf({ referrer: "https://chatgpt.com/", ownHosts: own }).source).toBe("assistant");
    expect(sourceOf({ referrer: "https://gemini.google.com/app", ownHosts: own }).source).toBe("assistant");
  });
  it("no referrer is direct; another site keeps its name; the site itself is internal", () => {
    expect(sourceOf({ referrer: "", ownHosts: own })).toEqual({ source: "direct", referrer: "" });
    expect(sourceOf({ referrer: "https://aliyasyifaa.com/tentang", ownHosts: own })).toEqual({ source: "aliyasyifaa.com", referrer: "aliyasyifaa.com" });
    expect(sourceOf({ referrer: "https://virgiawan.point.lat/", ownHosts: own }).source).toBe("internal");
    expect(sourceOf({ referrer: "android-app://com.whatsapp", ownHosts: own }).source).toBe("direct");
  });
  it("utm_source wins, with short names expanded; ad click ids count too", () => {
    expect(sourceOf({ referrer: "https://www.google.com/", utm: "IG", ownHosts: own }).source).toBe("instagram");
    expect(sourceOf({ utm: "Newsletter November!" }).source).toBe("newsletter-november");
    expect(sourceOf({ fbclid: true }).source).toBe("facebook");
    expect(sourceOf({ gclid: true }).source).toBe("google");
  });
});

describe("device, robots, path", () => {
  it("tells phones, tablets and desktops apart", () => {
    expect(deviceOf(IPHONE)).toBe("phone");
    expect(deviceOf("Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36")).toBe("phone");
    expect(deviceOf("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(deviceOf(CHROME)).toBe("desktop");
  });
  it("does not count robots, link previews or empty user agents", () => {
    expect(isRobot("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isRobot("facebookexternalhit/1.1")).toBe(true);
    expect(isRobot("WhatsApp/2.23 (link preview)")).toBe(true);
    expect(isRobot("Mozilla/5.0 HeadlessChrome/130")).toBe(true);
    expect(isRobot("")).toBe(true);
    expect(isRobot(CHROME)).toBe(false);
  });
  it("keeps only the path, never admin or API", () => {
    expect(cleanPath("/karya/rua?utm_source=ig#x")).toBe("/karya/rua");
    expect(cleanPath("/en/")).toBe("/en");
    expect(cleanPath("/")).toBe("/");
    expect(cleanPath("/admin/stats")).toBeNull();
    expect(cleanPath("/api/v")).toBeNull();
    expect(cleanPath("https://evil.example/")).toBeNull();
    expect(langOf("/en/work/rua")).toBe("en");
    expect(langOf("/karya/rua")).toBe("id");
  });
});

describe("WIB days and ranges", () => {
  it("a WIB day starts at 17:00 UTC the day before", () => {
    expect(wibDay(Date.parse("2026-11-03T16:59:59Z"))).toBe("2026-11-03");
    expect(wibDay(Date.parse("2026-11-03T17:00:00Z"))).toBe("2026-11-04");
    expect(wibStart("2026-11-04").toISOString()).toBe("2026-11-03T17:00:00.000Z");
  });
  it("makes any ?from=&to= safe", () => {
    const today = "2026-11-04";
    expect(parseRange(undefined, undefined, today)).toEqual({ from: "2026-10-06", to: "2026-11-04" });
    expect(parseRange("2026-11-01", "2026-10-01", today)).toEqual({ from: "2026-10-01", to: "2026-11-01" });
    expect(parseRange("2026-10-01", "2027-01-01", today)).toEqual({ from: "2026-10-01", to: "2026-11-04" });
    expect(parseRange("2026-02-30", "x", today)).toEqual({ from: "2026-10-06", to: "2026-11-04" });
    expect(parseRange("2020-01-01", "2026-11-04", today).from).toBe("2025-10-01");
    expect(previousRange({ from: "2026-10-01", to: "2026-10-31" })).toEqual({ from: "2026-08-31", to: "2026-09-30" });
    expect(rangeLabel("2026-10-06", "2026-11-04")).toBe("6 Okt – 4 Nov 2026");
    expect(rangeLabel("2026-11-01", "2026-11-04")).toBe("1–4 November 2026");
  });
});

describe("numbers", () => {
  it("p75 interpolates like percentile_cont", () => {
    expect(p75([1, 2, 3, 4])).toBeCloseTo(3.25);
    expect(p75([5])).toBe(5);
    expect(p75([])).toBe(0);
  });
  it("aggregates views, visitors per day, clicks, and fills empty days", () => {
    const v = (at: string, kind: Visit["kind"], o: Partial<Visit> = {}): Visit => ({ at, kind, path: "/", lang: "id", source: "direct", referrer: "", country: "ID", device: "phone", visitor: "a", project: "", ...o });
    const rows = [
      v("2026-11-01T01:00:00Z", "view"), v("2026-11-01T02:00:00Z", "view"), v("2026-11-01T03:00:00Z", "view", { visitor: "b", source: "google", country: "MY" }),
      v("2026-11-01T03:05:00Z", "wa", { source: "google", project: "rua" }), v("2026-11-02T17:30:00Z", "view", { path: "/karya/rua" }),
      v("2026-10-20T01:00:00Z", "view"),
    ];
    const r = { from: "2026-11-01", to: "2026-11-03" };
    const s = aggregateVisits(rows, r);
    expect(s).toMatchObject({ views: 4, visitors: 2, wa: 1, previews: 0 });
    expect(s.days).toEqual([{ day: "2026-11-01", views: 3, visitors: 2 }, { day: "2026-11-03", views: 1, visitors: 1 }]);
    expect(s.sources[0]).toEqual({ key: "direct", n: 3 });
    expect(s.waSources).toEqual([{ key: "google", n: 1 }]);
    expect(withAllDays(s, r).map((d) => d.views)).toEqual([3, 0, 1]);
    const w = aggregateVitals([{ at: "2026-11-01T01:00:00Z", name: "LCP", value: 1200, path: "/", device: "phone" }, { at: "2026-11-01T01:00:00Z", name: "LCP", value: 3000, path: "/", device: "desktop" }], r);
    expect(w).toEqual([{ name: "LCP", device: "all", p75: 2550, n: 2 }, { name: "LCP", device: "desktop", p75: 3000, n: 1 }, { name: "LCP", device: "phone", p75: 1200, n: 1 }]);
  });
  it("rates web vitals with Google's thresholds", () => {
    expect(rate("LCP", 2500)).toBe("good");
    expect(rate("LCP", 3000)).toBe("ni");
    expect(rate("INP", 600)).toBe("poor");
    expect(rate("CLS", 0.05)).toBe("good");
    expect(vitalValue("LCP", 1840)).toBe("1,8 s");
    expect(vitalValue("INP", 96.4)).toBe("96 ms");
    expect(vitalValue("CLS", 0.042)).toBe("0,04");
    expect(delta(12, 10)).toEqual({ text: "+20%", dir: "up" });
    expect(delta(5, 0)).toEqual({ text: "baru", dir: "up" });
    expect(delta(0, 0)).toBeNull();
  });
});

describe("ad codes", () => {
  it("only accepts real IDs, and older settings without ads still load", () => {
    const base = seed.settings;
    expect(SettingsSchema.safeParse({ ...base, ads: { metaPixelId: "123456789012345", adsenseClient: "ca-pub-1234567890123456" } }).success).toBe(true);
    expect(SettingsSchema.safeParse({ ...base, ads: { metaPixelId: "12345');alert(1)//", adsenseClient: "" } }).success).toBe(false);
    expect(SettingsSchema.safeParse({ ...base, ads: { metaPixelId: "", adsenseClient: "pub-123\"><script>" } }).success).toBe(false);
    const { ads: _ads, ...old } = base; void _ads;
    expect(SettingsSchema.parse(old).ads).toEqual({ metaPixelId: "", adsenseClient: "" });
  });
  it("writes the official snippets", () => {
    expect(adsTxtLine("ca-pub-1234567890123456")).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0");
    const code = pixelCode("123456789012345");
    expect(code).toContain("fbq('init','123456789012345')");
    expect(code).toContain("porto:notrack");
    expect(() => new Function(code)).not.toThrow();
  });
});

describe("POST /api/v (local mode)", () => {
  let file = "";
  const env = { ...process.env };
  beforeAll(() => {
    const dir = mkdtempSync(path.join(tmpdir(), "porto-stats-"));
    file = path.join(dir, "visits.ndjson");
    Object.assign(process.env, { PORTO_LOCAL: "1", PORTO_STATS_FILE: file, NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "", NEXT_PUBLIC_SITE_URL: "https://virgiawan.point.lat" });
  });
  afterAll(() => { process.env = env; });

  const post = async (body: unknown, ua = CHROME, headers: Record<string, string> = {}) => {
    const { POST } = await import("@/app/api/v/route");
    return POST(new Request("https://virgiawan.point.lat/api/v", { method: "POST", body: JSON.stringify(body), headers: { "user-agent": ua, "x-forwarded-for": "203.0.113.9", "x-vercel-ip-country": "ID", ...headers } }));
  };

  it("records views, clicks and vitals, and ignores robots and junk", async () => {
    expect((await post({ k: "view", p: "/?utm_source=ig", r: "" })).status).toBe(204);
    await post({ k: "view", p: "/karya/rua", r: "https://virgiawan.point.lat/" }, IPHONE);
    await post({ k: "wa", p: "/", s: "rua", r: "https://www.google.com/" }, CHROME, { "x-vercel-ip-country": "SG" });
    await post({ k: "vital", p: "/", n: "LCP", v: 1234.5 }, IPHONE);
    await post({ k: "view", p: "/" }, "Googlebot/2.1");
    await post({ k: "view", p: "/admin" });
    await post({ k: "nope", p: "/" });
    await post("not json");
    const lines = readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatchObject({ t: "v", kind: "view", path: "/", source: "direct", country: "ID", device: "desktop", lang: "id" });
    expect(lines[0].visitor).toMatch(/^[0-9a-f]{16}$/);
    expect(JSON.stringify(lines)).not.toContain("203.0.113.9");
    expect(lines[1]).toMatchObject({ path: "/karya/rua", source: "internal", device: "phone" });
    expect(lines[2]).toMatchObject({ kind: "wa", source: "google", country: "SG", project: "rua" });
    expect(lines[3]).toMatchObject({ t: "w", name: "LCP", value: 1234.5, device: "phone" });
    const { readStats } = await import("@/lib/stats/store");
    const today = wibDay();
    const r = await readStats({ from: today, to: today });
    expect(r.ok && r.stats).toMatchObject({ views: 2, wa: 1 });
    expect(r.ok && r.vitals.find((x) => x.device === "phone")).toMatchObject({ name: "LCP", p75: 1234.5, n: 1 });
  });
});
