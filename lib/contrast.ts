import type { Theme } from "./content/types";

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance of a #RRGGBB colour. */
export function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return NaN;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => channel(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colours, 1..21. NaN when a colour is invalid. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  if (Number.isNaN(la) || Number.isNaN(lb)) return NaN;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastCheck = { pair: "ink/wall" | "muted/wall" | "btnInk/btnBg" | "accent/wall"; ratio: number; min: number; ok: boolean };

/** Pairs that must stay readable in a room theme. Text pairs need 4.5:1, the accent (dots, focus ring) 3:1. */
export function checkTheme(t: Theme): ContrastCheck[] {
  const rows: [ContrastCheck["pair"], string, string, number][] = [
    ["ink/wall", t.ink, t.wall, 4.5],
    ["muted/wall", t.muted, t.wall, 4.5],
    ["btnInk/btnBg", t.btnInk, t.btnBg, 4.5],
    ["accent/wall", t.accent, t.wall, 3],
  ];
  return rows.map(([pair, a, b, min]) => {
    const ratio = contrastRatio(a, b);
    return { pair, ratio: Math.round(ratio * 100) / 100, min, ok: ratio >= min };
  });
}
