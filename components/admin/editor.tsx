"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";

type Toast = { kind: "ok" | "bad"; text: string; issues?: string[] } | null;

/** Form state + save flow shared by every editor: dirty tracking, leave warning (tab close and in-app
    links), Ctrl/⌘+S, toast. Edits made while a save or an upload is running are never thrown away. */
export function useEditor<T>(initial: T, saveAction: (v: T) => Promise<ActionResult>, prepare?: (v: T) => T) {
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(initial));
  const [toast, setToast] = useState<Toast>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const dirty = JSON.stringify(value) !== saved;
  const busy = useRef(false);

  const save = () => {
    if (busy.current) return;
    busy.current = true;
    const submitted = JSON.stringify(value);
    start(async () => {
      try {
        const v = prepare ? prepare(value) : value;
        const r = await saveAction(v);
        if (r.ok) {
          // Adopt the cleaned-up value only if nothing was typed while saving.
          setValue((cur) => (JSON.stringify(cur) === submitted ? v : cur));
          setSaved(JSON.stringify(v));
          setToast({ kind: "ok", text: "Tersimpan. Perubahan sudah tayang di situs." });
          router.refresh();
        } else {
          setToast({ kind: "bad", text: r.error, issues: r.issues });
        }
      } catch {
        setToast({ kind: "bad", text: "Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi." });
      } finally {
        busy.current = false;
      }
    });
  };
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    // In-app links (sidebar, breadcrumbs) do not fire beforeunload: ask before leaving.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!window.confirm("Ada perubahan yang belum disimpan. Tinggalkan halaman ini?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveRef.current(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    if (toast?.kind !== "ok") return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const reset = () => setValue(JSON.parse(saved) as T);
  /** Set one top-level field, always on top of the latest value. */
  const setField = <K extends keyof T>(k: K, v: T[K]) => setValue((prev) => ({ ...prev, [k]: v }));
  return { value, setValue, setField, dirty, pending, save, reset, toast, closeToast: () => setToast(null) };
}

export function SaveBar({ dirty, pending, onSave, onReset, toast, onCloseToast, viewHref }: {
  dirty: boolean; pending: boolean; onSave: () => void; onReset: () => void; toast: Toast; onCloseToast: () => void; viewHref?: string;
}) {
  return (
    <>
      <div className="adm-savebar" role="region" aria-label="Simpan perubahan">
        <span className={`adm-savebar-state${dirty ? " is-dirty" : ""}`} aria-live="polite">
          {pending ? "Menyimpan…" : dirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan"}
        </span>
        <div className="adm-savebar-actions">
          {viewHref ? <a className="adm-btn" href={viewHref} target="_blank" rel="noopener">Lihat di situs ↗</a> : null}
          {dirty ? <button type="button" className="adm-btn adm-btn-ghost" onClick={onReset} disabled={pending}>Batalkan</button> : null}
          <button type="button" className="adm-btn adm-btn-primary" onClick={onSave} disabled={pending || !dirty}>
            {pending ? "Menyimpan…" : "Simpan & tayangkan"}
          </button>
        </div>
      </div>
      {toast ? (
        <div className={`adm-toast${toast.kind === "bad" ? " is-bad" : ""}`} role={toast.kind === "bad" ? "alert" : "status"}>
          <button type="button" onClick={onCloseToast} aria-label="Tutup">×</button>
          <p>{toast.text}</p>
          {toast.issues?.length ? <ul>{toast.issues.slice(0, 12).map((i) => <li key={i}>{i}</li>)}</ul> : null}
        </div>
      ) : null}
    </>
  );
}
