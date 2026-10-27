"use client";
import { useState } from "react";
import type { Block, CaseStudy, Img, L, Theme } from "@/lib/content/types";
import { BLOCK_LABEL, newBlock } from "@/lib/admin/defaults";
import { saveCaseStudyAction } from "@/app/admin/actions";
import { SaveBar, useEditor } from "../editor";
import { Card, emptyL, LField, ListField, Select, TextField, Toggle } from "../fields";
import { ImageField } from "../ImageField";
import { ThemeField } from "../ThemeField";

const preview = (l: L) => (l.id || l.en || "").slice(0, 56);
const blankImg = (): Img => ({ url: "", alt: emptyL(), width: 1600, height: 1000 });
const BLOCK_TYPES = Object.keys(BLOCK_LABEL) as Block["type"][];

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const title = <LField label="Judul blok" value={block.title} onChange={(title) => onChange({ ...block, title })} />;
  switch (block.type) {
    case "prose":
      return (
        <>
          {title}
          <ListField label="Paragraf" items={block.paragraphs} max={8} addLabel="Tambah paragraf" create={emptyL}
            onChange={(paragraphs) => onChange({ ...block, paragraphs })} itemTitle={(_, i) => `Paragraf ${i + 1}`}
            render={(p, put) => <LField label="Isi" value={p} onChange={put} multiline rows={4} hint="Idealnya di bawah 60 kata per paragraf." />} />
        </>
      );
    case "features":
      return (
        <>
          {title}
          <ListField label="Fitur" items={block.items} max={8} addLabel="Tambah fitur" create={() => ({ title: emptyL(), text: emptyL(), images: [] })}
            onChange={(items) => onChange({ ...block, items })} itemTitle={(it) => preview(it.title) || "Fitur baru"}
            render={(it, put) => (
              <>
                <LField label="Nama fitur" value={it.title} onChange={(t) => put({ ...it, title: t })} />
                <LField label="Penjelasan" value={it.text} onChange={(text) => put({ ...it, text })} multiline rows={3} />
                <ListField label="Gambar" items={it.images} max={3} addLabel="Tambah gambar" create={blankImg}
                  onChange={(images) => put({ ...it, images })} itemTitle={(im, i) => (im.height > im.width * 1.3 ? `Layar HP ${i + 1}` : `Layar ${i + 1}`)}
                  hint="Gambar tegak (HP) tampil berdampingan; gambar lebar tampil penuh."
                  render={(im, putImg) => <ImageField label="Gambar" value={im} onChange={(v) => v && putImg(v)} />} />
              </>
            )} />
        </>
      );
    case "flow":
      return (
        <>
          {title}
          <ListField label="Langkah" items={block.steps} max={8} addLabel="Tambah langkah" create={emptyL}
            onChange={(steps) => onChange({ ...block, steps })} itemTitle={(s, i) => `${i + 1}. ${preview(s)}`}
            render={(s, put) => <LField label="Langkah" value={s} onChange={put} max={90} />} />
        </>
      );
    case "decisions":
      return (
        <>
          {title}
          <ListField label="Keputusan" items={block.items} max={8} addLabel="Tambah keputusan" create={() => ({ title: emptyL(), text: emptyL() })}
            onChange={(items) => onChange({ ...block, items })} itemTitle={(it) => preview(it.title) || "Keputusan baru"}
            render={(it, put) => (
              <>
                <LField label="Judul" value={it.title} onChange={(t) => put({ ...it, title: t })} />
                <LField label="Penjelasan" value={it.text} onChange={(text) => put({ ...it, text })} multiline rows={3} />
              </>
            )} />
        </>
      );
    case "numbers":
      return (
        <>
          {title}
          <ListField label="Angka" items={block.facts} max={6} addLabel="Tambah angka" create={() => ({ value: "1", label: emptyL() })}
            onChange={(facts) => onChange({ ...block, facts })} itemTitle={(f) => `${f.value} · ${preview(f.label)}`}
            render={(f, put) => (
              <div className="adm-grid">
                <TextField label="Angka" value={f.value} max={12} onChange={(value) => put({ ...f, value })} />
                <LField label="Keterangan" value={f.label} onChange={(label) => put({ ...f, label })} />
              </div>
            )} />
          <LField label="Dibangun dengan" value={block.stack} onChange={(stack) => onChange({ ...block, stack })} multiline rows={2} />
        </>
      );
    case "results":
      return (
        <>
          {title}
          <ListField label="Hasil" items={block.items} max={6} addLabel="Tambah hasil" create={() => ({ before: "", after: "1", label: emptyL() })}
            hint="Angka nyata saja. Contoh: sebelum 2 hari → sesudah 1 jam, keterangan: waktu menyusun payroll."
            onChange={(items) => onChange({ ...block, items })} itemTitle={(r) => `${r.before ? `${r.before} → ` : ""}${r.after}`}
            render={(r, put) => (
              <div className="adm-grid">
                <div className="adm-grid-2">
                  <TextField label="Sebelum (opsional)" value={r.before} max={24} onChange={(before) => put({ ...r, before })} placeholder="mis. 2 hari" />
                  <TextField label="Sesudah" value={r.after} max={24} onChange={(after) => put({ ...r, after })} placeholder="mis. 1 jam" />
                </div>
                <LField label="Keterangan" value={r.label} onChange={(label) => put({ ...r, label })} max={90} />
              </div>
            )} />
        </>
      );
  }
}

export function CaseStudyForm({ initial, projectName, projectTheme, viewHref }: { initial: CaseStudy; projectName: string; projectTheme: Theme; viewHref: string }) {
  const ed = useEditor(initial, saveCaseStudyAction);
  const v = ed.value;
  const set = ed.setField;
  const [adding, setAdding] = useState<Block["type"]>("prose");
  const shell = { wall: "#FBF7F0", ink: "#15241E", muted: "#55635B", accent: "#9E7B36", btnBg: "#15241E", btnInk: "#F8EADA" };

  return (
    <>
      <Card title="Pembuka" aside={<Toggle label="Tayang" checked={v.published} onChange={(x) => set("published", x)} hint="Studi kasus tampil bila proyeknya juga tayang." />}>
        <LField label="Subjudul" value={v.subtitle} onChange={(x) => set("subtitle", x)} multiline rows={2} hint={`Satu kalimat di bawah judul "${projectName}".`} />
        <div className="adm-grid-2">
          <TextField label="Klien" value={v.labels.client} onChange={(client) => set("labels", { ...v.labels, client })} />
          <TextField label="Tahun" value={v.labels.year} max={12} onChange={(year) => set("labels", { ...v.labels, year })} />
        </div>
        <LField label="Bidang" value={v.labels.field} onChange={(field) => set("labels", { ...v.labels, field })} />
        <LField label="Peran saya" value={v.labels.role} onChange={(role) => set("labels", { ...v.labels, role })} />
        <ImageField label="Gambar sampul" value={v.cover} onChange={(cover) => set("cover", cover)} optional hint="Gambar lebar di bawah judul. Opsional." />
      </Card>

      <Card title="Warna halaman" aside={<Toggle label="Warna khusus" checked={!!v.theme} onChange={(on) => set("theme", on ? v.theme ?? shell : undefined)} />}
        description="Tanpa warna khusus, halaman memakai warna netral situs (ikut mode terang/gelap pengunjung).">
        {v.theme ? (
          <>
            <div className="adm-image-tools">
              <button type="button" className="adm-btn adm-btn-small" onClick={() => set("theme", { ...projectTheme })}>Salin warna ruang proyek</button>
              <span className="adm-hint">Warna dinding ruang yang gelap atau terang sekali kurang nyaman untuk teks panjang; sesuaikan bila perlu.</span>
            </div>
            <ThemeField value={v.theme} onChange={(theme) => set("theme", theme)} />
          </>
        ) : null}
      </Card>

      <Card title="Isi (blok)" description="Susun cerita dari blok. Urutan di sini adalah urutan di halaman.">
        <Select label="Jenis blok baru" value={adding} options={BLOCK_TYPES.map((t) => ({ value: t, label: BLOCK_LABEL[t] }))} onChange={setAdding}
          hint="Pilih jenisnya, lalu tekan tombol Tambah blok di bawah daftar." />
        <ListField label="Blok" items={v.blocks} max={20} addLabel={`Tambah blok: ${BLOCK_LABEL[adding]}`} onChange={(blocks) => set("blocks", blocks)}
          create={() => newBlock(adding)} itemTitle={(b) => `${BLOCK_LABEL[b.type]} · ${preview(b.title)}`}
          render={(b, put) => <BlockEditor block={b} onChange={put} />} />
      </Card>

      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast} viewHref={viewHref} />
    </>
  );
}
