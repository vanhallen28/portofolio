export const LANGS = ["id", "en"] as const;
export const LINE_KEYS = ["found", "sell", "serve", "run"] as const;
export const FONT_KEYS = ["schibsted", "marcellus", "jakarta", "archivo", "unbounded", "cormorant", "host", "quicksand", "lora"] as const;
export const SECTION_KEYS = ["hero", "works", "services", "process", "testimonials", "about", "faq", "contact"] as const;
export const LAYOUTS = ["desk-phone", "back-desk", "two-phones", "brand-card"] as const;
export const PATTERNS = ["none", "checker", "glow"] as const;
export const TITLE_SIZES = ["md", "lg", "xl", "xxl"] as const;
export const VISUAL_ROLES = ["desk", "phone", "back"] as const;
export const MAP_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** Fixed station geometry on the transit loop (viewBox 50 48 580 470). Corner slots sit on two lines. */
export const MAP_SLOT_GEOMETRY: Record<(typeof MAP_SLOTS)[number], {
  cx: number; cy: number; major: boolean; lines: (typeof LINE_KEYS)[number][];
  label: { x: number; y: number; anchor: "start" | "middle" | "end" };
}> = {
  1: { cx: 168.75, cy: 128.75, major: true, lines: ["serve", "found"], label: { x: 192, y: 84, anchor: "end" } },
  2: { cx: 320, cy: 110, major: false, lines: ["found"], label: { x: 320, y: 84, anchor: "middle" } },
  3: { cx: 471.25, cy: 128.75, major: true, lines: ["found", "sell"], label: { x: 440, y: 84, anchor: "start" } },
  4: { cx: 490, cy: 236, major: false, lines: ["sell"], label: { x: 512, y: 243, anchor: "start" } },
  5: { cx: 490, cy: 324, major: false, lines: ["sell"], label: { x: 512, y: 331, anchor: "start" } },
  6: { cx: 471.25, cy: 431.25, major: true, lines: ["sell", "run"], label: { x: 440, y: 494, anchor: "start" } },
  7: { cx: 320, cy: 450, major: false, lines: ["run"], label: { x: 320, y: 500, anchor: "middle" } },
  8: { cx: 168.75, cy: 431.25, major: true, lines: ["run", "serve"], label: { x: 192, y: 494, anchor: "end" } },
};

export const TITLE_SIZE_CSS: Record<(typeof TITLE_SIZES)[number], string> = {
  md: "clamp(2.4rem, 5vw, 4.8rem)",
  lg: "clamp(2.6rem, 5.4vw, 5.2rem)",
  xl: "clamp(3rem, 6.4vw, 6.2rem)",
  xxl: "clamp(3.4rem, 7.4vw, 7.2rem)",
};
