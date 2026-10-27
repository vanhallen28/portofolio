import { AdminNav, type NavItem } from "@/components/admin/AdminNav";
import { AdminProvider } from "@/components/admin/context";
import { requireAdmin } from "@/lib/admin/auth";
import { getStore } from "@/lib/content/get";
import { backend } from "@/lib/env";
import { logoutAction } from "../login/actions";

export const dynamic = "force-dynamic";

const MODE_LABEL = { supabase: "Supabase", local: "Mode lokal", seed: "Belum terhubung" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const content = await (await getStore()).read();
  const mode = backend();
  const items: NavItem[] = [
    { href: "/admin", label: "Ringkasan" },
    { href: "/admin/settings", label: "Pengaturan situs" },
    { href: "/admin/sections/hero", label: "Hero & denah", group: "Beranda" },
    { href: "/admin/sections/works", label: "Karya (teks)", group: "Beranda" },
    { href: "/admin/sections/services", label: "Layanan", group: "Beranda" },
    { href: "/admin/sections/process", label: "Cara kerja", group: "Beranda" },
    { href: "/admin/sections/testimonials", label: "Testimoni", group: "Beranda" },
    { href: "/admin/sections/about", label: "Tentang", group: "Beranda" },
    { href: "/admin/sections/faq", label: "FAQ", group: "Beranda" },
    { href: "/admin/sections/contact", label: "Kontak", group: "Beranda" },
    { href: "/admin/lines", label: "Jalur & warna", group: "Beranda" },
    { href: "/admin/projects", label: "Semua proyek", group: "Proyek" },
    ...[...content.projects].sort((a, b) => a.sort - b.sort).map((p) => ({ href: `/admin/projects/${p.id}`, label: p.name, group: "Proyek", dot: p.theme.wall })),
  ];
  return (
    <AdminProvider value={{ mode, projects: content.projects.map((p) => ({ slug: p.slug, name: p.name })) }}>
      <div className="adm-shell">
        <aside className="adm-side">
          <a className="adm-brand" href="/admin">
            <b>VL</b>
            <span>Admin portofolio<small>{content.settings.name}</small></span>
          </a>
          <AdminNav items={items} />
          <div className="adm-side-foot">
            <span className="adm-mode" data-mode={mode}>{MODE_LABEL[mode]}</span>
            <p>{admin.email}</p>
            <a className="adm-btn adm-btn-small" href="/" target="_blank" rel="noopener">Lihat situs ↗</a>
            <form action={logoutAction}><button className="adm-btn adm-btn-small adm-btn-ghost adm-btn-block" type="submit">Keluar</button></form>
          </div>
        </aside>
        <main className="adm-main" id="isi">{children}</main>
      </div>
    </AdminProvider>
  );
}
