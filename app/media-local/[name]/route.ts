import { readFile } from "node:fs/promises";
import { backend } from "@/lib/env";
import { localMediaDir } from "@/lib/admin/local-media";

/* Serves local-mode uploads (development without Supabase). Production uses Supabase Storage URLs. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[0-9a-f-]{36}\.(webp|pdf)$/.exec(name);
  if (backend() !== "local" || !m) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(`${localMediaDir()}/${name}`);
    const type = m[1] === "pdf" ? "application/pdf" : "image/webp";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        // A PDF is always downloaded, never opened as a page on this site (even a malformed upload).
        ...(m[1] === "pdf" ? { "Content-Disposition": 'attachment; filename="cv.pdf"' } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
