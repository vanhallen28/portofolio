export const LANGS = ["id", "en"] as const;
export const LINE_KEYS = ["found", "sell", "serve", "run"] as const;
export const FONT_KEYS = ["schibsted", "marcellus", "jakarta", "archivo", "unbounded", "cormorant", "host", "quicksand", "lora", "vale", "loma"] as const;
export const SECTION_KEYS = ["hero", "works", "services", "process", "testimonials", "about", "faq", "contact"] as const;
export const LAYOUTS = ["desk-phone", "back-desk", "two-phones", "brand-card"] as const;
export const PATTERNS = ["none", "checker", "glow"] as const;
/** How a room's screens move while it scrolls into view. "auto" picks by the room's position, so neighbours differ. */
export const ROOM_MOTIONS = ["auto", "arch", "slide", "curtain", "spread", "focus", "tilt", "signal", "print", "unfold", "glow"] as const;
export const AUTO_MOTIONS = ["arch", "slide", "curtain", "spread", "focus", "tilt", "signal", "print", "unfold", "glow"] as const;
export const TITLE_SIZES = ["md", "lg", "xl", "xxl"] as const;
export const VISUAL_ROLES = ["desk", "phone", "back"] as const;
export const MAP_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Fixed station geometry on the transit loop (viewBox 60 92 520 380, loop 100–540 × 130–430). Corner slots sit on two lines. */
export const MAP_SLOT_GEOMETRY: Record<(typeof MAP_SLOTS)[number], {
  cx: number; cy: number; major: boolean; lines: (typeof LINE_KEYS)[number][];
  label: { x: number; y: number; anchor: "start" | "middle" | "end" };
}> = {
  1: { cx: 118.75, cy: 148.75, major: true, lines: ["serve", "found"], label: { x: 146, y: 184, anchor: "start" } },
  2: { cx: 320, cy: 130, major: false, lines: ["found"], label: { x: 320, y: 170, anchor: "middle" } },
  3: { cx: 521.25, cy: 148.75, major: true, lines: ["found", "sell"], label: { x: 494, y: 184, anchor: "end" } },
  4: { cx: 540, cy: 236, major: false, lines: ["sell"], label: { x: 514, y: 243, anchor: "end" } },
  5: { cx: 540, cy: 324, major: false, lines: ["sell"], label: { x: 514, y: 331, anchor: "end" } },
  6: { cx: 521.25, cy: 411.25, major: true, lines: ["sell", "run"], label: { x: 494, y: 388, anchor: "end" } },
  7: { cx: 320, cy: 430, major: false, lines: ["run"], label: { x: 320, y: 404, anchor: "middle" } },
  8: { cx: 118.75, cy: 411.25, major: true, lines: ["run", "serve"], label: { x: 146, y: 388, anchor: "start" } },
  9: { cx: 100, cy: 236, major: false, lines: ["serve"], label: { x: 126, y: 243, anchor: "start" } },
  10: { cx: 100, cy: 324, major: false, lines: ["serve"], label: { x: 126, y: 331, anchor: "start" } },
};

export const TITLE_SIZE_CSS: Record<(typeof TITLE_SIZES)[number], string> = {
  md: "clamp(2.4rem, 5vw, 4.8rem)",
  lg: "clamp(2.6rem, 5.4vw, 5.2rem)",
  xl: "clamp(3rem, 6.4vw, 6.2rem)",
  xxl: "clamp(3.4rem, 7.4vw, 7.2rem)",
};
