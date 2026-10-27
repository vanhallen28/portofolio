import Link from "next/link";
import type { Content, Lang } from "@/lib/content/types";
import { homePath, t } from "@/lib/i18n";
import { anchor, initials, lineColorCss, waLink } from "@/lib/site";
import { ui } from "@/lib/ui";

type Props = {
  content: Content;
  lang: Lang;
  /** Same page in Indonesian and English. */
  idHref: string;
  enHref: string;
  onHome: boolean;
  children: React.ReactNode;
};

/** Notice bar, header, mobile menu and footer shared by every public page. */
export function SiteShell({ content, lang, idHref, enHref, onHome, children }: Props) {
  const s = content.settings;
  const nav = s.ui.nav;
  const visible = content.sections;
  const links = [
    { id: "karya", label: t(nav.works, lang), show: true },
    { id: "layanan", label: t(nav.services, lang), show: visible.services.visible && visible.services.items.length > 0 },
    { id: "cara-kerja", label: t(nav.process, lang), show: visible.process.visible && visible.process.steps.length > 0 },
    { id: "tentang", label: t(nav.about, lang), show: visible.about.visible },
  ].filter((l) => l.show);
  const wa = waLink(s, lang);
  const year = new Date().getFullYear();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: lineColorCss(content.lines) }} />
      <a className="skip" href="#isi">{t(s.ui.skip, lang)}</a>
      {s.showNotice && t(s.notice, lang) ? (
        <div className="notice" role="note">{t(s.notice, lang)}</div>
      ) : null}

      <header className="site-head" id="atas">
        <Link className="brand" href={homePath(lang)} aria-label={ui(lang).homeLabel(s.name)}>
          <span className="brand-mark" aria-hidden="true">{initials(s.name)}</span>
          <span className="brand-name">{s.name}</span>
        </Link>
        <nav className="nav" aria-label={ui(lang).mainNav}>
          {links.map((l) => (
            <a key={l.id} href={anchor(lang, onHome, l.id)}>{l.label}</a>
          ))}
        </nav>
        <div className="head-actions">
          <div className="lang" role="group" aria-label={ui(lang).language}>
            <a href={idHref} hrefLang="id" lang="id" aria-current={lang === "id" ? "true" : undefined}>ID</a>
            <a href={enHref} hrefLang="en" lang="en" aria-current={lang === "en" ? "true" : undefined}>EN</a>
          </div>
          <a className="btn btn-small head-wa" href={wa} target="_blank" rel="noopener">{t(s.ui.whatsappButton, lang)}</a>
          <button type="button" className="menu-btn" aria-expanded="false" aria-controls="mnav">
            <span className="menu-ico" aria-hidden="true"><i></i><i></i></span>
            <span className="sr-only">{t(s.ui.menu, lang)}</span>
          </button>
        </div>
        <div className="progress" aria-hidden="true"><i></i></div>
      </header>

      <nav className="mnav" id="mnav" aria-label={t(s.ui.menu, lang)} hidden>
        <ul>
          {links.map((l) => (
            <li key={l.id}><a href={anchor(lang, onHome, l.id)}>{l.label}</a></li>
          ))}
          <li><a href={anchor(lang, onHome, "kontak")}>{t(nav.contact, lang)}</a></li>
        </ul>
        <a className="btn btn-big" href={wa} target="_blank" rel="noopener">{t(content.sections.contact.button, lang)}</a>
      </nav>

      {children}

      <footer className="site-foot">
        <p>© {year} {s.name}</p>
        {t(s.footer, lang) ? <p>{t(s.footer, lang)}</p> : null}
        <a href="#atas">{t(s.ui.backToTop, lang)}</a>
      </footer>
    </>
  );
}
