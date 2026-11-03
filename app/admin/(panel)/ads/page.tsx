import { AdsForm } from "@/components/admin/forms/AdsForm";
import { getStore } from "@/lib/content/get";
import { siteUrl } from "@/lib/env";

export const metadata = { title: "Kode iklan" };

export default async function Page() {
  const c = await (await getStore()).read();
  return (
    <>
      <div className="adm-head"><div><h1>Kode iklan</h1><p>Meta Pixel dan Google AdSense untuk seluruh situs. Cukup isi ID-nya; kodenya dipasang otomatis.</p></div></div>
      <AdsForm initial={c.settings} site={siteUrl()} />
    </>
  );
}
