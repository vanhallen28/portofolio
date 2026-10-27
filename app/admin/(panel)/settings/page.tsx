import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { getStore } from "@/lib/content/get";

export const metadata = { title: "Pengaturan situs" };

export default async function Page() {
  const c = await (await getStore()).read();
  return (
    <>
      <div className="adm-head"><div><h1>Pengaturan situs</h1><p>Berlaku di semua halaman, dalam dua bahasa.</p></div></div>
      <SettingsForm initial={c.settings} />
    </>
  );
}
