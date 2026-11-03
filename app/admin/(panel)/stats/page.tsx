import { NoTrack } from "@/components/admin/stats/NoTrack";
import { DayChart, Kpi, Ranked, VitalsGrid } from "@/components/admin/stats/parts";
import { RangePicker } from "@/components/admin/stats/RangePicker";
import { getStore } from "@/lib/content/get";
import { backend, siteUrl } from "@/lib/env";
import { withAllDays } from "@/lib/stats/aggregate";
import { parseRange, previousRange, wibDay } from "@/lib/stats/classify";
import { countryLabel, DEVICE_LABEL, flag, LANG_LABEL, num, pageLabel, pct, rangeLabel, sourceLabel } from "@/lib/stats/labels";
import { readStats } from "@/lib/stats/store";

export const metadata = { title: "Statistik kunjungan" };

async function adminDb() {
  if (backend() !== "supabase") return undefined;
  const { createServerSupabase } = await import("@/lib/supabase/server");
  return createServerSupabase();
}

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const today = wibDay();
  const r = parseRange(sp.from, sp.to, today);
  const prev = previousRange(r);
  const db = await adminDb();
  const [cur, before, content] = await Promise.all([readStats(r, db), readStats(prev, db), (await getStore()).read()]);
  const names = Object.fromEntries(content.projects.map((p) => [p.slug, p.name]));
  const head = (
    <div className="adm-head">
      <div>
        <h1>Statistik kunjungan</h1>
        <p>Tanpa cookie dan tanpa menyimpan alamat IP. Tanggal dalam WIB.</p>
      </div>
      <div className="adm-head-actions"><RangePicker from={r.from} to={r.to} today={today} /></div>
    </div>
  );

  if (!cur.ok) {
    return (
      <>
        {head}
        <section className="adm-card">
          {cur.reason === "missing" ? (
            <>
              <div className="adm-card-head"><div><h2>Satu langkah lagi: buat tabel statistik</h2><p>Statistik disimpan di Supabase, di dua tabel baru.</p></div></div>
              <ol className="st-steps">
                <li>Di Terminal, di folder proyek: <code>pbcopy &lt; supabase/migrations/0002_stats.sql</code></li>
                <li>Supabase → SQL Editor → New query, tempel (Cmd+V), lalu Run. Hasilnya “Success. No rows returned”.</li>
                <li>Muat ulang halaman ini. Kunjungan mulai tercatat sejak saat itu.</li>
              </ol>
            </>
          ) : cur.reason === "off" ? (
            <p>Statistik butuh database. Hubungkan Supabase (README langkah 5–6), lalu deploy ulang.</p>
          ) : (
            <p role="alert">Statistik tidak bisa dibaca: {cur.message}. Coba muat ulang; bila terus terjadi, jalankan <code>npm run doctor</code>.</p>
          )}
        </section>
      </>
    );
  }

  const s = cur.stats, b = before.ok ? before.stats : null;
  const entries = s.sources.filter((x) => x.key !== "internal");
  const internal = s.sources.find((x) => x.key === "internal")?.n ?? 0;
  const q = `from=${r.from}&to=${r.to}`;
  return (
    <>
      {head}
      <section className="st-kpis" aria-label={`Ringkasan ${rangeLabel(r.from, r.to)}`}>
        <Kpi label="Kunjungan halaman" value={s.views} before={b?.views} />
        <Kpi label="Pengunjung" value={s.visitors} before={b?.visitors} hint="dihitung per hari" />
        <Kpi label="Klik WhatsApp" value={s.wa} before={b?.wa} hint={s.visitors ? `${pct(s.wa, s.visitors)} dari pengunjung` : undefined} />
        <Kpi label="Preview dibuka" value={s.previews} before={b?.previews} />
      </section>

      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Per hari</h2><p>{rangeLabel(r.from, r.to)}. Angka kecil di kartu atas dibanding {rangeLabel(prev.from, prev.to)}.</p></div>
        </div>
        <DayChart days={withAllDays(s, r)} />
      </section>

      <div className="st-two">
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Sumber</h2><p>Dari mana pengunjung datang (halaman pertama yang dibuka).</p></div></div>
          <Ranked items={entries} label={sourceLabel} />
          <p className="st-note">“Langsung” = mengetik alamat, bookmark, atau membuka link dari aplikasi chat seperti WhatsApp (yang tidak mengirim asal). Untuk link iklan atau bio, tambahkan <code>?utm_source=instagram</code> di ujung alamat agar tercatat tepat.{internal ? ` Selain itu ${num(internal)} kali pindah halaman di dalam situs.` : ""}</p>
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Negara</h2><p>Dari lokasi jaringan pengunjung.</p></div></div>
          <Ranked items={s.countries} label={countryLabel} icon={flag} limit={12} />
        </section>
      </div>

      <div className="st-two">
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Halaman</h2><p>Yang paling sering dibuka.</p></div></div>
          <Ranked items={s.pages} label={(k) => pageLabel(k, names)} />
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Perangkat dan bahasa</h2></div></div>
          <Ranked items={s.devices} label={(k) => DEVICE_LABEL[k] ?? k} />
          <div style={{ height: 14 }} />
          <Ranked items={s.langs} label={(k) => LANG_LABEL[k] ?? k} />
        </section>
      </div>

      <div className="st-two">
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Klik WhatsApp per sumber</h2><p>Sumber yang paling banyak menghasilkan chat.</p></div></div>
          <Ranked items={s.waSources} label={sourceLabel} empty="Belum ada klik WhatsApp di periode ini." />
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><div><h2>Preview per proyek</h2><p>Tombol “Preview proyek” yang ditekan.</p></div></div>
          <Ranked items={s.previewProjects} label={(k) => names[k] ?? (k || "Tidak diketahui")} empty="Belum ada preview dibuka di periode ini." />
        </section>
      </div>

      <section className="adm-card">
        <div className="adm-card-head">
          <div><h2>Performa web</h2><p>Diukur di browser pengunjung sungguhan, {rangeLabel(r.from, r.to)}. Nilai yang dicapai 75% kunjungan, seperti cara Google menilai.</p></div>
          <a className="adm-btn adm-btn-small" href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(siteUrl())}`} target="_blank" rel="noopener">Uji di PageSpeed ↗</a>
        </div>
        <VitalsGrid vitals={cur.vitals} />
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Tarik data</h2><p>Semua baris di periode ini, untuk dibuka di Excel atau Google Sheets.</p></div></div>
        <div className="st-downloads">
          <a className="adm-btn" href={`/admin/stats/export?kind=visits&${q}`} download>Unduh kunjungan (CSV)</a>
          <a className="adm-btn" href={`/admin/stats/export?kind=vitals&${q}`} download>Unduh performa (CSV)</a>
        </div>
        <NoTrack />
      </section>
    </>
  );
}
