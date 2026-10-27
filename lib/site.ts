import { MAP_SLOT_GEOMETRY } from "./content/constants";
import type { Content, Lang, Line, LineKey, Project, SiteSettings } from "./content/types";
import { homePath, t, workPath } from "./i18n";

export function waLink(s: SiteSettings, lang: Lang, withMessage = true): string {
  const msg = t(s.whatsappMessage, lang);
  return `https://wa.me/${s.whatsapp}${withMessage && msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "")).toUpperCase();
}

export function lineMap(lines: Line[]): Record<LineKey, Line> {
  return Object.fromEntries(lines.map((l) => [l.key, l])) as Record<LineKey, Line>;
}

/** Room anchor on the home page. */
export const roomId = (slug: string) => `ruang-${slug}`;

/** Published case study link for a project, or null. */
export function caseHref(c: Content, slug: string, lang: Lang): string | null {
  return c.caseStudies.some((cs) => cs.projectSlug === slug) ? workPath(lang, slug) : null;
}

/** One project per map slot (the first by sort order wins a shared slot). */
export function stations(projects: Project[]) {
  const seen = new Set<number>();
  const out: { project: Project; geo: (typeof MAP_SLOT_GEOMETRY)[keyof typeof MAP_SLOT_GEOMETRY] }[] = [];
  for (const p of projects) {
    const geo = MAP_SLOT_GEOMETRY[p.mapSlot as keyof typeof MAP_SLOT_GEOMETRY];
    if (!geo || seen.has(p.mapSlot)) continue;
    seen.add(p.mapSlot);
    out.push({ project: p, geo });
  }
  return out;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Absolute in-page anchor: plain hash on the home page, home path + hash elsewhere. */
export function anchor(lang: Lang, onHome: boolean, id: string): string {
  return onHome ? `#${id}` : `${homePath(lang)}#${id}`;
}

/** CSS custom properties for the four line colours, light and dark. Colours are validated #RRGGBB. */
export function lineColorCss(lines: Line[]): string {
  const light = lines.map((l) => `--l-${l.key}:${l.color}`).join(";");
  const dark = lines.map((l) => `--l-${l.key}:${l.colorDark}`).join(";");
  return `:root{${light}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}:root[data-theme="dark"]{${dark}}`;
}
