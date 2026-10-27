import type { Content, Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n";
import { caseHref, lineMap, roomId } from "@/lib/site";
import { ui } from "@/lib/ui";
import { Room } from "./Room";

export function Works({ content, lang }: { content: Content; lang: Lang }) {
  const w = content.sections.works;
  const lines = lineMap(content.lines);
  const projects = content.projects;
  return (
    <section className="works" id="karya" aria-labelledby="works-title">
      <div className="works-head">
        <h2 id="works-title">{t(w.title, lang)}</h2>
        {t(w.intro, lang) ? <p className="works-intro">{t(w.intro, lang)}</p> : null}
        <div className="filters" role="group" aria-label={ui(lang).filterGroup}>
          <button type="button" className="chip" data-filter="all" aria-pressed="true">
            {t(w.allLabel, lang)} <span className="count">{projects.length}</span>
          </button>
          {content.lines.map((l) => {
            const n = projects.filter((p) => p.lines.includes(l.key)).length;
            return n ? (
              <button key={l.key} type="button" className="chip" data-filter={l.key} aria-pressed="false">
                <i className="ldot" data-line={l.key}></i>{t(l.name, lang)} <span className="count">{n}</span>
              </button>
            ) : null;
          })}
        </div>
      </div>

      <nav className="plan" aria-label={ui(lang).planNav}>
        <ol>
          {projects.map((p, i) => (
            <li key={p.id}>
              <a href={`#${roomId(p.slug)}`} data-room={p.slug}>
                <span className="plan-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="plan-t">{p.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {projects.map((p, i) => (
        <Room key={p.id} project={p} index={i + 1} lines={lines} works={w} lang={lang} caseLink={caseHref(content, p.slug, lang)} />
      ))}
    </section>
  );
}
