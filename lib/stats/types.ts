/* Visit statistics and real-user web performance. Same shapes for the local file store and Supabase. */

export const VISIT_KINDS = ["view", "wa", "preview"] as const;
export type VisitKind = (typeof VISIT_KINDS)[number];
export const DEVICES = ["desktop", "phone", "tablet"] as const;
export type Device = (typeof DEVICES)[number];
export const VITALS = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
export type VitalName = (typeof VITALS)[number];

/** One row of public.visits. */
export type Visit = {
  at: string; // ISO time
  kind: VisitKind;
  path: string;
  lang: "id" | "en";
  source: string;
  referrer: string;
  country: string;
  device: Device;
  visitor: string;
  project: string;
};

/** One row of public.vitals. */
export type Vital = { at: string; name: VitalName; value: number; path: string; device: Device };

export type Count = { key: string; n: number };

/** What visit_stats() returns for a date range (WIB days, both ends included). */
export type VisitStats = {
  views: number;
  visitors: number;
  wa: number;
  previews: number;
  days: { day: string; views: number; visitors: number }[];
  sources: Count[];
  countries: Count[];
  pages: Count[];
  devices: Count[];
  langs: Count[];
  waSources: Count[];
  previewProjects: Count[];
};

/** What vital_stats() returns: p75 per metric, for phones (phone + tablet), desktops and all. */
export type VitalStat = { name: VitalName; device: "phone" | "desktop" | "all"; p75: number; n: number };

/** A range of WIB calendar days, both ends included, as YYYY-MM-DD. */
export type DayRange = { from: string; to: string };

export const EMPTY_STATS: VisitStats = {
  views: 0, visitors: 0, wa: 0, previews: 0, days: [], sources: [], countries: [], pages: [], devices: [], langs: [], waSources: [], previewProjects: [],
};
