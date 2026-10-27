import type { Content, Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n";
import { waLink } from "@/lib/site";
import { TransitMap } from "./TransitMap";

export function Hero({ content, lang }: { content: Content; lang: Lang }) {
  const h = content.sections.hero;
  const s = content.settings;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        {s.availability.show && t(s.availability.text, lang) ? <p className="avail">{t(s.availability.text, lang)}</p> : null}
        <p className="hero-role">{t(h.role, lang)}</p>
        <h1 id="hero-title">{t(h.title, lang)}</h1>
        {t(h.lede, lang) ? <p className="hero-lede">{t(h.lede, lang)}</p> : null}
        <div className="hero-actions">
          <a className="btn" href={waLink(s, lang)} target="_blank" rel="noopener">{t(h.ctaPrimary, lang)}</a>
          <a className="btn btn-quiet" href="#karya">{t(h.ctaSecondary, lang)}</a>
        </div>
      </div>
      <TransitMap content={content} lang={lang} />
    </section>
  );
}
