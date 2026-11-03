"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MONTHS, WEEKDAYS, dayLong, rangeLabel } from "@/lib/stats/labels";

/* The period for the statistics: quick presets, or two days picked on a calendar (WIB days).
   Picking: first click = start, second click = end (either order); Apply loads that period. */

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const shift = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

function presets(today: string): { label: string; from: string; to: string }[] {
  const [y, m] = today.split("-").map(Number);
  const monthStart = `${y}-${pad(m)}-01`;
  const lastMonthEnd = shift(monthStart, -1);
  return [
    { label: "Hari ini", from: today, to: today },
    { label: "Kemarin", from: shift(today, -1), to: shift(today, -1) },
    { label: "7 hari terakhir", from: shift(today, -6), to: today },
    { label: "30 hari terakhir", from: shift(today, -29), to: today },
    { label: "90 hari terakhir", from: shift(today, -89), to: today },
    { label: "Bulan ini", from: monthStart, to: today },
    { label: "Bulan lalu", from: `${lastMonthEnd.slice(0, 7)}-01`, to: lastMonthEnd },
    { label: "Tahun ini", from: `${y}-01-01`, to: today },
  ];
}

function Month({ y, m, a, b, hover, today, onPick, onHover }: {
  y: number; m: number; a: string; b: string | null; hover: string | null; today: string;
  onPick: (d: string) => void; onHover: (d: string | null) => void;
}) {
  const first = new Date(Date.UTC(y, m, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const end = b ?? hover ?? a;
  const [lo, hi] = a <= end ? [a, end] : [end, a];
  return (
    <div className="st-month">
      <p className="st-month-name">{MONTHS[m]} {y}</p>
      <div className="st-week" aria-hidden="true">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
      <div className="st-days" role="grid">
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = iso(y, m, i + 1);
          const future = d > today;
          const cls = [d >= lo && d <= hi ? "in" : "", d === lo ? "lo" : "", d === hi ? "hi" : "", d === today ? "today" : ""].filter(Boolean).join(" ");
          return (
            <button key={d} type="button" className={cls} disabled={future} aria-pressed={d === a || d === b}
              aria-label={dayLong(d)} onClick={() => onPick(d)} onMouseEnter={() => onHover(d)} onFocus={() => onHover(d)}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RangePicker({ from, to, today }: { from: string; to: string; today: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(from);
  const [b, setB] = useState<string | null>(to);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState(() => { const [y, m] = to.split("-").map(Number); return { y, m: m - 1 }; });
  const box = useRef<HTMLDivElement>(null);
  const list = useMemo(() => presets(today), [today]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const go = (f: string, t: string) => { setOpen(false); router.push(`/admin/stats?from=${f}&to=${t}`); };
  const pick = (d: string) => {
    if (b) { setA(d); setB(null); return; }
    if (d < a) { setB(a); setA(d); } else setB(d);
  };
  const prev = view.m === 0 ? { y: view.y - 1, m: 11 } : { y: view.y, m: view.m - 1 };
  const next = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 };
  const [ty, tm] = today.split("-").map(Number);
  const atEnd = view.y > ty || (view.y === ty && view.m >= tm - 1);
  const active = list.find((p) => p.from === from && p.to === to);

  return (
    <div className="st-picker" ref={box}>
      <button type="button" className="adm-btn st-picker-btn" aria-expanded={open} onClick={() => { setA(from); setB(to); setOpen((o) => !o); }}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" /></svg>
        <span>{active ? `${active.label} · ` : ""}{rangeLabel(from, to)}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="st-pop" role="dialog" aria-label="Pilih periode">
          <div className="st-presets">
            {list.map((p) => (
              <button key={p.label} type="button" className={p.from === from && p.to === to ? "on" : ""} onClick={() => go(p.from, p.to)}>{p.label}</button>
            ))}
          </div>
          <div className="st-cal">
            <div className="st-cal-nav">
              <button type="button" className="adm-btn adm-btn-small adm-btn-icon" aria-label="Bulan sebelumnya" onClick={() => setView(prev)}>‹</button>
              <button type="button" className="adm-btn adm-btn-small adm-btn-icon" aria-label="Bulan berikutnya" onClick={() => setView(next)} disabled={atEnd}>›</button>
            </div>
            <div className="st-months" onMouseLeave={() => setHover(null)}>
              <Month {...prev} a={a} b={b} hover={hover} today={today} onPick={pick} onHover={setHover} />
              <Month {...view} a={a} b={b} hover={hover} today={today} onPick={pick} onHover={setHover} />
            </div>
            <div className="st-cal-foot">
              <span aria-live="polite">{b ? rangeLabel(a, b) : `Mulai ${dayLong(a)} · pilih tanggal akhir`}</span>
              <div>
                <button type="button" className="adm-btn adm-btn-small adm-btn-ghost" onClick={() => setOpen(false)}>Batal</button>
                <button type="button" className="adm-btn adm-btn-small adm-btn-primary" disabled={!b} onClick={() => b && go(a, b)}>Terapkan</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
