import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";

/** HTML files under public/preview, offered as suggestions in the project form. */
export async function previewFiles(known: string[]): Promise<string[]> {
  const found = new Set(known.filter(Boolean));
  try {
    for (const f of await readdir(path.join(process.cwd(), "public", "preview"))) if (f.endsWith(".html")) found.add(`/preview/${f}`);
  } catch {
    // On Vercel the public folder is served by the CDN and may not be readable here; known links still show.
  }
  return [...found].sort();
}
