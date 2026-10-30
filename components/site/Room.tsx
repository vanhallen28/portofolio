import Link from "next/link";
import type { CSSProperties } from "react";
import { AUTO_MOTIONS, TITLE_SIZE_CSS } from "@/lib/content/constants";
import type { Lang, Line, LineKey, Project, Sections } from "@/lib/content/types";
import { FONT_FAMILY } from "@/lib/font-family";
import { t } from "@/lib/i18n";
import { hostOf, roomId } from "@/lib/site";
import { ui } from "@/lib/ui";

type Props = {
  project: Project;
  /** 1-based position, shown as "Ruang 01". */
  index: number;
  lines: Record<LineKey, Line>;
  works: Sections["works"];
  lang: Lang;
  caseLink: string | null;
};

export function roomVars(p: Project): CSSProperties {
  const th = p.theme;
  return {
    "--r-wall": th.wall, "--r-ink": th.ink, "--r-muted": th.muted, "--r-accent": th.accent, "--r-btn-bg": th.btnBg, "--r-btn-ink": th.btnInk,
  } as CSSProperties;
}

export function titleVars(p: Project): CSSProperties {
  return {
    "--room-font": FONT_FAMILY[p.titleFont],
    "--room-size": TITLE_SIZE_CSS[p.titleStyle.size],
    "--room-weight": p.titleStyle.weight,
    "--room-case": p.titleStyle.uppercase ? "uppercase" : "none",
    "--room-track": `${p.titleStyle.tracking}em`,
  } as CSSProperties;
}

/** The scroll effect the room's screens use; "auto" cycles by position so neighbouring rooms differ. */
export function roomMotion(p: Project, index: number): string {
  return p.motion && p.motion !== "auto" ? p.motion : AUTO_MOTIONS[(Math.max(index, 1) - 1) % AUTO_MOTIONS.length];
}

export function NewTabIcon() {
  return (
    <svg className="btn-ico" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 11L11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One exhibition room. Pure markup: used by the home page and by the live preview in the admin. */
export function Room({ project: p, index, lines, works, lang, caseLink }: Props) {
  const th = p.theme;
  const status = t(p.status, lang);
  const note = t(p.liveNote, lang);
  return (
    <article
      className="room" id={roomId(p.slug)} data-room={p.slug} data-lines={p.lines.join(" ")} data-pattern={p.pattern} data-motion={roomMotion(p, index)}
      data-wall={th.wall} data-ink={th.ink} data-muted={th.muted} data-accent={th.accent} data-btn-bg={th.btnBg} data-btn-ink={th.btnInk}
      style={roomVars(p)}
    >
      <div className="room-label">
        <p className="room-no">{t(works.roomLabel, lang)} {String(index).padStart(2, "0")}</p>
        <ul className="room-lines">
          {p.lines.map((k) => (
            <li key={k}><i className="ldot" data-line={k}></i>{t(lines[k]?.name, lang)}</li>
          ))}
        </ul>
        <h3 className="room-title" style={titleVars(p)}>{p.name}</h3>
        {t(p.meta, lang) ? <p className="room-meta">{t(p.meta, lang)}</p> : null}
        {t(p.text, lang) ? <p className="room-text">{t(p.text, lang)}</p> : null}
        {t(p.result, lang) ? <p className="room-result">{t(p.result, lang)}</p> : null}
        {p.facts.length ? (
          <dl className="facts" data-n={p.facts.length}>
            {p.facts.map((f, i) => (
              <div key={i}><dt>{f.value}</dt><dd>{t(f.label, lang)}</dd></div>
            ))}
          </dl>
        ) : null}
        <div className="room-actions">
          {p.previewUrl ? (
            <a className="btn" href={p.previewUrl} target="_blank" rel="noopener" data-preview>
              {t(works.previewCta, lang)}<NewTabIcon /><span className="sr-only"> ({t(works.newTab, lang)})</span>
            </a>
          ) : p.liveUrl ? (
            <a className="btn" href={p.liveUrl} target="_blank" rel="noopener">
              {t(works.visitCta, lang)}<NewTabIcon /><span className="sr-only"> ({t(works.newTab, lang)})</span>
            </a>
          ) : null}
          {caseLink ? <Link className="btn btn-quiet" href={caseLink}>{t(works.caseCta, lang)}</Link> : null}
          {note ? <span className="link-note">{note}</span> : null}
          {status ? <span className="status">{status}</span> : null}
        </div>
        {p.previewUrl && p.liveUrl ? (
          <p className="room-links"><a className="link-out" href={p.liveUrl} target="_blank" rel="noopener">{p.liveLabel || hostOf(p.liveUrl)}</a></p>
        ) : null}
      </div>
      <RoomVisual project={p} lang={lang} />
    </article>
  );
}

function RoomVisual({ project: p, lang }: { project: Project; lang: Lang }) {
  const shots = p.visuals.map((v, i) => {
    const role = p.layout === "two-phones" ? "phone" : v.role;
    return (
      <figure key={i} className={`shot shot-${role}`}>
        <img src={v.image.url} width={v.image.width} height={v.image.height} loading="lazy" decoding="async" alt={t(v.image.alt, lang)} />
        {/* loaded and played only while the room is on screen (lib/motion/site.ts); never for reduced motion or Save-Data */}
        {v.video ? <video className="shot-video" data-src={v.video.url} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} /> : null}
      </figure>
    );
  });
  if (p.layout === "brand-card" && p.brand) {
    const note = t(p.brand.note, lang);
    return (
      <div className="room-visual comp-brand-card">
        <div className="brand-card">
          {p.brand.logoUrl ? (
            <div className="brand-logo"><img src={p.brand.logoUrl} alt={ui(lang).logo(p.name)} loading="lazy" /></div>
          ) : null}
          {p.brand.swatches.length ? (
            <ul className="swatches" aria-label={ui(lang).swatches}>
              {p.brand.swatches.map((s, i) => (
                <li key={i} style={{ "--c": s.color } as CSSProperties}><span>{s.name}</span></li>
              ))}
            </ul>
          ) : null}
        </div>
        {shots.length ? shots[0] : note ? <div className="arch">{note}</div> : null}
        <RoomMascot project={p} lang={lang} />
      </div>
    );
  }
  return <div className={`room-visual comp-${p.layout === "brand-card" ? "desk-phone" : p.layout}`}>{shots}<RoomMascot project={p} lang={lang} /></div>;
}

/** The client's mascot or logo at the corner of the screens. Its entrance and idle loop live in CSS (site.css, "Mascots"). */
function RoomMascot({ project: p, lang }: { project: Project; lang: Lang }) {
  const m = p.mascot;
  if (!m || !m.image.url) return null;
  const style = { "--m-h": `${m.size}px`, "--m-src": `url("${m.image.url}")`, ...(m.chip ? { "--m-chip": m.chip } : {}) } as CSSProperties;
  return (
    <div className={`mascot m-${m.motion}${m.chip ? " has-chip" : ""}`} style={style}>
      <div className="mascot-in">
        <img src={m.image.url} width={m.image.width} height={m.image.height} loading="lazy" decoding="async" alt={t(m.image.alt, lang)} />
      </div>
    </div>
  );
}
