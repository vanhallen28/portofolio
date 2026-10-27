import type { L, Lang } from "./content/types";

export const DEFAULT_LANG: Lang = "id";

export function t(text: L | null | undefined, lang: Lang): string {
  if (!text) return "";
  return text[lang] || text[lang === "id" ? "en" : "id"] || "";
}

export function homePath(lang: Lang): string {
  return lang === "en" ? "/en" : "/";
}

export function workPath(lang: Lang, slug: string): string {
  return lang === "en" ? `/en/work/${slug}` : `/karya/${slug}`;
}

/** The same page in the other language. */
export function altLangPath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const en = /^\/en\/work\/([^/]+)$/.exec(clean);
  if (en) return `/karya/${en[1]}`;
  const id = /^\/karya\/([^/]+)$/.exec(clean);
  if (id) return `/en/work/${id[1]}`;
  if (clean === "/en" || clean.startsWith("/en/")) return "/";
  return "/en";
}

export function langOf(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
}
