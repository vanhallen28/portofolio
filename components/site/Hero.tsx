import type { CSSProperties } from "react";
import type { Content, Lang } from "@/lib/content/types";
import { FONT_FAMILY, FONT_WEIGHT } from "@/lib/font-family";
import { t } from "@/lib/i18n";
import { roomId, waLink } from "@/lib/site";
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

/** Row of client wordmarks, each set in the client's own brand font. */
export function Clients({ content, lang }: { content: Content; lang: Lang }) {
  const c = content.sections.hero.clients;
  if (!c.visible || !c.items.length) return null;
  const live = new Set(content.projects.map((p) => p.slug));
  return (
    <section className="clients" aria-labelledby="clients-title">
      <p className="clients-title" id="clients-title">{t(c.title, lang)}</p>
      <ul className="clients-list">
        {c.items.map((it, i) => {
          const style = { fontFamily: FONT_FAMILY[it.font], fontWeight: FONT_WEIGHT[it.font], textTransform: it.uppercase ? "uppercase" : "none", letterSpacing: it.uppercase ? "0.08em" : undefined } as CSSProperties;
          return (
            <li key={i}>
              {it.projectSlug && live.has(it.projectSlug) ? (
                <a href={`#${roomId(it.projectSlug)}`} style={style}>{it.name}</a>
              ) : (
                <span style={style}>{it.name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
