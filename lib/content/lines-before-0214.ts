import type { Content, L, LineKey } from "./types";

/* The line names and the case-study label as v0.2.13 and earlier shipped them, before the professional names and the
   scope of each line (v0.2.14). v0.2.14 replaces a name or the label only while it still reads exactly like this. */
export const LINE_NAMES_BEFORE_0214: Record<LineKey, L> = {
  found: { id: "Ditemukan", en: "Get found" },
  sell: { id: "Menjual", en: "Sell" },
  serve: { id: "Melayani", en: "Serve" },
  run: { id: "Mengelola", en: "Run" },
};
export const CASE_LINES_LABEL_BEFORE_0214: L = { id: "Jalur", en: "Lines" };

/** The content as v0.2.13 shipped it: the old names, no scope on the lines, the old case-study label. */
export function contentBefore0214<C extends Content>(content: C): C {
  const c = structuredClone(content);
  c.lines = c.lines.map((l) => ({ ...l, name: structuredClone(LINE_NAMES_BEFORE_0214[l.key]), desc: { id: "", en: "" } }));
  c.sections.works.caseLabels.lines = structuredClone(CASE_LINES_LABEL_BEFORE_0214);
  return c;
}
