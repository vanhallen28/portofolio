/* Runs in the browser. Turns any photo or screenshot into a WebP no larger than MAX_SIDE,
   so uploads stay small and pages stay fast. */

export const MAX_SIDE = 2400;
export const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const ACCEPT_ATTR = ACCEPT.join(",");

export type Compressed = { blob: Blob; width: number; height: number };

export async function compressImage(file: File, maxSide = MAX_SIDE, quality = 0.86): Promise<Compressed> {
  if (!ACCEPT.includes(file.type)) throw new Error("Pilih file gambar JPG, PNG, WebP, AVIF, atau GIF.");
  if (file.size > 40 * 1024 * 1024) throw new Error("File terlalu besar (maks. 40 MB sebelum dikompres).");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser ini tidak bisa memproses gambar.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  let q = quality;
  let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
  while (blob && blob.size > MAX_BYTES && q > 0.4) {
    q -= 0.15;
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
  }
  if (!blob || blob.type !== "image/webp") throw new Error("Browser ini tidak bisa membuat WebP. Coba Chrome, Edge, atau Safari terbaru.");
  if (blob.size > MAX_BYTES) throw new Error("Gambar masih lebih dari 8 MB setelah dikompres.");
  return { blob, width, height };
}
