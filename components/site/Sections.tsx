import { Fragment } from "react";
import type { Content, Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n";
import { lineMap, roomId, waLink } from "@/lib/site";

type P = { content: Content; lang: Lang };

export function Services({ content, lang }: P) {
  const s = content.sections.services;
  if (!s.visible || !s.items.length) return null;
  const lines = lineMap(content.lines);
  const bySlug = new Map(content.projects.map((p) => [p.slug, p]));
  return (
    <section className="services" id="layanan" aria-labelledby="svc-title">
      <h2 id="svc-title">{t(s.title, lang)}</h2>
      <ul className="svc-list">
        {s.items.map((item, i) => {
          const proof = item.proof.map((slug) => bySlug.get(slug)).filter((p) => !!p);
          return (
            <li key={i} className="svc" data-line={item.line}>
              <h3><i className="ldot" data-line={item.line}></i>{t(lines[item.line]?.name, lang)}</h3>
              <p>{t(item.text, lang)}</p>
              {proof.length ? (
                <p className="svc-proof">
                  {t(s.proofLabel, lang)}{" "}
                  {proof.map((p, k) => (
                    <Fragment key={p.slug}>
                      {k ? ", " : ""}
                      <a href={`#${roomId(p.slug)}`}>{p.name}</a>
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Process({ content, lang }: P) {
  const s = content.sections.process;
  if (!s.visible || !s.steps.length) return null;
  return (
    <section className="process" id="cara-kerja" aria-labelledby="proc-title">
      <h2 id="proc-title">{t(s.title, lang)}</h2>
      <ol className="steps">
        {s.steps.map((step, i) => (
          <li key={i}>
            <h3>{t(step.title, lang)}</h3>
            <p>{t(step.text, lang)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Testimonials({ content, lang }: P) {
  const s = content.sections.testimonials;
  const items = s.items.filter((q) => t(q.quote, lang));
  if (!s.visible || !items.length) return null;
  const bySlug = new Map(content.projects.map((p) => [p.slug, p]));
  return (
    <section className="testimonials" id="testimoni" aria-labelledby="testi-title">
      <h2 id="testi-title">{t(s.title, lang)}</h2>
      <div className="quotes">
        {items.map((q, i) => {
          const project = bySlug.get(q.projectSlug);
          return (
            <figure key={i} className="quote">
              <blockquote>{t(q.quote, lang)}</blockquote>
              <figcaption>
                <b>{q.name}</b>
                <span>
                  {t(q.role, lang)}
                  {project ? <>{t(q.role, lang) ? ", " : ""}<a href={`#${roomId(project.slug)}`}>{project.name}</a></> : null}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function About({ content, lang }: P) {
  const s = content.sections.about;
  if (!s.visible) return null;
  const photo = content.settings.photo;
  return (
    <section className="about" id="tentang" aria-labelledby="about-title">
      {photo ? (
        <figure className="portrait">
          <img src={photo.url} width={photo.width} height={photo.height} loading="lazy" decoding="async" alt={t(photo.alt, lang)} />
        </figure>
      ) : null}
      <div className="about-copy">
        <h2 id="about-title">{t(s.title, lang)}</h2>
        {s.paragraphs.map((p, i) => (t(p, lang) ? <p key={i}>{t(p, lang)}</p> : null))}
        {s.skills.length ? (
          <ul className="skills">
            {s.skills.map((k, i) => <li key={i}>{t(k, lang)}</li>)}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function Faq({ content, lang }: P) {
  const s = content.sections.faq;
  const items = s.items.filter((f) => t(f.q, lang));
  if (!s.visible || !items.length) return null;
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">{t(s.title, lang)}</h2>
      <div className="faq-list">
        {items.map((f, i) => (
          <details key={i}>
            <summary>{t(f.q, lang)}</summary>
            <p>{t(f.a, lang)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Contact({ content, lang }: P) {
  const c = content.sections.contact;
  const s = content.settings;
  const items = [
    s.email && { k: t(c.labels.email, lang), href: `mailto:${s.email}`, label: s.email, ext: false },
    s.whatsapp && { k: t(c.labels.whatsapp, lang), href: waLink(s, lang, false), label: s.whatsappDisplay || s.whatsapp, ext: true },
    s.linkedin && { k: t(c.labels.linkedin, lang), href: s.linkedin, label: s.linkedinLabel || s.linkedin, ext: true },
    s.github && { k: t(c.labels.github, lang), href: `https://github.com/${s.github}`, label: s.github, ext: true },
  ].filter((x): x is { k: string; href: string; label: string; ext: boolean } => !!x);
  return (
    <section className="contact" id="kontak" aria-labelledby="contact-title">
      <h2 id="contact-title">{t(c.title, lang)}</h2>
      <div className="contact-actions">
        <a className="btn btn-big" href={waLink(s, lang)} target="_blank" rel="noopener">{t(c.button, lang)}</a>
        <ul className="contact-list">
          {items.map((it) => (
            <li key={it.k}>
              <span className="cl-k">{it.k}</span>
              <a href={it.href} {...(it.ext ? { target: "_blank", rel: "noopener" } : {})}>{it.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
