import type { Lang } from "./content/types";

/* Fixed interface wording that is not content (screen-reader labels, error pages).
   Everything a visitor reads as content comes from the CMS instead. */
const UI = {
  id: {
    mainNav: "Utama",
    language: "Bahasa",
    homeLabel: (name: string) => `${name}, beranda`,
    mapTitle: "Denah pameran",
    filterGroup: "Saring karya berdasarkan jalur",
    planNav: "Denah ruang",
    breadcrumb: "Jejak halaman",
    swatches: "Warna produk",
    logo: (name: string) => `Logo ${name}`,
    notFoundTitle: "Ruang ini tidak ada.",
    notFoundText: "Halaman yang Anda cari sudah dipindah atau belum pernah ada. Semua karya ada di beranda.",
    notFoundCta: "Kembali ke beranda",
  },
  en: {
    mainNav: "Main",
    language: "Language",
    homeLabel: (name: string) => `${name}, home`,
    mapTitle: "Exhibition map",
    filterGroup: "Filter the work by line",
    planNav: "Floor plan",
    breadcrumb: "Breadcrumb",
    swatches: "Product colours",
    logo: (name: string) => `${name} logo`,
    notFoundTitle: "This room doesn't exist.",
    notFoundText: "The page you're looking for has moved or never existed. All the work is on the home page.",
    notFoundCta: "Back to home",
  },
} as const;

export function ui(lang: Lang) {
  return UI[lang];
}
