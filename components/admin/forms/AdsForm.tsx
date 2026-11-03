"use client";
import type { SiteSettings } from "@/lib/content/types";
import { saveSettingsAction } from "@/app/admin/actions";
import { adsTxtLine, installedCode } from "@/lib/ads";
import { SaveBar, useEditor } from "../editor";
import { Card, TextField } from "../fields";

/* Admin → Kode iklan: Meta Pixel and Google AdSense. Only the IDs are typed in; the official code is
   generated from them, so a typo cannot break the site. Saved with the site settings. */

const PIXEL = /^\d{10,20}$/;
const ADSENSE = /^ca-pub-\d{10,20}$/;

/** Accept what people paste: a whole snippet, "pub-…", spaces. Keep only the ID. */
function cleanPixel(v: string) {
  const m = /fbq\(\s*['"]init['"]\s*,\s*['"](\d{10,20})/.exec(v) ?? /[?&]id=(\d{10,20})/.exec(v);
  return m ? m[1] : v.replace(/[^\d]/g, "");
}
function cleanAdsense(v: string) {
  const m = /(?:ca-)?pub-(\d{10,20})/.exec(v);
  return m ? `ca-pub-${m[1]}` : v.trim();
}

export function AdsForm({ initial, site }: { initial: SiteSettings; site: string }) {
  const ed = useEditor(initial, saveSettingsAction);
  const ads = ed.value.ads;
  const setAds = (k: keyof SiteSettings["ads"], v: string) => ed.setValue((prev) => ({ ...prev, ads: { ...prev.ads, [k]: v } }));
  const pixelBad = !!ads.metaPixelId && !PIXEL.test(ads.metaPixelId);
  const adsBad = !!ads.adsenseClient && !ADSENSE.test(ads.adsenseClient);
  const root = (() => { try { const h = new URL(site).hostname.split("."); return h.length > 2 ? h.slice(-2).join(".") : ""; } catch { return ""; } })();
  const code = installedCode(ads);
  return (
    <>
      <Card title="Meta Pixel (Facebook & Instagram Ads)"
        description="Mencatat kunjungan untuk iklan Facebook dan Instagram: membuat audiens, retargeting, dan mengukur hasil iklan.">
        <TextField label="Pixel ID" value={ads.metaPixelId} onChange={(v) => setAds("metaPixelId", cleanPixel(v))} invalid={pixelBad} mono
          placeholder="1234567890123456"
          hint={<>Meta Events Manager → Sumber data → pilih Pixel → angka <b>ID</b>-nya. Boleh tempel seluruh kode Pixel; ID-nya diambil otomatis. Kosongkan untuk mencopot.</>} />
        <ul className="st-list">
          <li><b>PageView</b> tercatat di setiap halaman, termasuk saat pindah halaman di dalam situs.</li>
          <li><b>Contact</b> tercatat setiap kali pengunjung menekan tombol WhatsApp, jadi iklan bisa dioptimalkan untuk chat.</li>
        </ul>
      </Card>

      <Card title="Google AdSense" description="Menampilkan iklan Google di situs. Setelah kodenya terpasang, ajukan situs untuk ditinjau di AdSense.">
        <TextField label="ID penayang" value={ads.adsenseClient} onChange={(v) => setAds("adsenseClient", cleanAdsense(v))} invalid={adsBad} mono
          placeholder="ca-pub-1234567890123456"
          hint={<>AdSense → Akun → Informasi akun → <b>ID penayang</b> (pub-…). Boleh tempel seluruh kode AdSense; ID-nya diambil otomatis. Kosongkan untuk mencopot.</>} />
        <ul className="st-list">
          <li>Kode AdSense dan tag verifikasi dipasang di &lt;head&gt; setiap halaman. Penempatan iklan diatur dari AdSense → Iklan → <b>Iklan otomatis</b>.</li>
          <li><b>ads.txt</b> dibuat otomatis di <a href="/ads.txt" target="_blank" rel="noopener">/ads.txt</a> setelah disimpan{ads.adsenseClient && !adsBad ? <>: <code>{adsTxtLine(ads.adsenseClient)}</code></> : "."}</li>
          {root ? (
            <li>Situs ini subdomain dari <b>{root}</b>. Di AdSense, daftarkan situs <b>{root}</b>; Google membaca ads.txt di domain utamanya. Bila {root} belum punya situs, tambahkan {root} di Vercel → Settings → Domains lalu arahkan (redirect) ke alamat portofolio ini, supaya {root}/ads.txt ikut terbaca.</li>
          ) : null}
        </ul>
      </Card>

      <Card title="Kode yang terpasang" description="Disisipkan otomatis di setiap halaman situs (bukan di admin dan bukan di file preview proyek).">
        {code ? <pre className="st-code">{code}</pre> : <p className="st-empty">Belum ada kode iklan yang terpasang.</p>}
      </Card>

      <SaveBar dirty={ed.dirty} pending={ed.pending} onSave={ed.save} onReset={ed.reset} toast={ed.toast} onCloseToast={ed.closeToast} viewHref="/" />
    </>
  );
}
