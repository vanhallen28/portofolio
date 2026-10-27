"use client";
import { useState, useTransition } from "react";
import { createCaseStudyAction } from "@/app/admin/actions";

export function CreateCase({ projectId }: { projectId: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="adm-card">
      <div className="adm-card-head"><div><h2>Belum ada studi kasus</h2><p>Buat draf dulu; studi kasus tampil setelah Anda menyalakan sakelar Tayang.</p></div></div>
      {err ? <p className="adm-error" role="alert">{err}</p> : null}
      <button type="button" className="adm-btn adm-btn-primary" disabled={pending}
        onClick={() => start(async () => { const r = await createCaseStudyAction(projectId); if (r && !r.ok) setErr(r.error); })}>
        {pending ? "Membuat…" : "Buat studi kasus"}
      </button>
    </div>
  );
}
