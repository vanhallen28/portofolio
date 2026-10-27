import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteScript } from "@/components/motion/SiteScript";
import type { Block, CaseStudy, Content, Img, Lang, Project } from "@/lib/content/types";
import { luminance } from "@/lib/contrast";
import { FONT_FAMILY } from "@/lib/font-family";
import { homePath, t, workPath } from "@/lib/i18n";
import { caseHref, hostOf, lineMap, roomId } from "@/lib/site";
import { ui } from "@/lib/ui";
import { NewTabIcon } from "./Room";
import { SiteShell } from "./SiteShell";

type Props = { content: Content; lang: Lang; project: Project; study: CaseStudy };

function Shot({ img, lang, phone }: { img: Img; lang: Lang; phone?: boolean }) {
  return (
    <figure className={phone ? "shot shot-phone" : "shot shot-desk"}>
      <img src={img.url} width={img.width} height={img.height} loading="lazy" decoding="async" alt={t(img.alt, lang)} />
    </figure>
  );
}

function BlockView({ block: b, lang }: { block: Block; lang: Lang }) {
  const title = <h2>{t(b.title, lang)}</h2>;
  switch (b.type) {
    case "prose":
      return (
        <section className="case-block">
          {title}
          <div className="case-prose">{b.paragraphs.map((p, i) => (t(p, lang) ? <p key={i}>{t(p, lang)}</p> : null))}</div>
        </section>
      );
    case "features":
      return (
        <section className="case-block">
          {title}
          <div className="doors">
            {b.items.map((it, i) => {
              const phones = it.images.filter((im) => im.height > im.width * 1.3);
              const desks = it.images.filter((im) => !phones.includes(im));
              return (
                <div key={i} className="door">
                  <h3>{t(it.title, lang)}</h3>
                  <p>{t(it.text, lang)}</p>
                  {desks.map((im, k) => <Shot key={k} img={im} lang={lang} />)}
                  {phones.length ? <div className="phones">{phones.map((im, k) => <Shot key={k} img={im} lang={lang} phone />)}</div> : null}
                </div>
              );
            })}
          </div>
        </section>
      );
    case "flow":
      return (
        <section className="case-block">
          {title}
          <ol className="flow" style={{ "--n": b.steps.length } as CSSProperties}>
            {b.steps.map((s, i) => <li key={i}>{t(s, lang)}</li>)}
          </ol>
        </section>
      );
    case "decisions":
      return (
        <section className="case-block">
          {title}
          <ul className="decisions">
            {b.items.map((it, i) => (
              <li key={i}><h3>{t(it.title, lang)}</h3><p>{t(it.text, lang)}</p></li>
            ))}
          </ul>
        </section>
      );
    case "results":
      return (
        <section className="case-block case-results">
          {title}
          <ul className="results">
            {b.items.map((it, i) => (
              <li key={i}>
                <p className="res-fig">
                  {it.before ? (
                    <>
                      <span className="sr-only">{ui(lang).before} </span>
                      <span className="res-before">{it.before}</span>
                      <span className="res-arrow" aria-hidden="true">→</span>
                      <span className="sr-only"> {ui(lang).after} </span>
                    </>
                  ) : null}
                  <span className="res-after">{it.after}</span>
                </p>
                <p className="res-label">{t(it.label, lang)}</p>
              </li>
            ))}
          </ul>
        </section>
      );
    case "numbers":
      return (
        <section className="case-block case-numbers">
          {title}
          <dl className="facts facts-wide">
            {b.facts.map((f, i) => <div key={i}><dt>{f.value}</dt><dd>{t(f.label, lang)}</dd></div>)}
          </dl>
          {t(b.stack, lang) ? <p className="stack">{t(b.stack, lang)}</p> : null}
        </section>
      );
  }
}

/** Theme of the case page, applied before paint (no flash, works without JavaScript). */
function themeCss(study: CaseStudy): string {
  const th = study.theme;
  if (!th) return "";
  const scheme = luminance(th.wall) < 0.2 ? "dark" : "light"; // scrollbars and form controls match the wall
  return `:root{--wall:${th.wall};--chrome:${th.wall};--ink:${th.ink};--muted:${th.muted};--accent:${th.accent};--btn-bg:${th.btnBg};--btn-ink:${th.btnInk};color-scheme:${scheme}}`;
}

export function CaseStudyPage({ content, lang, project: p, study }: Props) {
  const w = content.sections.works;
  const labels = w.caseLabels;
  const lines = lineMap(content.lines);
  const i = content.projects.findIndex((x) => x.id === p.id);
  const next = content.projects.length > 1 ? content.projects[(i + 1) % content.projects.length] : null;
  const nextHref = next ? caseHref(content, next.slug, lang) ?? `${homePath(lang)}#${roomId(next.slug)}` : null;
  const font = {
    "--case-font": FONT_FAMILY[p.titleFont],
    "--case-weight": p.titleStyle.weight,
    "--case-case": p.titleStyle.uppercase ? "uppercase" : "none",
    "--case-track": `${p.titleStyle.tracking}em`,
  } as CSSProperties;

  return (
    <SiteShell content={content} lang={lang} idHref={workPath("id", p.slug)} enHref={workPath("en", p.slug)} onHome={false}>
      {study.theme ? <style dangerouslySetInnerHTML={{ __html: themeCss(study) }} /> : null}
      <main id="isi" className="view view-case" data-view="case" style={font}>
        <article className="case">
          <nav className="crumb" aria-label={ui(lang).breadcrumb}>
            <Link href={`${homePath(lang)}#karya`}>{t(w.title, lang)}</Link> <span aria-hidden="true">/</span> <span>{p.name}</span>
          </nav>

          <header className="case-hero">
            <h1 className="case-title" tabIndex={-1}>{p.name}</h1>
            {t(study.subtitle, lang) ? <p className="case-sub">{t(study.subtitle, lang)}</p> : null}
            {p.previewUrl || p.liveUrl ? (
              <div className="case-actions">
                {p.previewUrl ? (
                  <a className="btn" href={p.previewUrl} target="_blank" rel="noopener" data-preview>
                    {t(w.previewCta, lang)}<NewTabIcon /><span className="sr-only"> ({t(w.newTab, lang)})</span>
                  </a>
                ) : (
                  <a className="btn" href={p.liveUrl} target="_blank" rel="noopener">
                    {t(w.visitCta, lang)}<NewTabIcon /><span className="sr-only"> ({t(w.newTab, lang)})</span>
                  </a>
                )}
              </div>
            ) : null}
            <dl className="case-label">
              {study.labels.client ? <div><dt>{t(labels.client, lang)}</dt><dd>{study.labels.client}</dd></div> : null}
              {t(study.labels.field, lang) ? <div><dt>{t(labels.field, lang)}</dt><dd>{t(study.labels.field, lang)}</dd></div> : null}
              {t(study.labels.role, lang) ? <div><dt>{t(labels.role, lang)}</dt><dd>{t(study.labels.role, lang)}</dd></div> : null}
              {study.labels.year ? <div><dt>{t(labels.year, lang)}</dt><dd>{study.labels.year}</dd></div> : null}
              <div>
                <dt>{t(labels.lines, lang)}</dt>
                <dd>{p.lines.map((k, n) => <span key={k}>{n ? ", " : ""}<i className="ldot" data-line={k}></i>{t(lines[k]?.name, lang)}</span>)}</dd>
              </div>
              {p.liveUrl ? (
                <div><dt>{t(labels.site, lang)}</dt><dd><a href={p.liveUrl} target="_blank" rel="noopener">{p.liveLabel || hostOf(p.liveUrl)}</a></dd></div>
              ) : null}
            </dl>
            {study.cover ? (
              <figure className="case-cover">
                <img src={study.cover.url} width={study.cover.width} height={study.cover.height} decoding="async" alt={t(study.cover.alt, lang)} />
              </figure>
            ) : null}
          </header>

          {study.blocks.map((b, k) => <BlockView key={k} block={b} lang={lang} />)}

          {next && nextHref ? (
            <Link
              className="next-room" href={nextHref}
              style={{
                "--nr-wall": next.theme.wall, "--nr-ink": next.theme.ink, "--nr-font": FONT_FAMILY[next.titleFont],
                "--nr-weight": next.titleStyle.weight, "--nr-case": next.titleStyle.uppercase ? "uppercase" : "none", "--nr-track": `${next.titleStyle.tracking}em`,
              } as CSSProperties}
            >
              <span className="nr-k">{t(w.nextRoom, lang)}</span>
              <span className="nr-t">{next.name}</span>
            </Link>
          ) : null}
        </article>
      </main>
      <SiteScript page="case" />
    </SiteShell>
  );
}
