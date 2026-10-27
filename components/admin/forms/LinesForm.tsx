"use client";
import type { Line } from "@/lib/content/types";
import { contrastRatio } from "@/lib/contrast";
import { saveLinesAction } from "@/app/admin/actions";
import { SaveBar, useEditor } from "../editor";
import { Card, ColorField, LField } from "../fields";

const ROLE: Record<Line["key"], string> = {
  found: "Website, landing page, SEO",
  sell: "Toko online, kasir, pembayaran",
  serve: "Portal klien, aplikasi pelanggan",
  run: "Sistem internal, HR, keuangan",
};

export function LinesForm({ initial }: { initial: Line[] }) {
  const ed = useEditor(initial, saveLinesAction);
  const put = (i: number, l: Line) => ed.setValue((prev) => prev.map((x, k) => (k === i ? l : x)));
  return (
    <>
      {ed.value.map((l, i) => {
        const light = contrastRatio(l.color, "#F3F3F1");
        const dark = contrastRatio(l.colorDark, "#141517");
        return (
          <Card key={l.key} title={`Jalur ${i + 1}: ${l.name.id || l.key}`} description={ROLE[l.key]}
            aside={<span className="adm-swatch" style={{ background: l.color }} aria-hidden="true" />}>
            <LField label="Nama jalur" value={l.name} onChange={(name) => put(i, { ...l, name })} max={20} />
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
