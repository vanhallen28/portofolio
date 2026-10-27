"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";
import { createProjectAction, deleteProjectAction, reorderProjectsAction, setPublishedAction } from "@/app/admin/actions";

export type ProjectRow = { id: string; slug: string; name: string; meta: string; published: boolean; wall: string; ink: string; hasCase: boolean; caseLive: boolean };

export function ProjectList({ initial }: { initial: ProjectRow[] }) {
  const [rows, setRows] = useState(initial);
  // After a save the server sends fresh rows; adopt them (keeps the toast, unlike remounting).
  const [seen, setSeen] = useState(() => JSON.stringify(initial));
  const fresh = JSON.stringify(initial);
  if (fresh !== seen) {
    setSeen(fresh);
    setRows(initial);
  }
  const [armed, setArmed] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ bad: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<ActionResult>, ok: string, rollback?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) { setMsg({ bad: false, text: ok }); router.refresh(); }
      else { rollback?.(); setMsg({ bad: true, text: r.error }); }
    });

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const before = rows;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    run(() => reorderProjectsAction(next.map((r) => r.id)), "Urutan disimpan.", () => setRows(before));
  };
  const publish = (id: string, on: boolean) => {
    const before = rows;
    setRows(rows.map((r) => (r.id === id ? { ...r, published: on } : r)));
    run(() => setPublishedAction(id, on), on ? "Proyek tayang." : "Proyek disembunyikan dari situs.", () => setRows(before));
  };
  const remove = (id: string) => {
    if (armed !== id) { setArmed(id); return; }
    const before = rows;
    setRows(rows.filter((r) => r.id !== id));
    setArmed(null);
    run(() => deleteProjectAction(id), "Proyek dihapus.", () => setRows(before));
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Proyek</h1>
          <p>Urutan di sini adalah urutan ruang di beranda. Draf tidak tampil di situs.</p>
        </div>
        <div className="adm-head-actions">
          <button type="button" className="adm-btn adm-btn-primary" disabled={pending}
            onClick={() => start(async () => { const r = await createProjectAction(); if (r && !r.ok) setMsg({ bad: true, text: r.error }); })}>
            + Proyek baru
          </button>
        </div>
      </div>
      <div className="adm-rows">
        {rows.map((p, i) => (
          <div className="adm-row" key={p.id}>
            <span className="adm-row-n">{String(i + 1).padStart(2, "0")}</span>
            <span className="adm-swatch" style={{ background: p.wall, color: p.ink }} aria-hidden="true">{p.name.slice(0, 1)}</span>
            <div className="adm-row-main">
              <Link href={`/admin/projects/${p.id}`}>{p.name}</Link>
              <p>/{p.slug} · {p.meta}</p>
            </div>
            <div className="adm-row-tools">
              <button type="button" className="adm-btn adm-btn-small adm-btn-icon" onClick={() => move(i, -1)} disabled={pending || i === 0} aria-label={`Naikkan ${p.name}`}>↑</button>
              <button type="button" className="adm-btn adm-btn-small adm-btn-icon" onClick={() => move(i, 1)} disabled={pending || i === rows.length - 1} aria-label={`Turunkan ${p.name}`}>↓</button>
              <label className="adm-toggle" title="Tayang di situs">
                <input type="checkbox" checked={p.published} disabled={pending} onChange={(e) => publish(p.id, e.target.checked)} aria-label={`Tayangkan ${p.name}`} />
                <span className="sw" aria-hidden="true"></span>
                <span><b>{p.published ? "Tayang" : "Draf"}</b></span>
              </label>
              <Link className="adm-btn adm-btn-small" href={`/admin/projects/${p.id}`}>Edit</Link>
              <Link className="adm-btn adm-btn-small" href={`/admin/projects/${p.id}/case`}>Studi kasus{p.hasCase ? (p.caseLive ? "" : " (draf)") : " +"}</Link>
              <button type="button" className={`adm-btn adm-btn-small adm-btn-danger${armed === p.id ? " is-armed" : ""}`} onClick={() => remove(p.id)} onBlur={() => setArmed(null)} disabled={pending}>
                {armed === p.id ? "Yakin? Hapus" : "Hapus"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg ? <div className={`adm-toast${msg.bad ? " is-bad" : ""}`} role={msg.bad ? "alert" : "status"}><button type="button" onClick={() => setMsg(null)} aria-label="Tutup">×</button><p>{msg.text}</p></div> : null}
    </>
  );
}
