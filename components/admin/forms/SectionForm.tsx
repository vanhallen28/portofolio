"use client";
import type { L, LineKey, SectionKey, Sections } from "@/lib/content/types";
import { LINE_KEYS } from "@/lib/content/constants";
import { saveSectionAction } from "@/app/admin/actions";
import { useAdmin } from "../context";
import { SaveBar, useEditor } from "../editor";
import { Card, Checks, emptyL, LField, ListField, Select, TextField, Toggle } from "../fields";

type Props<K extends SectionKey> = { sectionKey: K; initial: Sections[K]; lineNames: Record<LineKey, string> };

const preview = (l: L) => (l.id || l.en || "").slice(0, 60);

export function SectionForm<K extends SectionKey>({ sectionKey, initial, lineNames }: Props<K>) {
  const ed = useEditor<Sections[K]>(initial, (v) => saveSectionAction(sectionKey, v));
  const { projects } = useAdmin();
  const v = ed.value as Sections[SectionKey];
  const set = (patch: Partial<Sections[K]>) => ed.setValue((prev) => ({ ...prev, ...patch }));
  const projectOptions = projects.map((p) => ({ value: p.slug, label: p.name }));

  const body = (() => {
    switch (sectionKey) {
      case "hero": {
        const h = v as Sections["hero"];
        return (
          <>
            <Card title="Teks utama" description="Bagian pertama yang dibaca pengunjung.">
              <LField label="Peran (di atas judul)" value={h.role} onChange={(x) => set({ role: x } as never)} />
              <LField label="Judul besar" value={h.title} onChange={(x) => set({ title: x } as never)} multiline rows={3} max={140} hint="Satu kalimat yang menjawab: apa yang Anda bangun untuk bisnis mereka." />
              <LField label="Paragraf pembuka" value={h.lede} onChange={(x) => set({ lede: x } as never)} multiline rows={4} />
              <div className="adm-grid-2">
                <LField label="Tombol utama (WhatsApp)" value={h.ctaPrimary} onChange={(x) => set({ ctaPrimary: x } as never)} />
                <LField label="Tombol kedua (ke Karya)" value={h.ctaSecondary} onChange={(x) => set({ ctaSecondary: x } as never)} />
              </div>
            </Card>
            <Card title="Denah jalur" description="Nama stasiun diatur di tiap proyek (Label denah), nama jalur di menu Jalur & warna.">
              <LField label="Teks di tengah denah" value={h.mapCenter} onChange={(x) => set({ mapCenter: x } as never)} max={20} />
              <LField label="Keterangan di bawah denah" value={h.mapCaption} onChange={(x) => set({ mapCaption: x } as never)} multiline rows={3} />
            </Card>
          </>
        );
      }
      case "works": {
        const w = v as Sections["works"];
        const cl = w.caseLabels;
        return (
          <>
            <Card title="Judul & pengantar">
              <LField label="Judul bagian" value={w.title} onChange={(x) => set({ title: x } as never)} />
              <LField label="Pengantar" value={w.intro} onChange={(x) => set({ intro: x } as never)} multiline rows={3} />
              <LField label="Filter: semua" value={w.allLabel} onChange={(x) => set({ allLabel: x } as never)} />
            </Card>
            <Card title="Label di setiap ruang" description="Sama untuk semua proyek.">
              <div className="adm-grid-2">
                <LField label="Kata sebelum nomor (Ruang 01)" value={w.roomLabel} onChange={(x) => set({ roomLabel: x } as never)} />
                <LField label="Tombol preview" value={w.previewCta} onChange={(x) => set({ previewCta: x } as never)} />
                <LField label="Tombol studi kasus" value={w.caseCta} onChange={(x) => set({ caseCta: x } as never)} />
                <LField label="Tombol kunjungi (bila tak ada preview)" value={w.visitCta} onChange={(x) => set({ visitCta: x } as never)} />
                <LField label="Kartu ruang berikutnya" value={w.nextRoom} onChange={(x) => set({ nextRoom: x } as never)} />
                <LField label="Keterangan tab baru (dibacakan)" value={w.newTab} onChange={(x) => set({ newTab: x } as never)} />
              </div>
            </Card>
            <Card title="Label di halaman studi kasus">
              <div className="adm-grid-2">
                <LField label="Klien" value={cl.client} onChange={(x) => set({ caseLabels: { ...cl, client: x } } as never)} />
                <LField label="Bidang" value={cl.field} onChange={(x) => set({ caseLabels: { ...cl, field: x } } as never)} />
                <LField label="Peran saya" value={cl.role} onChange={(x) => set({ caseLabels: { ...cl, role: x } } as never)} />
                <LField label="Tahun" value={cl.year} onChange={(x) => set({ caseLabels: { ...cl, year: x } } as never)} />
                <LField label="Jalur" value={cl.lines} onChange={(x) => set({ caseLabels: { ...cl, lines: x } } as never)} />
                <LField label="Situs" value={cl.site} onChange={(x) => set({ caseLabels: { ...cl, site: x } } as never)} />
              </div>
            </Card>
          </>
        );
      }
      case "services": {
        const s = v as Sections["services"];
        return (
          <Card title="Layanan" aside={<Toggle label="Tampilkan" checked={s.visible} onChange={(x) => set({ visible: x } as never)} />}>
            <LField label="Judul bagian" value={s.title} onChange={(x) => set({ title: x } as never)} />
            <LField label="Label contoh" value={s.proofLabel} onChange={(x) => set({ proofLabel: x } as never)} />
            <ListField label="Daftar layanan" items={s.items} max={8} addLabel="Tambah layanan"
              onChange={(items) => set({ items } as never)}
              create={() => ({ line: "found" as LineKey, text: emptyL(), proof: [] })}
              itemTitle={(it) => lineNames[it.line]}
              render={(it, put) => (
                <>
                  <Select label="Jalur (judul & warna)" value={it.line} options={LINE_KEYS.map((k) => ({ value: k, label: lineNames[k] }))} onChange={(line) => put({ ...it, line })} />
                  <LField label="Penjelasan" value={it.text} onChange={(text) => put({ ...it, text })} multiline rows={3} />
                  <Checks label="Contoh proyek" values={it.proof} options={projectOptions} onChange={(proof) => put({ ...it, proof })} />
                </>
              )} />
          </Card>
        );
      }
      case "process": {
        const p = v as Sections["process"];
        return (
          <Card title="Cara kerja" aside={<Toggle label="Tampilkan" checked={p.visible} onChange={(x) => set({ visible: x } as never)} />}>
            <LField label="Judul bagian" value={p.title} onChange={(x) => set({ title: x } as never)} />
            <ListField label="Langkah" items={p.steps} max={8} addLabel="Tambah langkah"
              onChange={(steps) => set({ steps } as never)}
              create={() => ({ title: emptyL(), text: emptyL() })}
              itemTitle={(it, i) => `${i + 1}. ${preview(it.title)}`}
              render={(it, put) => (
                <>
                  <LField label="Judul langkah" value={it.title} onChange={(title) => put({ ...it, title })} />
                  <LField label="Penjelasan" value={it.text} onChange={(text) => put({ ...it, text })} multiline rows={3} />
                </>
              )} />
          </Card>
        );
      }
      case "testimonials": {
        const t = v as Sections["testimonials"];
        return (
          <Card title="Testimoni" description="Bagian ini baru tampil bila sakelar aktif dan ada minimal satu testimoni."
            aside={<Toggle label="Tampilkan" checked={t.visible} onChange={(x) => set({ visible: x } as never)} />}>
            <LField label="Judul bagian" value={t.title} onChange={(x) => set({ title: x } as never)} />
            <ListField label="Testimoni" items={t.items} max={12} addLabel="Tambah testimoni" emptyText="Belum ada testimoni. Minta klien menulis 1–3 kalimat tentang hasil kerjanya."
              onChange={(items) => set({ items } as never)}
              create={() => ({ quote: emptyL(), name: "", role: emptyL(), projectSlug: "" })}
              itemTitle={(it) => it.name || "Testimoni baru"}
              render={(it, put) => (
                <>
                  <LField label="Kutipan" value={it.quote} onChange={(quote) => put({ ...it, quote })} multiline rows={3} />
                  <div className="adm-grid-2">
                    <TextField label="Nama" value={it.name} onChange={(name) => put({ ...it, name })} />
                    <Select label="Proyek terkait" value={it.projectSlug} options={[{ value: "", label: "Tidak ada" }, ...projectOptions]} onChange={(projectSlug) => put({ ...it, projectSlug })} />
                  </div>
                  <LField label="Jabatan / bisnis" value={it.role} onChange={(role) => put({ ...it, role })} />
                </>
              )} />
          </Card>
        );
      }
      case "about": {
        const a = v as Sections["about"];
        return (
          <Card title="Tentang" description="Foto profil diatur di Pengaturan situs." aside={<Toggle label="Tampilkan" checked={a.visible} onChange={(x) => set({ visible: x } as never)} />}>
            <LField label="Judul bagian" value={a.title} onChange={(x) => set({ title: x } as never)} />
            <ListField label="Paragraf" items={a.paragraphs} max={6} addLabel="Tambah paragraf"
              onChange={(paragraphs) => set({ paragraphs } as never)} create={emptyL}
              itemTitle={(it, i) => `Paragraf ${i + 1}`}
              render={(it, put) => <LField label="Isi" value={it} onChange={put} multiline rows={4} />} />
            <ListField label="Keahlian (label kecil)" items={a.skills} max={16} addLabel="Tambah keahlian"
              onChange={(skills) => set({ skills } as never)} create={emptyL}
              itemTitle={(it) => preview(it) || "Keahlian baru"}
              render={(it, put) => <LField label="Label" value={it} onChange={put} max={40} />} />
          </Card>
        );
      }
      case "faq": {
        const f = v as Sections["faq"];
        return (
          <Card title="FAQ" description="Tampil bila sakelar aktif dan ada minimal satu pertanyaan."
            aside={<Toggle label="Tampilkan" checked={f.visible} onChange={(x) => set({ visible: x } as never)} />}>
            <LField label="Judul bagian" value={f.title} onChange={(x) => set({ title: x } as never)} />
            <ListField label="Tanya-jawab" items={f.items} max={20} addLabel="Tambah pertanyaan"
              emptyText="Contoh: Berapa lama pembuatannya? Apakah saya bisa mengubah isi sendiri? Bagaimana pembayarannya?"
              onChange={(items) => set({ items } as never)} create={() => ({ q: emptyL(), a: emptyL() })}
              itemTitle={(it) => preview(it.q) || "Pertanyaan baru"}
              render={(it, put) => (
                <>
                  <LField label="Pertanyaan" value={it.q} onChange={(q) => put({ ...it, q })} />
                  <LField label="Jawaban" value={it.a} onChange={(a) => put({ ...it, a })} multiline rows={4} />
                </>
              )} />
          </Card>
        );
      }
      case "contact": {
        const c = v as Sections["contact"];
        return (
          <Card title="Kontak" description="Alamat email, nomor, dan profil diatur di Pengaturan situs.">
            <LField label="Kalimat penutup" value={c.title} onChange={(x) => set({ title: x } as never)} multiline rows={2} />
            <LField label="Tombol WhatsApp besar" value={c.button} onChange={(x) => set({ button: x } as never)} />
            <div className="adm-grid-2">
              <LField label="Label email" value={c.labels.email} onChange={(x) => set({ labels: { ...c.labels, email: x } } as never)} />
              <LField label="Label WhatsApp" value={c.labels.whatsapp} onChange={(x) => set({ labels: { ...c.labels, whatsapp: x } } as never)} />
              <LField label="Label LinkedIn" value={c.labels.linkedin} onChange={(x) => set({ labels: { ...c.labels, linkedin: x } } as never)} />
              <LField label="Label GitHub" value={c.labels.github} onChange={(x) => set({ labels: { ...c.labels, github: x } } as never)} />
            </div>
          </Card>
        );
      }
    }
  })();

  const anchor: Record<SectionKey, string> = { hero: "", works: "#karya", services: "#layanan", process: "#cara-kerja", testimonials: "#testimoni", about: "#tentang", faq: "#faq", contact: "#kontak" };
  return (
    <>
      {body}
      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast} viewHref={`/${anchor[sectionKey]}`} />
    </>
  );
}
