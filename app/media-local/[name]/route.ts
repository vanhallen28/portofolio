import { readFile } from "node:fs/promises";
import { backend } from "@/lib/env";
import { localMediaDir } from "@/lib/admin/local-media";

/* Serves local-mode uploads (development without Supabase). Production uses Supabase Storage URLs. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (backend() !== "local" || !/^[0-9a-f-]{36}\.webp$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(`${localMediaDir()}/${name}`);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
