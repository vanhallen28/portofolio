import type { Content } from "./types";

/* The content as v0.2.12 and earlier shipped it, before Ranum (v0.2.13): no Ranum room, case study or name in the client
   strip, and the three sentences that count eleven works. v0.2.13 adds Ranum and changes those sentences only while they
   still read like this, and the update files of earlier versions are built from it so they stay byte-for-byte the same. */
export const RANUM_ID = "a3299df1-e863-5bc9-b6ad-881a68531433";
export const RANUM_SLUG = "ranum";

export const TEXT_BEFORE_0213 = {
  seo: {
    id: "Portofolio Virgiawan Listanto, desainer dan pengembang produk digital di Bandung. Sebelas karya untuk bisnis nyata, dari sistem internal sampai situs merek.",
    en: "Portfolio of Virgiawan Listanto, a digital product designer and developer in Bandung. Eleven projects for real businesses, from internal systems to brand sites.",
  },
  lede: {
    id: "Studio Manager di Invisual Studio. Sebelas karya di halaman ini, dari sistem internal sampai situs merek, saya rancang dan bangun dari tampilan sampai kodenya. Lima di antaranya sudah tayang dan dipakai.",
    en: "Studio Manager at Invisual Studio. I designed and built the eleven projects on this page, from internal systems to brand sites, from the interface to the code. Five of them are live and in use.",
  },
  intro: {
    id: "Sebelas ruang, sebelas bisnis. Setiap ruang memakai warna dan huruf milik kliennya, karena sistem yang baik tampil sebagai brand Anda, bukan template saya.",
    en: "Eleven rooms, eleven businesses. Each room wears its client's own colours and type, because a good system looks like your brand, not my template.",
  },
};

/** The content without Ranum and with the eleven-works sentences; everything else is left as it is. */
export function contentBefore0213<C extends Content>(content: C): C {
  const c = structuredClone(content);
  c.projects = c.projects.filter((p) => p.id !== RANUM_ID);
  c.caseStudies = c.caseStudies.filter((cs) => cs.projectSlug !== RANUM_SLUG);
  c.sections.hero.clients.items = c.sections.hero.clients.items.filter((it) => it.projectSlug !== RANUM_SLUG);
  c.settings.seoDescription = structuredClone(TEXT_BEFORE_0213.seo);
  c.sections.hero.lede = structuredClone(TEXT_BEFORE_0213.lede);
  c.sections.works.intro = structuredClone(TEXT_BEFORE_0213.intro);
  return c;
}
