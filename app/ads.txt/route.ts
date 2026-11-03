import { adsTxtLine } from "@/lib/ads";
import { getPublicContent } from "@/lib/content/get";

/* /ads.txt for Google AdSense, from the publisher ID in admin → Kode iklan. Not found while none is set. */
export const dynamic = "force-dynamic";

export async function GET() {
  const { settings } = await getPublicContent();
  const client = settings.ads.adsenseClient;
  if (!client) return new Response("Belum ada ID penayang AdSense.\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(adsTxtLine(client) + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
