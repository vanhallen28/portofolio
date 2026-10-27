import { ProjectList } from "@/components/admin/ProjectList";
import { getStore } from "@/lib/content/get";

export const metadata = { title: "Proyek" };

export default async function Page() {
  const c = await (await getStore()).read();
  const cases = new Map(c.caseStudies.map((cs) => [cs.projectSlug, cs]));
  const rows = [...c.projects].sort((a, b) => a.sort - b.sort).map((p) => ({
    id: p.id, slug: p.slug, name: p.name, meta: p.meta.id, published: p.published, wall: p.theme.wall, ink: p.theme.ink,
    hasCase: cases.has(p.slug), caseLive: !!cases.get(p.slug)?.published,
  }));
  return <ProjectList initial={rows} />;
}
