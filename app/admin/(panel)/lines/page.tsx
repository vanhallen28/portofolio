import { LinesForm } from "@/components/admin/forms/LinesForm";
import { getStore } from "@/lib/content/get";

export const metadata = { title: "Jalur & warna" };

export default async function Page() {
  const c = await (await getStore()).read();
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-crumb">Beranda</p>
          <h1>Jalur & warna</h1>
          <p>Empat jalur fungsi bisnis di denah, filter karya, dan layanan. Urutannya tetap: Ditemukan, Menjual, Melayani, Mengelola.</p>
        </div>
      </div>
      <LinesForm initial={[...c.lines].sort((a, b) => a.sort - b.sort)} />
    </>
  );
}
