import { createHash } from "node:crypto";
import { z } from "zod";
import { siteUrl } from "@/lib/env";
import { cleanPath, deviceOf, isRobot, langOf, SLUG, sourceOf, wibDay } from "@/lib/stats/classify";
import { recordHit } from "@/lib/stats/store";
import { VITALS } from "@/lib/stats/types";

/* Hits from components/site/Tracker.tsx: page views, WhatsApp and preview clicks, web vitals.
   No cookie, and the IP address is never stored: a visitor is a hash of IP + browser + the WIB day,
   so the same person is one visitor per day and cannot be followed from one day to the next.
   Always answers 204, so a hiccup here never shows up on the site. */

const Hit = z.object({
  k: z.enum(["view", "wa", "preview", "vital"]),
  p: z.string().max(400),
  r: z.string().max(600).optional(),
  u: z.string().max(80).optional(),
  fb: z.literal(1).optional(),
  g: z.literal(1).optional(),
  s: z.string().max(80).optional(),
  n: z.enum(VITALS).optional(),
  v: z.number().finite().min(0).max(600000).optional(),
});

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (isRobot(ua) || request.headers.get("sec-purpose")?.includes("prefetch")) return done();
  const text = await request.text().catch(() => "");
  if (!text || text.length > 2048) return done();
  let hit: z.infer<typeof Hit>;
  try { hit = Hit.parse(JSON.parse(text)); } catch { return done(); }
  const p = cleanPath(hit.p);
  if (!p) return done();
  const device = deviceOf(ua);
  const at = new Date().toISOString();

  if (hit.k === "vital") {
    if (!hit.n || hit.v == null) return done();
    await recordHit({ vital: { at, name: hit.n, value: hit.v, path: p, device } });
    return done();
  }

  const h = request.headers;
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const salt = process.env.STATS_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || "portofolio";
  const visitor = createHash("sha256").update(`${wibDay()}|${salt}|${ip}|${ua}`).digest("hex").slice(0, 16);
  const country = (h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? "").toUpperCase();
  let own: string[] = [];
  try { own = [new URL(siteUrl()).hostname, (h.get("host") ?? "").split(":")[0]]; } catch { /* keep empty */ }
  const { source, referrer } = sourceOf({ referrer: hit.r, utm: hit.u, fbclid: hit.fb === 1, gclid: hit.g === 1, ownHosts: own });
  await recordHit({
    visit: {
      at, kind: hit.k, path: p, lang: langOf(p), source, referrer,
      country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : "",
      device, visitor, project: hit.s && SLUG.test(hit.s) ? hit.s : "",
    },
  });
  return done();
}
