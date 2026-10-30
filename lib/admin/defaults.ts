import type { Block, CaseStudy, Project } from "@/lib/content/types";

const l = (id = "", en = "") => ({ id, en });

export function newProject(id: string, existing: Project[]): Project {
  const used = new Set(existing.map((p) => p.mapSlot));
  const slot = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((s) => !used.has(s)) ?? 1;
  let n = existing.length + 1;
  while (existing.some((p) => p.slug === `proyek-baru-${n}`)) n++;
  return {
    id, slug: `proyek-baru-${n}`, sort: existing.reduce((m, p) => Math.max(m, p.sort), 0) + 1, published: false,
    name: "Proyek baru", mapLabel: "Proyek baru", mapSlot: slot,
    titleFont: "schibsted", titleStyle: { size: "lg", uppercase: false, weight: 800, tracking: -0.02 },
    meta: l("Bidang klien, tahun", "Client field, year"), text: l(), lines: ["found"],
    theme: { wall: "#F3F3F1", ink: "#151619", muted: "#5C5F65", accent: "#2F6FE4", btnBg: "#151619", btnInk: "#F3F3F1" },
    facts: [], status: null, liveUrl: "", liveLabel: "", liveNote: null, previewUrl: "",
    layout: "desk-phone", visuals: [], brand: null, pattern: "none", motion: "auto", result: null,
  };
}

export function newCaseStudy(p: Project): CaseStudy {
  return {
    projectSlug: p.slug, published: false, subtitle: l(),
    labels: { client: p.name, field: l(), role: l("Desain, pengembangan, database, rilis", "Design, development, database, release"), year: String(new Date().getFullYear()) },
    cover: null, blocks: [newBlock("prose")],
  };
}

export function newBlock(type: Block["type"]): Block {
  switch (type) {
    case "prose": return { type, title: l("Situasinya", "The situation"), paragraphs: [l()] };
    case "features": return { type, title: l("Fitur utama", "Key features"), items: [{ title: l(), text: l(), images: [] }] };
    case "flow": return { type, title: l("Alurnya", "The flow"), steps: [l(), l(), l()] };
    case "decisions": return { type, title: l("Keputusan penting", "Key decisions"), items: [{ title: l(), text: l() }] };
    case "numbers": return { type, title: l("Dalam angka", "By the numbers"), facts: [{ value: "1", label: l() }], stack: l("Dibangun dengan ", "Built with ") };
    case "results": return { type, title: l("Hasilnya", "The outcome"), items: [{ before: "", after: "1", label: l() }] };
  }
}

export const BLOCK_LABEL: Record<Block["type"], string> = {
  prose: "Prosa",
  features: "Fitur bergambar",
  flow: "Alur bernomor",
  decisions: "Keputusan penting",
  numbers: "Angka & stack",
  results: "Hasil (sebelum → sesudah)",
};
