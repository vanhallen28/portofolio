import type { CaseStudy, Content, Line, Project, SectionKey, Sections, SiteSettings } from "./types";

/** The only way the site and the admin talk to content storage. */
export interface ContentStore {
  /** Everything, drafts included (admin view). */
  read(): Promise<Content>;
  saveSettings(v: SiteSettings): Promise<void>;
  saveSection<K extends SectionKey>(key: K, v: Sections[K]): Promise<void>;
  saveLines(v: Line[]): Promise<void>;
  /** Insert or update by id. */
  saveProject(v: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  /** ids in their new order; sort becomes 1..n. */
  reorderProjects(ids: string[]): Promise<void>;
  saveCaseStudy(v: CaseStudy): Promise<void>;
}

export class StoreError extends Error {
  constructor(message: string, readonly issues: string[] = [], readonly code?: string) {
    super(message);
  }
}

/** Keep only what visitors may see. */
export function publicView(c: Content): Content {
  const projects = c.projects.filter((p) => p.published).sort((a, b) => a.sort - b.sort);
  const slugs = new Set(projects.map((p) => p.slug));
  return {
    ...c,
    lines: [...c.lines].sort((a, b) => a.sort - b.sort),
    projects,
    caseStudies: c.caseStudies.filter((cs) => cs.published && slugs.has(cs.projectSlug)),
  };
}
