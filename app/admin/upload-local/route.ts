import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { getAdmin } from "@/lib/admin/auth";
import { backend } from "@/lib/env";
import { localMediaDir } from "@/lib/admin/local-media";

/* Development only (no Supabase): stores an already-compressed WebP under .data/uploads. */
export async function POST(req: Request) {
  if (backend() !== "local") return Response.json({ error: "Hanya untuk mode lokal." }, { status: 404 });
  if (!(await getAdmin())) return Response.json({ error: "Sesi admin habis. Masuk lagi." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Tidak ada file." }, { status: 400 });
  if (file.type !== "image/webp") return Response.json({ error: "Hanya WebP." }, { status: 415 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Maks. 8 MB." }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  // WebP files start with "RIFF....WEBP"
  if (buf.subarray(0, 4).toString("ascii") !== "RIFF" || buf.subarray(8, 12).toString("ascii") !== "WEBP") {
    return Response.json({ error: "Isi file bukan WebP." }, { status: 415 });
  }
  const name = `${randomUUID()}.webp`;
  await mkdir(localMediaDir(), { recursive: true });
  await writeFile(`${localMediaDir()}/${name}`, buf);
  return Response.json({ url: `/media-local/${name}` });
}
