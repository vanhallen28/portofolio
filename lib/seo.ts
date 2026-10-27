import type { Metadata } from "next";
import { getPublicContent } from "@/lib/content/get";
import type { Lang } from "@/lib/content/types";
import { siteUrl } from "@/lib/env";
import { homePath, t, workPath } from "@/lib/i18n";
import { findCase } from "@/lib/case-route";

const LOCALE: Record<Lang, string> = { id: "id_ID", en: "en_US" };

export async function homeMetadata(lang: Lang): Promise<Metadata> {
  const c = await getPublicContent();
  const s = c.settings;
  const title = t(s.seoTitle, lang);
  const description = t(s.seoDescription, lang);
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: { canonical: homePath(lang), languages: { id: "/", en: "/en", "x-default": "/" } },
    openGraph: { type: "website", title, description, url: homePath(lang), siteName: s.name, locale: LOCALE[lang], alternateLocale: LOCALE[lang === "id" ? "en" : "id"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function caseMetadata(slug: string, lang: Lang): Promise<Metadata> {
  const found = await findCase(slug);
  if (!found) return { title: "404", robots: { index: false } };
  const { content, project, study } = found;
  const title = `${project.name} · ${content.settings.name}`;
  const description = t(study.subtitle, lang) || t(project.text, lang);
  const image = study.cover?.url;
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: { canonical: workPath(lang, slug), languages: { id: workPath("id", slug), en: workPath("en", slug), "x-default": workPath("id", slug) } },
    openGraph: { type: "article", title, description, url: workPath(lang, slug), siteName: content.settings.name, locale: LOCALE[lang], ...(image ? { images: [{ url: image, width: study.cover!.width, height: study.cover!.height }] } : {}) },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** schema.org Person, so search engines connect the site with the profiles. */
export async function personJsonLd(lang: Lang): Promise<string> {
  const c = await getPublicContent();
  const s = c.settings;
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: t(s.role, lang),
    url: `${base}${homePath(lang)}`,
    ...(s.photo ? { image: new URL(s.photo.url, base).toString() } : {}),
    ...(s.email ? { email: `mailto:${s.email}` } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Bandung", addressCountry: "ID" },
    sameAs: [s.linkedin, s.github ? `https://github.com/${s.github}` : ""].filter(Boolean),
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
