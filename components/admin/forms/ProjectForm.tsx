"use client";
import Link from "next/link";
import { useState } from "react";
import { FONT_KEYS, LAYOUTS, LINE_KEYS, MAP_SLOTS, PATTERNS, ROOM_MOTIONS, TITLE_SIZES, VISUAL_ROLES } from "@/lib/content/constants";
import type { Line, LineKey, Project, Sections } from "@/lib/content/types";
import { FONT_FAMILY, FONT_LABEL } from "@/lib/font-family";
import { saveProjectAction } from "@/app/admin/actions";
import { SaveBar, useEditor } from "../editor";
import { Card, Checks, emptyL, LField, ListField, NumberField, orNull, Select, TextField, Toggle } from "../fields";
import { ImageField } from "../ImageField";
import { RoomPreview } from "../RoomPreview";
import { ThemeField } from "../ThemeField";

type Props = {
  initial: Project;
  index: number;
  lines: Record<LineKey, Line>;
  works: Sections["works"];
  /** Which project sits on each map slot (other than this one). */
  slots: Record<number, string>;
  takenSlugs: string[];
  previewFiles: string[];
  caseHref: string | null;
};

const LAYOUT_LABEL: Record<(typeof LAYOUTS)[number], string> = {
  "desk-phone": "Layar desktop + HP di depan",
  "back-desk": "Dua layar desktop bertumpuk (+ HP opsional)",
  "two-phones": "Dua layar HP berdampingan",
  "brand-card": "Kartu merek: logo, warna produk, catatan",
};
const MOTION_LABEL: Record<(typeof ROOM_MOTIONS)[number], string> = {
  auto: "Otomatis (berbeda dari ruang di sebelahnya)",
  arch: "Gerbang: layar terbuka dari bawah berbentuk lengkung",
  slide: "Geser: layar masuk dari samping, lalu bergeser berlawanan",
  curtain: "Tirai: layar terbuka dari tengah, HP berayun",
  spread: "Kipas: layar bertumpuk di tengah lalu menyebar",
  focus: "Fokus: dari buram menjadi tajam",
  tilt: "Putar 3D: layar terangkat dan berputar",
  signal: "Sinyal: layar membesar, HP jatuh memantul",
  print: "Cetak: layar keluar baris demi baris seperti struk",
  unfold: "Lembaran: desktop terbentang seperti peta, HP berbalik seperti halaman",
  glow: "Nyala: layar menyala dari gelap seperti cahaya lilin",
  pop: "Muncul: layar melompat dari tepi bawah lalu memantul, seperti maskot yang menyapa",
};
const ROLE_LABEL: Record<(typeof VISUAL_ROLES)[number], string> = { desk: "Layar desktop", phone: "Layar HP", back: "Layar desktop di belakang" };
const PATTERN_LABEL: Record<(typeof PATTERNS)[number], string> = { none: "Polos", checker: "Kotak-kotak halus", glow: "Cahaya di pojok kanan atas" };
const SIZE_LABEL: Record<(typeof TITLE_SIZES)[number], string> = { md: "Sedang", lg: "Besar", xl: "Lebih besar", xxl: "Paling besar" };

function LinkCheck({ url }: { url: string }) {
  const [state, setState] = useState<string | null>(null);
  if (!url) return null;
  const check = async () => {
    setState("Memeriksa…");
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      setState(r.ok ? "✓ File ditemukan" : `✗ Tidak ditemukan (${r.status}). Pastikan file ada di folder public/preview lalu deploy ulang.`);
    } catch {
      setState(url.startsWith("/") ? "✗ Tidak bisa dibuka" : "Link luar: buka sendiri untuk memastikan.");
    }
  };
  return (
    <div className="adm-image-tools">
      <button type="button" className="adm-btn adm-btn-small" onClick={check}>Cek link</button>
      <a className="adm-btn adm-btn-small adm-btn-ghost" href={url} target="_blank" rel="noopener">Buka ↗</a>
      {state ? <span className="adm-hint" role="status">{state}</span> : null}
    </div>
  );
}

export function ProjectForm({ initial, index, lines, works, slots, takenSlugs, previewFiles, caseHref }: Props) {
  const ed = useEditor<Project>(initial, saveProjectAction, (p) => ({
    ...p,
    status: p.status ? orNull(p.status) : null,
    liveNote: p.liveNote ? orNull(p.liveNote) : null,
    result: p.result ? orNull(p.result) : null,
    mapLabel: p.mapLabel.trim() || p.name.slice(0, 24),
  }));
  const p = ed.value;
  const set = ed.setField;
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug);
  const slugTaken = takenSlugs.includes(p.slug);
  const lineNames = Object.fromEntries(LINE_KEYS.map((k) => [k, lines[k]?.name.id ?? k])) as Record<LineKey, string>;

  return (
    <>
      <div className="adm-split">
        <div>
          <Card title="Dasar" aside={<Toggle label="Tayang" checked={p.published} onChange={(v) => set("published", v)} />}>
            <div className="adm-grid-2">
              <TextField label="Nama proyek" value={p.name} onChange={(v) => set("name", v)} max={200} />
              <TextField label="Slug (alamat studi kasus)" value={p.slug} mono invalid={!slugOk || slugTaken}
                onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
                hint={slugTaken ? "Slug ini sudah dipakai proyek lain." : !slugOk ? "Hanya huruf kecil, angka, dan tanda hubung." : `/karya/${p.slug} · /en/work/${p.slug}${p.slug !== initial.slug ? " · alamat lama akan berhenti bekerja" : ""}`} />
            </div>
            <LField label="Keterangan singkat (bidang, kota, tahun)" value={p.meta} onChange={(v) => set("meta", v)} />
            <LField label="Cerita singkat" value={p.text} onChange={(v) => set("text", v)} multiline rows={5} hint="2–4 kalimat: masalah bisnisnya, apa yang Anda bangun, hasilnya." />
            <LField label="Hasil untuk bisnisnya (opsional)" value={p.result ?? emptyL()} onChange={(v) => set("result", v)} multiline rows={2} max={160}
              hint="Satu kalimat yang ditonjolkan di ruang, mis. Payroll yang dulu 2 hari kini selesai dalam 1 jam. Kosongkan bila belum ada angka nyata." />
            <Checks label="Jalur" values={p.lines} min={1} onChange={(v) => set("lines", v)}
              options={LINE_KEYS.map((k) => ({ value: k, label: <><i className="ldot" style={{ background: lines[k]?.color }} />{lineNames[k]}</> }))}
              hint="Menentukan filter di bagian Karya dan garis yang menyala di denah." />
          </Card>

          <Card title="Fakta (angka besar)" description="Angka menghitung naik saat ruang terlihat. Maks. 4.">
            <ListField label="Fakta" items={p.facts} max={4} addLabel="Tambah fakta" onChange={(v) => set("facts", v)}
              create={() => ({ value: "1", label: emptyL() })} itemTitle={(f) => `${f.value} · ${f.label.id}`.slice(0, 50)}
              render={(f, put) => (
                <div className="adm-grid">
                  <TextField label="Angka" value={f.value} max={12} onChange={(value) => put({ ...f, value })} hint="Mis. 25, 47rb, 20+" />
                  <LField label="Keterangan" value={f.label} onChange={(label) => put({ ...f, label })} />
                </div>
              )} />
          </Card>

          <Card title="Tombol, link & status">
            <TextField label="Link preview proyek (file HTML)" value={p.previewUrl} onChange={(v) => set("previewUrl", v.trim())} mono list="preview-files"
              hint="Dibuka di tab baru lewat tombol Preview proyek. File disimpan di folder public/preview (lihat README). Kosongkan bila belum ada." />
            <datalist id="preview-files">{previewFiles.map((f) => <option key={f} value={f} />)}</datalist>
            <LinkCheck url={p.previewUrl} />
            <div className="adm-grid-2">
              <TextField label="Link situs live" value={p.liveUrl} onChange={(v) => set("liveUrl", v.trim())} mono placeholder="https://" />
              <TextField label="Teks link live" value={p.liveLabel} onChange={(v) => set("liveLabel", v)} placeholder="namasitus.com" />
            </div>
            <LField label="Catatan link (opsional)" value={p.liveNote ?? emptyL()} onChange={(v) => set("liveNote", v)} hint="Mis. versi live khusus tim." />
            <LField label="Status (opsional)" value={p.status ?? emptyL()} onChange={(v) => set("status", v)} hint="Mis. Belum tayang, menunggu keputusan klien. Kosongkan bila tidak perlu." />
          </Card>

          <Card title="Judul ruang" description="Huruf judul meminjam karakter merek klien.">
            <div className="adm-grid-2">
              <Select label="Huruf" value={p.titleFont} options={FONT_KEYS.map((k) => ({ value: k, label: FONT_LABEL[k] }))} onChange={(v) => set("titleFont", v)} />
              <Select label="Ukuran" value={p.titleStyle.size} options={TITLE_SIZES.map((k) => ({ value: k, label: SIZE_LABEL[k] }))} onChange={(v) => set("titleStyle", { ...p.titleStyle, size: v })} />
              <Select label="Ketebalan" value={p.titleStyle.weight} options={[400, 500, 600, 700, 800].map((w) => ({ value: w as 400, label: String(w) }))} onChange={(v) => set("titleStyle", { ...p.titleStyle, weight: v })}
                hint="Tidak semua huruf punya semua ketebalan." />
              <NumberField label="Jarak huruf (em)" value={p.titleStyle.tracking} min={-0.1} max={0.3} step={0.01} onChange={(v) => set("titleStyle", { ...p.titleStyle, tracking: Math.max(-0.1, Math.min(0.3, v)) })} />
            </div>
            <Toggle label="Huruf kapital semua" checked={p.titleStyle.uppercase} onChange={(v) => set("titleStyle", { ...p.titleStyle, uppercase: v })} />
            <p className="adm-hint" style={{ fontFamily: FONT_FAMILY[p.titleFont], fontSize: 28, color: "var(--a-ink)", textTransform: p.titleStyle.uppercase ? "uppercase" : "none", fontWeight: p.titleStyle.weight, letterSpacing: `${p.titleStyle.tracking}em` }}>{p.name}</p>
          </Card>

          <Card title="Warna ruang" description="Dinding situs berganti ke warna ini saat pengunjung masuk ke ruangnya.">
            <ThemeField value={p.theme} onChange={(v) => set("theme", v)} />
            <Select label="Pola latar" value={p.pattern} options={PATTERNS.map((k) => ({ value: k, label: PATTERN_LABEL[k] }))} onChange={(v) => set("pattern", v)} />
          </Card>

          <Card title="Tampilan visual">
            <Select label="Tata letak" value={p.layout} options={LAYOUTS.map((k) => ({ value: k, label: LAYOUT_LABEL[k] }))} onChange={(v) => set("layout", v)} />
            <Select label="Efek layar saat digulir" value={p.motion} options={ROOM_MOTIONS.map((k) => ({ value: k, label: MOTION_LABEL[k] }))} onChange={(v) => set("motion", v)}
              hint="Gerakan layar desktop dan HP saat ruang ini masuk ke layar. Tidak berjalan bila pengunjung memilih gerak dikurangi." />
            {p.layout === "brand-card" ? (
              <div className="adm-grid">
                <ImageField label="Logo" urlOnly value={p.brand ? { url: p.brand.logoUrl, alt: emptyL(), width: 1, height: 1 } : null}
                  onChange={(img) => set("brand", { swatches: [], note: emptyL(), ...p.brand, logoUrl: img?.url ?? "" })} optional />
                <ListField label="Warna produk" items={p.brand?.swatches ?? []} max={8} addLabel="Tambah warna"
                  onChange={(swatches) => set("brand", { logoUrl: "", note: emptyL(), ...p.brand, swatches })}
                  create={() => ({ name: "Warna", color: "#D9CDB8" })} itemTitle={(s) => s.name}
                  render={(s, put) => (
                    <div className="adm-grid-2">
                      <TextField label="Nama" value={s.name} onChange={(name) => put({ ...s, name })} />
                      <TextField label="Warna (#RRGGBB)" value={s.color} mono onChange={(color) => put({ ...s, color: color.toUpperCase() })} />
                    </div>
                  )} />
                <LField label="Catatan di lengkung" value={p.brand?.note ?? emptyL()} onChange={(note) => set("brand", { logoUrl: "", swatches: [], ...p.brand, note })} />
              </div>
            ) : null}
            <ListField label={p.layout === "brand-card" ? "Gambar (opsional, menggantikan lengkung)" : "Gambar layar"} items={p.visuals} max={3} addLabel="Tambah gambar"
              onChange={(v) => set("visuals", v)}
              create={() => ({ role: p.layout === "two-phones" ? "phone" as const : "desk" as const, image: { url: "", alt: emptyL(), width: 1600, height: 1000 } })}
              itemTitle={(v) => ROLE_LABEL[v.role]}
              render={(v, put) => (
                <div className="adm-grid">
                  {p.layout !== "two-phones" ? (
                    <Select label="Jenis layar" value={v.role} options={VISUAL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} onChange={(role) => put({ ...v, role })} />
                  ) : null}
                  <ImageField label="Gambar" value={v.image} onChange={(image) => image && put({ ...v, image })} hint="Screenshot dengan data samaran. Ukuran HP ideal 390×844 atau 600×1298." />
                </div>
              )} />
          </Card>

          <Card title="Denah jalur" description="Setiap proyek adalah satu stasiun di denah hero.">
            <div className="adm-grid-2">
              <TextField label="Label di denah" value={p.mapLabel} max={24} onChange={(v) => set("mapLabel", v)} />
              <Select label="Posisi stasiun" value={p.mapSlot}
                options={MAP_SLOTS.map((s) => ({ value: s, label: `${s} · ${["Kiri atas", "Atas tengah", "Kanan atas", "Kanan, atas", "Kanan, bawah", "Kanan bawah", "Bawah tengah", "Kiri bawah", "Kiri, atas", "Kiri, bawah", "Kiri, tengah"][s - 1]}${slots[s] ? ` (dipakai ${slots[s]})` : ""}` }))}
                onChange={(v) => set("mapSlot", v)}
                hint={slots[p.mapSlot] ? `Posisi ini juga dipakai ${slots[p.mapSlot]}; hanya satu yang tampil di denah.` : "Pojok berada di pertemuan dua jalur."} />
            </div>
          </Card>
        </div>

        <RoomPreview project={p} index={index} lines={lines} works={works} />
      </div>

      <p className="adm-hint" style={{ marginTop: 16 }}>
        {caseHref ? <Link href={caseHref}>Edit studi kasus proyek ini →</Link> : null}
      </p>
      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast}
        viewHref={p.published ? `/#ruang-${initial.slug}` : undefined} />
    </>
  );
}
