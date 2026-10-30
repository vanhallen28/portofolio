import { z } from "zod";
import { FONT_KEYS, LAYOUTS, LINE_KEYS, MAP_SLOTS, MASCOT_MOTIONS, PATTERNS, ROOM_MOTIONS, SECTION_KEYS, TITLE_SIZES, VISUAL_ROLES } from "./constants";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna harus berformat #RRGGBB");
const url = z.string().max(2048);
export const LSchema = z.object({ id: z.string().max(4000), en: z.string().max(4000) });
const short = z.string().max(200);
/** Bilingual text that may be left empty. Fields added after v0.1.0 use defaults like this one,
    so rows saved by an older version still validate (no SQL migration needed). */
const emptyL = () => ({ id: "", en: "" });

export const ImgSchema = z.object({
  url: url.min(1, "Gambar belum dipilih"),
  alt: LSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export const ThemeSchema = z.object({ wall: hex, ink: hex, muted: hex, accent: hex, btnBg: hex, btnInk: hex });
/** A short silent loop of the site, played over a room screen while it is in view (the image stays as its still). */
export const VideoSchema = z.object({
  url: url.min(1, "Alamat video belum diisi").refine((v) => /^(https:\/\/|\/)/.test(v) && /\.(mp4|webm)(\?.*)?$/i.test(v), "Video harus file .mp4 atau .webm, alamatnya diawali https:// atau /"),
});
export const VisualSchema = z.object({ role: z.enum(VISUAL_ROLES), image: ImgSchema, video: VideoSchema.nullable().default(null) });
/** The client's mascot, character or logo, standing at the corner of the room's screens. */
export const MascotSchema = z.object({
  image: ImgSchema,
  motion: z.enum(MASCOT_MOTIONS),
  /** Height on a desktop screen, in px (phones show it smaller). */
  size: z.number().int().min(16).max(280),
  /** A sticker colour behind a logo that would disappear on the wall; empty = cut-out, no sticker. */
  chip: hex.or(z.literal("")).default(""),
});
export const FactSchema = z.object({ value: z.string().min(1).max(12), label: LSchema });
const LineKey = z.enum(LINE_KEYS);

export const SettingsSchema = z.object({
  name: short.min(1),
  role: LSchema,
  notice: LSchema,
  showNotice: z.boolean(),
  email: z.string().email().or(z.literal("")),
  whatsapp: z.string().regex(/^\d{8,15}$/, "Nomor WhatsApp tanpa + dan spasi, mis. 6281332623033"),
  whatsappDisplay: short,
  whatsappMessage: LSchema,
  linkedin: url,
  linkedinLabel: short,
  github: short,
  photo: ImgSchema.nullable(),
  footer: LSchema,
  seoTitle: LSchema,
  seoDescription: LSchema,
  availability: z.object({ show: z.boolean(), text: LSchema }),
  /** WhatsApp bar pinned to the bottom of the screen on phones. */
  stickyCta: z.object({ show: z.boolean(), text: LSchema }).default({ show: true, text: { id: "Chat WhatsApp", en: "Chat on WhatsApp" } }),
  /** Downloadable CV (PDF), shown in the About section when a file is set. */
  cv: z.object({
    url: url.refine((v) => v === "" || /^(https:\/\/|\/)/.test(v), "Link CV harus diawali https:// atau /"),
    label: LSchema,
  }).default({ url: "", label: { id: "Unduh CV (PDF)", en: "Download CV (PDF)" } }),
  ui: z.object({
    skip: LSchema,
    nav: z.object({ works: LSchema, services: LSchema, process: LSchema, about: LSchema, contact: LSchema }),
    whatsappButton: LSchema,
    menu: LSchema,
    backToTop: LSchema,
  }),
});

export const LineSchema = z.object({ key: LineKey, name: LSchema, color: hex, colorDark: hex, sort: z.number().int() });

export const ClientSchema = z.object({
  name: short.min(1),
  /** The wordmark is set in this font (borrowed from the client's brand). */
  font: z.enum(FONT_KEYS),
  uppercase: z.boolean(),
  /** Room to jump to; empty = no link. */
  projectSlug: short,
});
export const HeroSchema = z.object({
  role: LSchema, title: LSchema, lede: LSchema, ctaPrimary: LSchema, ctaSecondary: LSchema, mapCenter: LSchema, mapCaption: LSchema,
  /** Poster headline: display caps on two lines, with an italic phrase after the first. The full sentence in
      `title` stays in the heading for search engines and screen readers. Both lines empty = the plain title. */
  display: z.object({ top: LSchema, italic: LSchema, bottom: LSchema }).default(() => ({
    top: { id: "Sistem", en: "Systems" },
    italic: { id: "yang menjalankan", en: "that run your" },
    bottom: { id: "Bisnis Anda", en: "business" },
  })),
  /** Small capitals at the top right of the hero: what you build, in one line. Text before a colon is the label. */
  offer: LSchema.default(() => ({
    id: "Yang bisa saya bangun: website & landing page, toko online & kasir, portal klien, absensi & payroll",
    en: "What I build: websites & landing pages, online stores & point of sale, client portals, attendance & payroll",
  })),
  /** Text running around the round badge that leads to the work; {n} becomes the number of projects. */
  badge: LSchema.default(() => ({ id: "Masuk ke pameran • {n} ruang karya •", en: "Enter the exhibition • {n} rooms •" })),
  /** Row of client wordmarks under the hero. */
  clients: z.object({ visible: z.boolean(), title: LSchema, items: z.array(ClientSchema).max(12) }).default({ visible: false, title: emptyL(), items: [] }),
});
export const WorksSchema = z.object({
  title: LSchema, intro: LSchema, allLabel: LSchema, roomLabel: LSchema,
  previewCta: LSchema, caseCta: LSchema, visitCta: LSchema, nextRoom: LSchema, newTab: LSchema,
  /** Labels on the case-study page. */
  caseLabels: z.object({ client: LSchema, field: LSchema, role: LSchema, year: LSchema, lines: LSchema, site: LSchema }),
});
export const ServicesSchema = z.object({
  visible: z.boolean(), title: LSchema, proofLabel: LSchema,
  items: z.array(z.object({ line: LineKey, text: LSchema, proof: z.array(short), price: LSchema.default(emptyL) })).max(8),
});
export const ProcessSchema = z.object({
  visible: z.boolean(), title: LSchema, steps: z.array(z.object({ title: LSchema, text: LSchema, duration: LSchema.default(emptyL) })).max(8),
});
export const TestimonialsSchema = z.object({
  visible: z.boolean(), title: LSchema,
  items: z.array(z.object({ quote: LSchema, name: short.min(1), role: LSchema, projectSlug: short })).max(12),
});
export const AboutSchema = z.object({
  visible: z.boolean(), title: LSchema, paragraphs: z.array(LSchema).max(6), skills: z.array(LSchema).max(16),
  experienceTitle: LSchema.default({ id: "Pengalaman", en: "Experience" }),
  experience: z.array(z.object({ period: LSchema, role: LSchema, org: LSchema, text: LSchema })).max(8).default([]),
});
export const FaqSchema = z.object({ visible: z.boolean(), title: LSchema, items: z.array(z.object({ q: LSchema, a: LSchema })).max(20) });
export const ContactSchema = z.object({
  title: LSchema, button: LSchema,
  labels: z.object({ email: LSchema, whatsapp: LSchema, linkedin: LSchema, github: LSchema }),
});

export const SectionSchemas = {
  hero: HeroSchema, works: WorksSchema, services: ServicesSchema, process: ProcessSchema,
  testimonials: TestimonialsSchema, about: AboutSchema, faq: FaqSchema, contact: ContactSchema,
} as const;
export const SectionsSchema = z.object(SectionSchemas);
export const SectionKeySchema = z.enum(SECTION_KEYS);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
  sort: z.number().int(),
  published: z.boolean(),
  name: short.min(1),
  mapLabel: z.string().max(24),
  mapSlot: z.number().int().min(1).max(MAP_SLOTS.length),
  titleFont: z.enum(FONT_KEYS),
  titleStyle: z.object({
    size: z.enum(TITLE_SIZES), uppercase: z.boolean(),
    weight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
    tracking: z.number().min(-0.1).max(0.3),
  }),
  meta: LSchema,
  text: LSchema,
  lines: z.array(LineKey).min(1).max(4),
  theme: ThemeSchema,
  facts: z.array(FactSchema).max(4),
  status: LSchema.nullable(),
  liveUrl: url,
  liveLabel: short,
  liveNote: LSchema.nullable(),
  previewUrl: url,
  layout: z.enum(LAYOUTS),
  visuals: z.array(VisualSchema).max(3),
  brand: z.object({ logoUrl: url, swatches: z.array(z.object({ name: short, color: hex })).max(8), note: LSchema }).nullable(),
  pattern: z.enum(PATTERNS),
  /** Scroll effect for the room's screens (rows from before v0.2.6 get "auto"). */
  motion: z.enum(ROOM_MOTIONS).default("auto"),
  /** One sentence about the business outcome, highlighted in the room. */
  result: LSchema.nullable().default(null),
  /** Mascot or logo with its own animation (rows from before v0.2.9 get none). */
  mascot: MascotSchema.nullable().default(null),
});

const BlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("prose"), title: LSchema, paragraphs: z.array(LSchema).max(8) }),
  z.object({ type: z.literal("features"), title: LSchema, items: z.array(z.object({ title: LSchema, text: LSchema, images: z.array(ImgSchema).max(3) })).max(8) }),
  z.object({ type: z.literal("flow"), title: LSchema, steps: z.array(LSchema).max(8) }),
  z.object({ type: z.literal("decisions"), title: LSchema, items: z.array(z.object({ title: LSchema, text: LSchema })).max(8) }),
  z.object({ type: z.literal("numbers"), title: LSchema, facts: z.array(FactSchema).max(6), stack: LSchema }),
  z.object({
    type: z.literal("results"), title: LSchema,
    /** Before → after. `before` may be empty when there is no "before" figure. */
    items: z.array(z.object({ before: z.string().max(24), after: z.string().min(1).max(24), label: LSchema })).max(6),
  }),
]);
export { BlockSchema };

export const CaseStudySchema = z.object({
  projectSlug: z.string().min(1),
  published: z.boolean(),
  subtitle: LSchema,
  labels: z.object({ client: short, field: LSchema, role: LSchema, year: z.string().max(12) }),
  cover: ImgSchema.nullable(),
  /** Colours of the case-study page. Missing = the light shell palette. */
  theme: ThemeSchema.optional(),
  blocks: z.array(BlockSchema).max(20),
});

export const ContentSchema = z.object({
  settings: SettingsSchema,
  sections: SectionsSchema,
  lines: z.array(LineSchema).length(4),
  projects: z.array(ProjectSchema).max(40),
  caseStudies: z.array(CaseStudySchema).max(40),
});
