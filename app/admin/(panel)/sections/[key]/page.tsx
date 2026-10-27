import { notFound } from "next/navigation";
import { SectionForm } from "@/components/admin/forms/SectionForm";
import { SECTION_KEYS } from "@/lib/content/constants";
import { getStore } from "@/lib/content/get";
import type { LineKey, SectionKey } from "@/lib/content/types";

const TITLE: Record<SectionKey, { title: string; text: string }> = {
  hero: { title: "Hero & denah", text: "Bagian paling atas beranda." },
  works: { title: "Karya (teks)", text: "Judul bagian karya dan label yang sama di setiap ruang. Isi tiap ruang diatur di menu Proyek." },
  services: { title: "Layanan", text: "Empat hal yang bisa Anda bangun, mengikuti empat jalur." },
  process: { title: "Cara kerja", text: "Langkah kerja dari obrolan pertama sampai serah terima." },
  testimonials: { title: "Testimoni", text: "Kutipan klien. Tampil setelah ada isinya." },
  about: { title: "Tentang", text: "Cerita singkat tentang Anda." },
  faq: { title: "FAQ", text: "Pertanyaan yang sering ditanyakan calon klien." },
  contact: { title: "Kontak", text: "Ajakan penutup di bagian bawah beranda." },
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return { title: TITLE[key as SectionKey]?.title ?? "Bagian" };
}

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(SECTION_KEYS as readonly string[]).includes(key)) notFound();
  const k = key as SectionKey;
  const c = await (await getStore()).read();
  const lineNames = Object.fromEntries(c.lines.map((l) => [l.key, l.name.id])) as Record<LineKey, string>;
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-crumb">Beranda</p>
          <h1>{TITLE[k].title}</h1>
          <p>{TITLE[k].text}</p>
        </div>
      </div>
      <SectionForm key={k} sectionKey={k} initial={c.sections[k]} lineNames={lineNames} />
    </>
  );
}
