import type { FONT_KEYS } from "./content/constants";

/* Plain data, safe to import anywhere (server, client, admin). The font files themselves are
   loaded once in lib/fonts.ts, which sets these CSS variables on <html>. */

export type FontKey = (typeof FONT_KEYS)[number];

/** CSS font-family value for each title font key (uses the CSS variable set on <html>). */
export const FONT_FAMILY: Record<FontKey, string> = {
  schibsted: "var(--f-shell), system-ui, sans-serif",
  marcellus: "var(--f-marcellus), Georgia, serif",
  jakarta: "var(--f-jakarta), system-ui, sans-serif",
  archivo: "var(--f-archivo), Impact, sans-serif",
  unbounded: "var(--f-unbounded), system-ui, sans-serif",
  cormorant: "var(--f-cormorant), Georgia, serif",
  host: "var(--f-host), system-ui, sans-serif",
  quicksand: "var(--f-quicksand), system-ui, sans-serif",
  lora: "var(--f-lora), Georgia, serif",
  vale: "var(--f-vale), Georgia, serif",
  loma: "var(--f-loma), system-ui, sans-serif",
  rua: "var(--f-rua), Impact, sans-serif",
};

export const FONT_LABEL: Record<FontKey, string> = {
  schibsted: "Schibsted Grotesk", marcellus: "Marcellus", jakarta: "Plus Jakarta Sans", archivo: "Archivo Black",
  unbounded: "Unbounded", cormorant: "Cormorant Garamond", host: "Host Grotesk", quicksand: "Quicksand", lora: "Lora",
  vale: "VALE Display (huruf kapital saja)", loma: "LOMA Display (huruf kapital saja)", rua: "RUA Display",
};


/** The weight each title font is shipped in (used for client wordmarks). */
export const FONT_WEIGHT: Record<FontKey, number> = {
  schibsted: 800, marcellus: 400, jakarta: 800, archivo: 400, unbounded: 800, cormorant: 500, host: 700, quicksand: 700, lora: 600, vale: 400, loma: 400, rua: 400,
};
