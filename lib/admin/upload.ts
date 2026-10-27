"use client";
import { compressImage } from "./compress";

export type Uploaded = { url: string; width: number; height: number };

/** Compress in the browser, then store: Supabase Storage (bucket `media`) or, in local mode, the dev server. */
export async function uploadImage(file: File, mode: "supabase" | "local"): Promise<Uploaded> {
  const { blob, width, height } = await compressImage(file);
  const name = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.webp`;
  if (mode === "supabase") {
    const { browserSupabase } = await import("@/lib/supabase/browser");
    const db = browserSupabase();
    const { error } = await db.storage.from("media").upload(`uploads/${name}`, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
    if (error) throw new Error(/row-level|unauthori|jwt/i.test(error.message) ? "Upload ditolak: sesi admin habis. Masuk lagi lalu coba ulang." : `Upload gagal: ${error.message}`);
    const { data } = db.storage.from("media").getPublicUrl(`uploads/${name}`);
    return { url: data.publicUrl, width, height };
  }
  const form = new FormData();
  form.append("file", blob, "image.webp");
  const res = await fetch("/admin/upload-local", { method: "POST", body: form });
  const json = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !json?.url) throw new Error(json?.error ?? "Upload gagal.");
  return { url: json.url, width, height };
}
