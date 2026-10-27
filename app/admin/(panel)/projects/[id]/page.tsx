import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";
import { previewFiles } from "@/lib/admin/preview-files";
import { getStore } from "@/lib/content/get";
import { lineMap } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await (await getStore()).read();
  return { title: c.projects.find((p) => p.id === id)?.name ?? "Proyek" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await (await getStore()).read();
  const projects = [...c.projects].sort((a, b) => a.sort - b.sort);
  const index = projects.findIndex((p) => p.id === id);
  if (index < 0) notFound();
  const p = projects[index];
  const slots: Record<number, string> = {};
  for (const x of projects) if (x.id !== p.id && !slots[x.mapSlot]) slots[x.mapSlot] = x.name;
  const hasCase = c.caseStudies.some((cs) => cs.projectSlug === p.slug);
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-crumb"><Link href="/admin/projects">Proyek</Link> / Ruang {String(index + 1).padStart(2, "0")}</p>
          <h1>{p.name}</h1>
          <p>{p.published ? "Tayang di situs." : "Draf: belum tampil di situs."}</p>
        </div>
        <div className="adm-head-actions">
          <Link className="adm-btn" href={`/admin/projects/${p.id}/case`}>{hasCase ? "Edit studi kasus" : "Buat studi kasus"}</Link>
        </div>
      </div>
      <ProjectForm
        key={p.id}
        initial={p}
        index={index + 1}
        lines={lineMap(c.lines)}
        works={c.sections.works}
        slots={slots}
        takenSlugs={projects.filter((x) => x.id !== p.id).map((x) => x.slug)}
        previewFiles={await previewFiles(projects.map((x) => x.previewUrl))}
        caseHref={hasCase ? `/admin/projects/${p.id}/case` : null}
      />
    </>
  );
}
