import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { backend } from "@/lib/env";
import { aggregateVisits, aggregateVitals, inRange } from "./aggregate";
import { EMPTY_STATS, type DayRange, type Visit, type VisitStats, type Vital, type VitalStat } from "./types";

/* Where hits are written and where the admin reads them back.
   - supabase: public.visits / public.vitals (supabase/migrations/0002_stats.sql)
   - local:    .data/visits.ndjson next to the local content file (development and tests)
   - seed:     nothing is kept
   The file calls carry turbopackIgnore: the local file is for development only, and without it the
   build would trace (and ship) the whole project into the server function. */

export type StatsRead =
  | { ok: true; stats: VisitStats; vitals: VitalStat[] }
  | { ok: false; reason: "missing" | "off" | "error"; message?: string };

export function localStatsFile(): string {
  if (process.env.PORTO_STATS_FILE) return process.env.PORTO_STATS_FILE;
  const content = process.env.PORTO_DATA_FILE || path.join(process.cwd(), ".data", "content.json");
  return path.join(path.dirname(content), "visits.ndjson");
}

type Line = ({ t: "v" } & Visit) | ({ t: "w" } & Vital);

async function readLocal(): Promise<{ visits: Visit[]; vitals: Vital[] }> {
  let raw = "";
  try { raw = await fs.readFile(/*turbopackIgnore: true*/ localStatsFile(), "utf8"); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
  const visits: Visit[] = [], vitals: Vital[] = [];
  for (const s of raw.split("\n")) {
    if (!s.trim()) continue;
    try {
      const { t, ...row } = JSON.parse(s) as Line;
      if (t === "v") visits.push(row as Visit); else if (t === "w") vitals.push(row as Vital);
    } catch { /* a half-written last line */ }
  }
  return { visits, vitals };
}

/** Write one hit. Never throws: statistics must not break the site. */
export async function recordHit(hit: { visit?: Visit; vital?: Vital }): Promise<void> {
  try {
    const b = backend();
    if (b === "local") {
      const file = localStatsFile();
      await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
      const line = hit.visit ? { t: "v", ...hit.visit } : { t: "w", ...hit.vital };
      await fs.appendFile(/*turbopackIgnore: true*/ file, JSON.stringify(line) + "\n", "utf8");
      return;
    }
    if (b !== "supabase") return;
    const { createPublicSupabase } = await import("@/lib/supabase/public");
    const db = createPublicSupabase();
    const r = hit.visit ? await db.from("visits").insert(hit.visit) : await db.from("vitals").insert(hit.vital!);
    if (r.error && !warned) { warned = true; console.warn(`[statistik] tidak tercatat: ${r.error.message}${missing(r.error.code) ? " (jalankan supabase/migrations/0002_stats.sql)" : ""}`); }
  } catch (e) {
    if (!warned) { warned = true; console.warn("[statistik] tidak tercatat", e); }
  }
}
let warned = false;

const missing = (code?: string) => code === "PGRST205" || code === "42P01" || code === "PGRST202" || code === "42883";

/** Numbers for the admin, with the signed-in admin's session (RLS: only admins can read). */
export async function readStats(r: DayRange, db?: SupabaseClient): Promise<StatsRead> {
  const b = backend();
  if (b === "local") {
    const { visits, vitals } = await readLocal();
    return { ok: true, stats: aggregateVisits(visits, r), vitals: aggregateVitals(vitals, r) };
  }
  if (b !== "supabase" || !db) return { ok: false, reason: "off" };
  const [s, w] = await Promise.all([
    db.rpc("visit_stats", { p_from: r.from, p_to: r.to }),
    db.rpc("vital_stats", { p_from: r.from, p_to: r.to }),
  ]);
  const err = s.error ?? w.error;
  if (err) return missing(err.code) ? { ok: false, reason: "missing" } : { ok: false, reason: "error", message: err.message };
  return { ok: true, stats: { ...EMPTY_STATS, ...(s.data as VisitStats) }, vitals: (w.data as VitalStat[]) ?? [] };
}

/** Raw rows for the CSV download, oldest first. */
export async function readRows(kind: "visits" | "vitals", r: DayRange, db?: SupabaseClient): Promise<(Visit | Vital)[]> {
  const b = backend();
  if (b === "local") {
    const all = await readLocal();
    return (kind === "visits" ? all.visits : all.vitals).filter((x) => inRange(x.at, r)).sort((a, b) => (a.at < b.at ? -1 : 1));
  }
  if (b !== "supabase" || !db) return [];
  const { wibStart, addDays } = await import("./classify");
  const out: (Visit | Vital)[] = [];
  const cols = kind === "visits" ? "at,kind,path,lang,source,referrer,country,device,visitor,project" : "at,name,value,path,device";
  for (let i = 0; i < 200000; i += 1000) {
    const q = await db.from(kind).select(cols).gte("at", wibStart(r.from).toISOString()).lt("at", wibStart(addDays(r.to, 1)).toISOString())
      .order("at", { ascending: true }).order("id", { ascending: true }).range(i, i + 999);
    if (q.error) throw new Error(q.error.message);
    out.push(...(q.data as unknown as (Visit | Vital)[]));
    if ((q.data?.length ?? 0) < 1000) break;
  }
  return out;
}
