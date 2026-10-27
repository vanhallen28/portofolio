"use client";
import { useId, useState } from "react";
import { uploadPdf } from "@/lib/admin/upload";
import { useAdmin } from "./context";
import { Hint, TextField } from "./fields";

/** PDF picker (e.g. a CV): upload as-is, or paste a link. Empty = not shown on the site. */
export function PdfField({ label, value, onChange, hint }: { label: string; value: string; onChange: (url: string) => void; hint?: React.ReactNode }) {
  const { mode } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    if (mode === "seed") { setErr("Upload butuh database yang terhubung."); return; }
    setBusy(true);
    try {
      onChange((await uploadPdf(file, mode)).url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-field">
      <span className="adm-label" id={id}>{label}</span>
      <div className="adm-image-tools">
        <label className="adm-btn adm-btn-small adm-file">
          {busy ? "Mengunggah…" : value ? "Ganti PDF" : "Unggah PDF"}
          <input type="file" accept="application/pdf" disabled={busy} aria-describedby={id}
            onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {value ? <a className="adm-btn adm-btn-small adm-btn-ghost" href={value} target="_blank" rel="noopener">Buka ↗</a> : null}
        {value ? <button type="button" className="adm-btn adm-btn-small adm-btn-ghost" onClick={() => onChange("")}>Hapus</button> : null}
      </div>
      {err ? <p className="adm-error" role="alert">{err}</p> : null}
      <TextField label="Alamat file (URL)" value={value} onChange={(v) => onChange(v.trim())} mono hint="Terisi otomatis setelah unggah. Bisa juga link PDF dari tempat lain." />
      <Hint>{hint}</Hint>
    </div>
  );
}
