import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateCase } from "@/components/admin/CreateCase";
import { CaseStudyForm } from "@/components/admin/forms/CaseStudyForm";
import { getStore } from "@/lib/content/get";
import { workPath } from "@/lib/i18n";

export const metadata = { title: "Studi kasus" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await (await getStore()).read();
  const p = c.projects.find((x) => x.id === id);
  if (!p) notFound();
  const study = c.caseStudies.find((cs) => cs.projectSlug === p.slug);
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-crumb"><Link href="/admin/projects">Proyek</Link> / <Link href={`/admin/projects/${p.id}`}>{p.name}</Link></p>
          <h1>Studi kasus: {p.name}</h1>
          <p>Halaman {workPath("id", p.slug)} dan {workPath("en", p.slug)}. Judul, warna huruf, dan link diambil dari data proyek.</p>
        </div>
      </div>
      {study ? <CaseStudyForm key={p.slug} initial={study} projectName={p.name} projectTheme={p.theme} viewHref={workPath("id", p.slug)} /> : <CreateCase projectId={p.id} />}
    </>
  );
}
