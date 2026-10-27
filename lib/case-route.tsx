import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/site/CaseStudyPage";
import { getPublicContent } from "@/lib/content/get";
import type { Lang } from "@/lib/content/types";

/* Shared by /karya/[slug] and /en/work/[slug]. */

export async function caseParams() {
  const c = await getPublicContent();
  return c.caseStudies.map((cs) => ({ slug: cs.projectSlug }));
}

export async function findCase(slug: string) {
  const content = await getPublicContent();
  const project = content.projects.find((p) => p.slug === slug);
  const study = content.caseStudies.find((cs) => cs.projectSlug === slug);
  return project && study ? { content, project, study } : null;
}

export async function CaseRoute({ slug, lang }: { slug: string; lang: Lang }) {
  const found = await findCase(slug);
  if (!found) notFound();
  return <CaseStudyPage content={found.content} lang={lang} project={found.project} study={found.study} />;
}
