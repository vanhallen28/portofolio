import { eachDay, wibDay, wibStart, addDays } from "./classify";
import type { Count, DayRange, Visit, VisitStats, Vital, VitalStat } from "./types";
import { VITALS } from "./types";

/* The same numbers visit_stats() and vital_stats() compute in SQL, for the local file store.
   tests/sql/stats.test.ts checks both give identical results on the same rows. */

export function inRange(at: string, r: DayRange): boolean {
  const t = Date.parse(at);
  return t >= +wibStart(r.from) && t < +wibStart(addDays(r.to, 1));
}

function top(items: string[], limit: number): Count[] {
  const m = new Map<string, number>();
  for (const k of items) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).slice(0, limit);
}

export function aggregateVisits(rows: Visit[], r: DayRange): VisitStats {
  const all = rows.filter((x) => inRange(x.at, r));
  const v = all.filter((x) => x.kind === "view");
  const byDay = new Map<string, { views: number; ids: Set<string> }>();
  for (const x of v) {
    const d = wibDay(Date.parse(x.at));
    const e = byDay.get(d) ?? { views: 0, ids: new Set<string>() };
    e.views++; if (x.visitor) e.ids.add(x.visitor);
    byDay.set(d, e);
  }
  const wa = all.filter((x) => x.kind === "wa");
  const pv = all.filter((x) => x.kind === "preview");
  return {
    views: v.length,
    visitors: new Set(v.map((x) => x.visitor).filter(Boolean)).size,
    wa: wa.length,
    previews: pv.length,
    days: [...byDay].sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, e]) => ({ day, views: e.views, visitors: e.ids.size })),
    sources: top(v.map((x) => x.source), 30),
    countries: top(v.map((x) => x.country), 60),
    pages: top(v.map((x) => x.path), 30),
    devices: top(v.map((x) => x.device), 10),
    langs: top(v.map((x) => x.lang), 10),
    waSources: top(wa.map((x) => x.source), 30),
    previewProjects: top(pv.map((x) => x.project), 40),
  };
}

/** percentile_cont(0.75): linear interpolation between the two nearest values. */
export function p75(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  if (!s.length) return 0;
  const pos = 0.75 * (s.length - 1), lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export function aggregateVitals(rows: Vital[], r: DayRange): VitalStat[] {
  const all = rows.filter((x) => inRange(x.at, r));
  const out: VitalStat[] = [];
  for (const name of VITALS) {
    const m = all.filter((x) => x.name === name);
    if (!m.length) continue;
    const groups: [VitalStat["device"], Vital[]][] = [
      ["all", m],
      ["desktop", m.filter((x) => x.device === "desktop")],
      ["phone", m.filter((x) => x.device !== "desktop")],
    ];
    for (const [device, g] of groups) if (g.length) out.push({ name, device, p75: p75(g.map((x) => x.value)), n: g.length });
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.device < b.device ? -1 : a.device > b.device ? 1 : 0));
}

/** Fill the days with no visits, so a chart shows the whole range. */
export function withAllDays(s: VisitStats, r: DayRange): VisitStats["days"] {
  const m = new Map(s.days.map((d) => [d.day, d]));
  return eachDay(r).map((day) => m.get(day) ?? { day, views: 0, visitors: 0 });
}
