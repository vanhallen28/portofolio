"use client";
import type { L, Line } from "@/lib/content/types";
import { contrastRatio } from "@/lib/contrast";
import { saveLinesAction } from "@/app/admin/actions";
import { SaveBar, useEditor } from "../editor";
import { Card, ColorField, LField } from "../fields";

/* Where each line sits on the hero map; the key decides the side, so the side never changes. */
const SIDE: Record<Line["key"], string> = {
  found: "Sisi atas denah",
  sell: "Sisi kanan denah",
  serve: "Sisi kiri denah",
  run: "Sisi bawah denah",
};

/* Ready-made names in both languages; the first of each is the default since v0.2.14, the last the original one. */
const PRESETS: Record<Line["key"], L[]> = {
  found: [
    { id: "Kehadiran Digital", en: "Digital Presence" },
    { id: "Brand & Website", en: "Brand & Website" },
    { id: "Pemasaran Digital", en: "Digital Marketing" },
    { id: "Ditemukan", en: "Get found" },
  ],
  sell: [
    { id: "Penjualan Digital", en: "Digital Commerce" },
    { id: "E-Commerce & Kasir", en: "E-Commerce & POS" },
    { id: "Transaksi & Pembayaran", en: "Sales & Payments" },
    { id: "Menjual", en: "Sell" },
  ],
  serve: [
    { id: "Pengalaman Pelanggan", en: "Customer Experience" },
    { id: "Layanan Pelanggan", en: "Customer Service" },
    { id: "Portal & Aplikasi", en: "Portals & Apps" },
    { id: "Melayani", en: "Serve" },
  ],
  run: [
    { id: "Operasional Bisnis", en: "Business Operations" },
    { id: "Sistem Internal", en: "Internal Systems" },
    { id: "Manajemen Operasional", en: "Operations Management" },
    { id: "Mengelola", en: "Run" },
  ],
};

export const LINE_NAME_MAX = 24;

export function LinesForm({ initial }: { initial: Line[] }) {
  const ed = useEditor(initial, saveLinesAction);
  const put = (i: number, l: Line) => ed.setValue((prev) => prev.map((x, k) => (k === i ? l : x)));
  return (
    <>
      {ed.value.map((l, i) => {
        const light = contrastRatio(l.color, "#F3F3F1");
        const dark = contrastRatio(l.colorDark, "#141517");
        const same = (p: L) => p.id === l.name.id && p.en === l.name.en;
        return (
          <Card key={l.key} title={`Jalur ${i + 1}: ${l.name.id || l.key}`} description={SIDE[l.key]}
            aside={<span className="adm-swatch" style={{ background: l.color }} aria-hidden="true" />}>
            <div className="adm-field">
              <span className="adm-label">Pilihan nama siap pakai</span>
              <div className="adm-presets">
                {PRESETS[l.key].map((p) => (
                  <button key={p.id} type="button" className="adm-preset" aria-pressed={same(p)} onClick={() => put(i, { ...l, name: { ...p } })}>
                    {p.id}<small>{p.en}</small>
                  </button>
                ))}
              </div>
            </div>
            <LField label="Nama jalur" value={l.name} onChange={(name) => put(i, { ...l, name })} max={LINE_NAME_MAX}
              hint="Tampil di denah hero, filter Karya, judul kartu Layanan, label ruang, dan studi kasus. Klik pilihan di atas atau tulis sendiri." />
            <LField label="Cakupan" value={l.desc} onChange={(desc) => put(i, { ...l, desc })} max={80}
              hint="Satu frasa tentang apa yang termasuk di jalur ini, mis. Website, landing page, dan SEO. Muncul saat filter Karya disorot dan sebagai panduan di form proyek." />
            <div className="adm-grid-2">
              <ColorField label="Warna (mode terang)" value={l.color} onChange={(color) => put(i, { ...l, color })}
                hint={`Kontras dengan latar: ${Number.isFinite(light) ? light.toFixed(2) : "–"}${light < 3 ? " · terlalu pucat untuk teks" : ""}`} />
              <ColorField label="Warna (mode gelap)" value={l.colorDark} onChange={(colorDark) => put(i, { ...l, colorDark })}
                hint={`Kontras dengan latar gelap: ${Number.isFinite(dark) ? dark.toFixed(2) : "–"}${dark < 3 ? " · terlalu gelap untuk teks" : ""}`} />
            </div>
          </Card>
        );
      })}
      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast} viewHref="/" />
    </>
  );
}
