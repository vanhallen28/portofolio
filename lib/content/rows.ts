import type { CaseStudy, Content, Line, Project } from "./types";

/* Mapping between content objects and database rows. Columns (id, slug, sort, published, key)
   are authoritative; the rest of the object lives in `data`. Shared by SupabaseStore and the seed generator. */

export type ProjectRow = { id: string; slug: string; sort: number; published: boolean; data: Omit<Project, "id" | "slug" | "sort" | "published"> };
export type CaseRow = { project_slug: string; published: boolean; data: Omit<CaseStudy, "projectSlug" | "published"> };
export type LineRow = { key: Line["key"]; sort: number; data: Omit<Line, "key" | "sort"> };

export function projectToRow(p: Project): ProjectRow {
  const { id, slug, sort, published, ...data } = p;
  return { id, slug, sort, published, data };
}
export function rowToProject(r: ProjectRow): Project {
  return { ...(r.data as Project), id: r.id, slug: r.slug, sort: r.sort, published: r.published };
}
export function caseToRow(c: CaseStudy): CaseRow {
  const { projectSlug, published, ...data } = c;
  return { project_slug: projectSlug, published, data };
}
export function rowToCase(r: CaseRow): CaseStudy {
  return { ...(r.data as CaseStudy), projectSlug: r.project_slug, published: r.published };
}
export function lineToRow(l: Line): LineRow {
  const { key, sort, ...data } = l;
  return { key, sort, data };
}
export function rowToLine(r: LineRow): Line {
  return { ...(r.data as Line), key: r.key, sort: r.sort };
}

export type ContentRows = {
  settings: Content["settings"];
  sections: { key: string; data: unknown }[];
  lines: LineRow[];
  projects: ProjectRow[];
  cases: CaseRow[];
};

export function contentToRows(c: Content): ContentRows {
  return {
    settings: c.settings,
    sections: Object.entries(c.sections).map(([key, data]) => ({ key, data })),
    lines: c.lines.map(lineToRow),
    projects: c.projects.map(projectToRow),
    cases: c.caseStudies.map(caseToRow),
  };
}
