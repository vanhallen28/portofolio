"use client";
import type { SiteSettings } from "@/lib/content/types";
import { saveSettingsAction } from "@/app/admin/actions";
import { SaveBar, useEditor } from "../editor";
import { Card, LField, TextField, Toggle } from "../fields";
import { ImageField } from "../ImageField";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const ed = useEditor(initial, saveSettingsAction);
  const v = ed.value;
  const set = ed.setField;
  const ui = v.ui;
  const setUi = <K extends keyof SiteSettings["ui"]>(k: K, val: SiteSettings["ui"][K]) => ed.setValue((prev) => ({ ...prev, ui: { ...prev.ui, [k]: val } }));
  const waOk = /^\d{8,15}$/.test(v.whatsapp);
  return (
    <>
      <Card title="Identitas" description="Nama dan peran tampil di header, footer, kartu link, dan data untuk Google.">
        <div className="adm-grid-2">
          <TextField label="Nama" value={v.name} onChange={(x) => set("name", x)} max={200} />
          <TextField label="GitHub (username)" value={v.github} onChange={(x) => set("github", x)} placeholder="vanhallen28" />
        </div>
        <LField label="Peran" value={v.role} onChange={(x) => set("role", x)} />
        <ImageField label="Foto profil" value={v.photo} onChange={(x) => set("photo", x)} optional hint="Tampil bulat di bagian Tentang. Pakai foto persegi dengan wajah di tengah." />
      </Card>

      <Card title="Kontak" description="Dipakai semua tombol WhatsApp dan daftar kontak.">
        <div className="adm-grid-2">
          <TextField label="Email" type="email" value={v.email} onChange={(x) => set("email", x)} />
          <TextField label="Nomor WhatsApp" value={v.whatsapp} onChange={(x) => set("whatsapp", x.replace(/[^\d]/g, ""))} invalid={!waOk}
            hint="Format internasional tanpa + dan spasi, mis. 6281332623033" mono />
          <TextField label="Nomor yang ditampilkan" value={v.whatsappDisplay} onChange={(x) => set("whatsappDisplay", x)} placeholder="0813 3262 3033" />
          <TextField label="LinkedIn (URL)" value={v.linkedin} onChange={(x) => set("linkedin", x)} mono />
          <TextField label="Teks link LinkedIn" value={v.linkedinLabel} onChange={(x) => set("linkedinLabel", x)} />
        </div>
        <LField label="Pesan pembuka WhatsApp" value={v.whatsappMessage} onChange={(x) => set("whatsappMessage", x)} multiline rows={2}
          hint="Terisi otomatis saat pengunjung menekan tombol WhatsApp." />
      </Card>

      <Card title="Bilah info & ketersediaan">
        <Toggle label="Tampilkan bilah info di atas halaman" checked={v.showNotice} onChange={(x) => set("showNotice", x)} hint="Untuk pengumuman singkat, mis. libur atau promo." />
        {v.showNotice ? <LField label="Isi bilah info" value={v.notice} onChange={(x) => set("notice", x)} max={200} /> : null}
        <Toggle label="Tampilkan status ketersediaan di hero" checked={v.availability.show} onChange={(x) => set("availability", { ...v.availability, show: x })} />
        {v.availability.show ? <LField label="Teks ketersediaan" value={v.availability.text} onChange={(x) => set("availability", { ...v.availability, text: x })} max={80} /> : null}
      </Card>

      <Card title="SEO & kartu link" description="Judul dan deskripsi yang muncul di Google dan saat link dibagikan di WhatsApp atau LinkedIn.">
        <LField label="Judul halaman" value={v.seoTitle} onChange={(x) => set("seoTitle", x)} max={70} hint="Idealnya di bawah 60 karakter." />
        <LField label="Deskripsi" value={v.seoDescription} onChange={(x) => set("seoDescription", x)} multiline rows={3} max={200} hint="Idealnya 120–160 karakter." />
        <LField label="Teks footer" value={v.footer} onChange={(x) => set("footer", x)} />
      </Card>

      <Card title="Teks antarmuka" description="Label kecil di header, menu, dan footer.">
        <div className="adm-grid-2">
          <LField label="Menu: Karya" value={ui.nav.works} onChange={(x) => setUi("nav", { ...ui.nav, works: x })} />
          <LField label="Menu: Layanan" value={ui.nav.services} onChange={(x) => setUi("nav", { ...ui.nav, services: x })} />
          <LField label="Menu: Cara kerja" value={ui.nav.process} onChange={(x) => setUi("nav", { ...ui.nav, process: x })} />
          <LField label="Menu: Tentang" value={ui.nav.about} onChange={(x) => setUi("nav", { ...ui.nav, about: x })} />
          <LField label="Menu: Kontak" value={ui.nav.contact} onChange={(x) => setUi("nav", { ...ui.nav, contact: x })} />
          <LField label="Tombol WhatsApp di header" value={ui.whatsappButton} onChange={(x) => setUi("whatsappButton", x)} />
          <LField label="Tombol menu (HP)" value={ui.menu} onChange={(x) => setUi("menu", x)} />
          <LField label="Kembali ke atas" value={ui.backToTop} onChange={(x) => setUi("backToTop", x)} />
          <LField label="Lewati ke isi (untuk keyboard)" value={ui.skip} onChange={(x) => setUi("skip", x)} />
        </div>
      </Card>

      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast} viewHref="/" />
    </>
  );
}
