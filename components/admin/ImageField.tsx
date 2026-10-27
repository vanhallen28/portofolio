"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Img } from "@/lib/content/types";
import { ACCEPT_ATTR } from "@/lib/admin/compress";
import { uploadImage } from "@/lib/admin/upload";
import { useAdmin } from "./context";
import { Hint, LField, TextField } from "./fields";

type Props = {
  label: string;
  value: Img | null;
  onChange: (v: Img | null) => void;
  /** Allow removing the image (field becomes empty). */
  optional?: boolean;
  hint?: React.ReactNode;
  /** Only the URL (e.g. a logo), no alt text or size. */
  urlOnly?: boolean;
};

const blank: Img = { url: "", alt: { id: "", en: "" }, width: 1600, height: 1000 };

/** Image picker: upload (compressed to WebP in the browser) or paste a URL; alt text in both languages. */
export function ImageField({ label, value, onChange, optional, hint, urlOnly }: Props) {
  const { mode } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  const v = value ?? blank;
  /** After a URL is typed in, read the real size from the loaded image. */
  const measure = useRef(false);
  const latest = useRef(v);
  useEffect(() => { latest.current = value ?? blank; });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setErr(null);
    if (mode === "seed") { setErr("Upload butuh database yang terhubung."); return; }
    setBusy(true);
    try {
      const up = await uploadImage(file, mode);
      onChange({ ...latest.current, url: up.url, width: up.width, height: up.height });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-field">
      <span className="adm-label" id={`${id}-l`}>{label}</span>
      <div className="adm-image">
        <div className="adm-thumb">
          {v.url ? (
            <img src={v.url} alt="" onLoad={(e) => {
              if (!measure.current) return;
              measure.current = false;
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
              if (w && h && (w !== v.width || h !== v.height)) onChange({ ...v, width: w, height: h });
            }} />
          ) : <span>Belum ada</span>}
        </div>
        <div className="adm-grid" style={{ gap: 10 }}>
          <div className="adm-image-tools">
            <label className={`adm-btn adm-btn-small adm-file${busy ? " is-busy" : ""}`}>
              {busy ? "Mengunggah…" : v.url ? "Ganti gambar" : "Unggah gambar"}
              <input type="file" accept={ACCEPT_ATTR} disabled={busy} aria-describedby={`${id}-l`}
                onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {optional && value ? (
              <button type="button" className="adm-btn adm-btn-small adm-btn-ghost" onClick={() => onChange(null)}>Hapus gambar</button>
            ) : null}
            {v.url && !urlOnly ? <span className="adm-hint">{v.width} × {v.height} px</span> : null}
          </div>
          {err ? <p className="adm-error" role="alert">{err}</p> : null}
          <TextField label="Alamat gambar (URL)" value={v.url} onChange={(url) => { measure.current = true; onChange({ ...v, url }); }} mono
            hint="Terisi otomatis setelah unggah. Bisa juga diisi link gambar, mis. /media/seed/nama.webp" />
          {!urlOnly ? (
            <LField label="Teks alternatif (dibacakan untuk tunanetra, juga dibaca Google)" value={v.alt} onChange={(alt) => onChange({ ...v, alt })}
              placeholder={{ id: "Apa yang terlihat di gambar", en: "What the image shows" }} />
          ) : null}
        </div>
      </div>
      <Hint>{hint}</Hint>
    </div>
  );
}
