import { Fragment, type CSSProperties } from "react";
import type { Content, Lang } from "@/lib/content/types";
import { FONT_FAMILY, FONT_WEIGHT } from "@/lib/font-family";
import { t } from "@/lib/i18n";
import { roomId, waLink } from "@/lib/site";
import { TransitMap } from "./TransitMap";

/** Hero as a poster: display caps with an italic phrase, the business loop drawn over them,
    then the lede, the two buttons and a round badge into the work. */
export function Hero({ content, lang }: { content: Content; lang: Lang }) {
  const h = content.sections.hero;
  const s = content.settings;
  const top = t(h.display.top, lang);
  const italic = t(h.display.italic, lang);
  const bottom = t(h.display.bottom, lang);
  const poster = !!(top || bottom);
  const offer = t(h.offer, lang);
  const cut = offer.indexOf(":");
  const rooms = content.projects.length;
  const badge = t(h.badge, lang).replace(/\{n\}/g, String(rooms));
  return (
    <section className={poster ? "hero" : "hero hero-plain"} aria-labelledby="hero-title">
      <div className="hero-top">
        <div>
          {s.availability.show && t(s.availability.text, lang) ? <p className="avail">{t(s.availability.text, lang)}</p> : null}
          <p className="hero-role">{t(h.role, lang)}</p>
        </div>
        {offer ? (
          <p className="hero-offer">
            {cut > 0 ? <><span>{offer.slice(0, cut + 1)}</span> {offer.slice(cut + 1).trim()}</> : offer}
          </p>
        ) : null}
      </div>
      <div className="hero-stage">
        <h1 id="hero-title">
          {poster ? (
            <>
              <span className="sr-only">{t(h.title, lang)}</span>
              <span className="hero-big" aria-hidden="true">
                <span className="hb-l1">
                  {top ? <span className="hb-cap">{top}</span> : null}
                  {italic ? <span className="hb-it">{italic}</span> : null}
                </span>
                {bottom ? (
                  <span className="hb-l2 hb-cap">
                    {bottom.trim().split(/\s+/).map((w, i) => <Fragment key={i}>{i ? " " : null}<span className="hb-w">{w}</span></Fragment>)}
                  </span>
                ) : null}
              </span>
            </>
          ) : t(h.title, lang)}
        </h1>
        <TransitMap content={content} lang={lang} />
      </div>
      <div className="hero-foot">
        <div className="hero-copy">
          {t(h.lede, lang) ? <p className="hero-lede">{t(h.lede, lang)}</p> : null}
          <div className="hero-actions">
            <a className="btn" href={waLink(s, lang)} target="_blank" rel="noopener">{t(h.ctaPrimary, lang)}</a>
            <a className="btn btn-quiet" href="#karya">{t(h.ctaSecondary, lang)}</a>
          </div>
        </div>
        {rooms && badge ? (
          <a className="hero-badge" href="#karya" aria-label={t(h.ctaSecondary, lang) || badge}>
            <svg viewBox="0 0 160 160" aria-hidden="true">
              <defs><path id="hero-ring" d="M80 80 m-62 0 a62 62 0 1 1 124 0 a62 62 0 1 1 -124 0" /></defs>
              <g className="ring"><text><textPath href="#hero-ring" textLength="384" lengthAdjust="spacing">{badge} </textPath></text></g>
            </svg>
            <span className="hero-badge-face"><img src="/brand/avatar.webp" alt="" width={92} height={92} decoding="async" /></span>
          </a>
        ) : null}
      </div>
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
