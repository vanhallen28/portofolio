import Link from "next/link";
import { Kpi, VitalsGrid } from "@/components/admin/stats/parts";
import { getStore } from "@/lib/content/get";
import { SupabaseStore } from "@/lib/content/supabase-store";
import { backend, siteUrl } from "@/lib/env";
import { addDays, previousRange, wibDay } from "@/lib/stats/classify";
import { pct } from "@/lib/stats/labels";
import { readStats } from "@/lib/stats/store";

export const metadata = { title: "Ringkasan" };

export default async function Dashboard() {
  const store = await getStore();
  const c = await store.read();
  const problems = store instanceof SupabaseStore ? store.problems : [];
  const projects = [...c.projects].sort((a, b) => a.sort - b.sort);
  const live = projects.filter((p) => p.published).length;
  const cases = new Map(c.caseStudies.map((cs) => [cs.projectSlug, cs]));
  const s = c.sections;
  /* visits of the last 7 days and real-visitor performance of the last 28 (like Google's report) */
  const today = wibDay();
  const week = { from: addDays(today, -6), to: today }, month = { from: addDays(today, -27), to: today };
  const db = backend() === "supabase" ? await (await import("@/lib/supabase/server")).createServerSupabase() : undefined;
  const [w, wBefore, m] = await Promise.all([readStats(week, db), readStats(previousRange(week), db), readStats(month, db)]);
  const tiles = [
    { href: "/admin/settings", title: "Pengaturan situs", text: "Kontak, foto profil, SEO, bilah info" },
    { href: "/admin/sections/hero", title: "Hero & denah", text: "Judul besar, tombol, teks denah" },
    { href: "/admin/sections/works", title: "Karya (teks)", text: "Judul, pengantar, label tombol ruang" },
    { href: "/admin/sections/services", title: "Layanan", text: s.services.visible ? `${s.services.items.length} layanan` : "Disembunyikan" },
    { href: "/admin/sections/process", title: "Cara kerja", text: s.process.visible ? `${s.process.steps.length} langkah` : "Disembunyikan" },
    { href: "/admin/sections/testimonials", title: "Testimoni", text: s.testimonials.visible && s.testimonials.items.length ? `${s.testimonials.items.length} testimoni` : "Belum tampil" },
    { href: "/admin/sections/about", title: "Tentang", text: "Cerita singkat dan keahlian" },
    { href: "/admin/sections/faq", title: "FAQ", text: s.faq.visible && s.faq.items.length ? `${s.faq.items.length} tanya-jawab` : "Belum tampil" },
    { href: "/admin/sections/contact", title: "Kontak", text: "Ajakan penutup dan label" },
    { href: "/admin/lines", title: "Jalur & warna", text: c.lines.map((l) => l.name.id).join(", ") },
  ];
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Ringkasan</h1>
          <p>{live} dari {projects.length} proyek tayang. Setiap simpan langsung tampil di situs.</p>
        </div>
        <div className="adm-head-actions">
          <a className="adm-btn" href="/" target="_blank" rel="noopener">Buka situs ↗</a>
          <Link className="adm-btn adm-btn-primary" href="/admin/projects">Kelola proyek</Link>
        </div>
      </div>
      {backend() === "local" ? (
        <div className="adm-problems"><b>Mode lokal.</b> Isi disimpan di file <code>.data/content.json</code> di komputer ini, bukan di Supabase.</div>
      ) : null}
      {problems.length ? (
        <div className="adm-problems" role="alert">
          <b>Ada data yang tidak valid di database</b>, jadi bagian itu sementara memakai isi awal:
          <ul>{problems.slice(0, 10).map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      ) : null}
      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Kunjungan 7 hari terakhir</h2><p>Dibanding 7 hari sebelumnya.</p></div>
          <Link className="adm-btn adm-btn-small" href="/admin/stats">Statistik lengkap</Link>
        </div>
        {w.ok ? (
          <div className="st-kpis is-inline">
            <Kpi label="Kunjungan halaman" value={w.stats.views} before={wBefore.ok ? wBefore.stats.views : undefined} />
            <Kpi label="Pengunjung" value={w.stats.visitors} before={wBefore.ok ? wBefore.stats.visitors : undefined} />
            <Kpi label="Klik WhatsApp" value={w.stats.wa} before={wBefore.ok ? wBefore.stats.wa : undefined} hint={w.stats.visitors ? `${pct(w.stats.wa, w.stats.visitors)} dari pengunjung` : undefined} />
            <Kpi label="Preview dibuka" value={w.stats.previews} before={wBefore.ok ? wBefore.stats.previews : undefined} />
          </div>
        ) : (
          <p className="st-empty">{w.reason === "missing" ? <>Statistik belum aktif: jalankan <code>supabase/migrations/0002_stats.sql</code> di Supabase (lihat <Link href="/admin/stats">Statistik kunjungan</Link>).</> : "Statistik belum tersedia."}</p>
        )}
      </section>
      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Performa web</h2><p>28 hari terakhir, diukur di browser pengunjung sungguhan. Nilai yang dicapai 75% kunjungan.</p></div>
          <a className="adm-btn adm-btn-small" href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(siteUrl())}`} target="_blank" rel="noopener">Uji di PageSpeed ↗</a>
        </div>
        {m.ok ? <VitalsGrid vitals={m.vitals} /> : <p className="st-empty">Performa web tampil setelah statistik aktif.</p>}
      </section>
      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Beranda</h2><p>Teks setiap bagian, dalam Bahasa Indonesia dan English.</p></div></div>
        <div className="adm-tiles">
          {tiles.map((t) => <Link key={t.href} className="adm-tile" href={t.href}><b>{t.title}</b><span>{t.text}</span></Link>)}
        </div>
      </section>
      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Proyek</h2><p>Ruang pamer di beranda, sesuai urutan.</p></div>
          <Link className="adm-btn adm-btn-small" href="/admin/projects">Atur urutan</Link>
        </div>
        <div className="adm-rows">
          {projects.map((p, i) => {
            const cs = cases.get(p.slug);
            return (
              <div className="adm-row" key={p.id}>
                <span className="adm-row-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="adm-swatch" style={{ background: p.theme.wall, color: p.theme.ink }}>{p.name.slice(0, 1)}</span>
                <div className="adm-row-main">
                  <Link href={`/admin/projects/${p.id}`}>{p.name}</Link>
                  <p>{p.meta.id}</p>
                </div>
                <div className="adm-row-tools">
                  <span className={`adm-pill${p.published ? " is-on" : ""}`}>{p.published ? "Tayang" : "Draf"}</span>
                  <Link className={`adm-pill${cs?.published ? " is-on" : cs ? " is-warn" : ""}`} href={`/admin/projects/${p.id}/case`}>
                    Studi kasus: {cs ? (cs.published ? "tayang" : "draf") : "belum ada"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
