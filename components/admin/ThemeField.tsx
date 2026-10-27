"use client";
import type { Theme } from "@/lib/content/types";
import { checkTheme } from "@/lib/contrast";
import { ColorField } from "./fields";

const NAMES: Record<string, string> = {
  "ink/wall": "Teks di atas dinding",
  "muted/wall": "Teks redup di atas dinding",
  "btnInk/btnBg": "Teks tombol di atas tombol",
  "accent/wall": "Aksen di atas dinding",
};

/** Six room colours with a live WCAG contrast check. */
export function ThemeField({ value, onChange }: { value: Theme; onChange: (v: Theme) => void }) {
  const set = (k: keyof Theme) => (c: string) => onChange({ ...value, [k]: c });
  const checks = checkTheme(value);
  const bad = checks.filter((c) => !c.ok).length;
  return (
    <div className="adm-grid">
      <div className="adm-grid-3">
        <ColorField label="Dinding (latar)" value={value.wall} onChange={set("wall")} />
        <ColorField label="Teks" value={value.ink} onChange={set("ink")} />
        <ColorField label="Teks redup" value={value.muted} onChange={set("muted")} />
        <ColorField label="Aksen" value={value.accent} onChange={set("accent")} />
        <ColorField label="Latar tombol" value={value.btnBg} onChange={set("btnBg")} />
        <ColorField label="Teks tombol" value={value.btnInk} onChange={set("btnInk")} />
      </div>
      <div className="adm-field">
        <span className="adm-label">Keterbacaan (WCAG AA) <small>{bad ? `${bad} perlu diperbaiki` : "semua lolos"}</small></span>
        <ul className="adm-contrast" aria-live="polite">
          {checks.map((c) => (
            <li key={c.pair} className={c.ok ? "" : "is-bad"}>
              <span>{c.ok ? "✓" : "⚠"} {NAMES[c.pair] ?? c.pair}</span>
              <b>{Number.isFinite(c.ratio) ? c.ratio.toFixed(2) : "–"} : 1 (min {c.min})</b>
            </li>
          ))}
        </ul>
        {bad ? <span className="adm-hint">Teks yang kontrasnya rendah sulit dibaca, terutama di HP dan di luar ruangan. Tetap bisa disimpan, tapi sebaiknya diperbaiki.</span> : null}
      </div>
    </div>
  );
}
