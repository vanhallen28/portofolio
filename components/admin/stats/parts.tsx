import { VITALS, type Count, type VisitStats, type VitalStat } from "@/lib/stats/types";
import { dayShort, delta, num, pct, rate, RATING_LABEL, VITAL_INFO, vitalValue } from "@/lib/stats/labels";

/* Pieces of the statistics page and the dashboard. Server components: plain HTML and SVG, no script. */

export function Kpi({ label, value, before, hint }: { label: string; value: number; before?: number; hint?: string }) {
  const d = before == null ? null : delta(value, before);
  return (
    <div className="st-kpi">
      <span className="st-kpi-label">{label}</span>
      <b>{num(value)}</b>
      <span className="st-kpi-foot">
        {d ? <span className={`st-delta is-${d.dir}`} title="Dibanding periode sebelumnya dengan panjang yang sama">{d.text}</span> : null}
        {hint ? <span>{hint}</span> : null}
      </span>
    </div>
  );
}

/** Views per day as bars, visitors as a line. */
export function DayChart({ days }: { days: VisitStats["days"] }) {
  const W = 1000, H = 240, L = 44, B = 38, T = 18;
  const max = Math.max(1, ...days.map((d) => d.views));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const iw = W - L - 8, ih = H - B - T;
  const bw = iw / Math.max(1, days.length);
  const y = (v: number) => T + ih - (v / top) * ih;
  const every = Math.max(1, Math.ceil(days.length / 8));
  const line = days.map((d, i) => `${i ? "L" : "M"}${(L + bw * i + bw / 2).toFixed(1)} ${y(d.visitors).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  return (
    <figure className="st-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Kunjungan per hari, ${days.length} hari`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - 8} y1={y(t)} y2={y(t)} className="st-grid" />
            <text x={L - 8} y={y(t) + 4} className="st-axis" textAnchor="end">{num(t)}</text>
          </g>
        ))}
        {days.map((d, i) => (
          <g key={d.day}>
            <rect x={L + bw * i + bw * 0.14} y={y(d.views)} width={Math.max(1, bw * 0.72)} height={Math.max(0, T + ih - y(d.views))} rx={Math.min(4, bw * 0.2)} className="st-bar">
              <title>{`${dayShort(d.day)}: ${num(d.views)} kunjungan halaman, ${num(d.visitors)} pengunjung`}</title>
            </rect>
            {i === days.length - 1 || (i % every === 0 && days.length - 1 - i >= Math.ceil(every / 2)) ? <text x={i === days.length - 1 && days.length > 1 ? W - 8 : i === 0 ? L : L + bw * i + bw / 2} y={H - 8} className="st-axis" textAnchor={i === days.length - 1 && days.length > 1 ? "end" : i === 0 ? "start" : "middle"}>{dayShort(d.day)}</text> : null}
          </g>
        ))}
        {days.length > 1 ? <path d={line} className="st-line" /> : null}
      </svg>
      <figcaption><i className="st-key st-key-bar" /> Kunjungan halaman <i className="st-key st-key-line" /> Pengunjung</figcaption>
    </figure>
  );
}

function niceStep(max: number): number {
  const raw = max / 4, p = 10 ** Math.floor(Math.log10(raw || 1));
  for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * p) return Math.max(1, m * p);
  return Math.max(1, 10 * p);
}

/** A ranked list with a share bar. */
export function Ranked({ items, label, empty = "Belum ada data di periode ini.", limit = 10, icon }: {
  items: Count[]; label: (k: string) => string; empty?: string; limit?: number; icon?: (k: string) => string;
}) {
  const total = items.reduce((s, x) => s + x.n, 0);
  if (!total) return <p className="st-empty">{empty}</p>;
  const shown = items.slice(0, limit);
  const rest = items.slice(limit).reduce((s, x) => s + x.n, 0);
  return (
    <ol className="st-rank">
      {shown.map((x) => (
        <li key={x.key}>
          <span className="st-rank-bar" style={{ width: `${(x.n / shown[0].n) * 100}%` }} aria-hidden="true" />
          <span className="st-rank-name">{icon ? <span className="st-rank-icon" aria-hidden="true">{icon(x.key)}</span> : null}{label(x.key)}</span>
          <span className="st-rank-n">{num(x.n)}</span>
          <span className="st-rank-p">{pct(x.n, total)}</span>
        </li>
      ))}
      {rest ? <li className="is-rest"><span className="st-rank-name">Lainnya</span><span className="st-rank-n">{num(rest)}</span><span className="st-rank-p">{pct(rest, total)}</span></li> : null}
    </ol>
  );
}

/** Real-visitor web vitals at the 75th percentile, phones and desktops side by side. */
export function VitalsGrid({ vitals }: { vitals: VitalStat[] }) {
  const get = (name: (typeof VITALS)[number], device: VitalStat["device"]) => vitals.find((v) => v.name === name && v.device === device);
  if (!vitals.length) {
    return <p className="st-empty">Belum ada data performa. Angka muncul setelah situs dibuka pengunjung; setiap kunjungan mengirim hasil ukurnya.</p>;
  }
  const verdict = (device: "phone" | "desktop") => {
    const core = (["LCP", "INP", "CLS"] as const).map((n) => get(n, device));
    if (core.some((c) => !c)) return null;
    return core.every((c) => rate(c!.name, c!.p75) === "good");
  };
  return (
    <>
      <div className="st-verdicts">
        {(["phone", "desktop"] as const).map((d) => {
          const v = verdict(d);
          return (
            <span key={d} className={`st-verdict is-${v == null ? "none" : v ? "good" : "poor"}`}>
              Core Web Vitals {d === "phone" ? "HP" : "desktop"}: <b>{v == null ? "data belum cukup" : v ? "lulus" : "belum lulus"}</b>
            </span>
          );
        })}
      </div>
      <div className="st-vitals" role="table" aria-label="Performa web">
        <div className="st-vrow st-vhead" role="row"><span role="columnheader">Ukuran</span><span role="columnheader">HP</span><span role="columnheader">Desktop</span></div>
        {VITALS.map((name) => {
          const info = VITAL_INFO[name];
          return (
            <div className="st-vrow" role="row" key={name}>
              <span role="cell" className="st-vname"><b>{info.label}</b><small>{info.what} Baik bila ≤ {vitalValue(name, info.good)}.</small></span>
              {(["phone", "desktop"] as const).map((d) => {
                const s = get(name, d);
                if (!s) return <span role="cell" key={d} className="st-vcell is-none">—</span>;
                const r = rate(name, s.p75);
                return (
                  <span role="cell" key={d} className={`st-vcell is-${r}`}>
                    <b>{vitalValue(name, s.p75)}</b>
                    <span className="st-vpill">{RATING_LABEL[r]}</span>
                    <small>{num(s.n)} ukuran</small>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
