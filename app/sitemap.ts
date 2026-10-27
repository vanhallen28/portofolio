import type { MetadataRoute } from "next";
import { getPublicContent } from "@/lib/content/get";
import { siteUrl } from "@/lib/env";
import { workPath } from "@/lib/i18n";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const c = await getPublicContent();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1, alternates: { languages: { id: `${base}/`, en: `${base}/en` } } },
    { url: `${base}/en`, changeFrequency: "monthly", priority: 0.9, alternates: { languages: { id: `${base}/`, en: `${base}/en` } } },
  ];
  for (const cs of c.caseStudies) {
    const id = `${base}${workPath("id", cs.projectSlug)}`;
    const en = `${base}${workPath("en", cs.projectSlug)}`;
    pages.push({ url: id, changeFrequency: "monthly", priority: 0.7, alternates: { languages: { id, en } } });
    pages.push({ url: en, changeFrequency: "monthly", priority: 0.6, alternates: { languages: { id, en } } });
  }
  return pages;
}
