import type { Content, Lang, LineKey } from "@/lib/content/types";
import { t } from "@/lib/i18n";
import { lineMap, roomId, stations } from "@/lib/site";
import { ui } from "@/lib/ui";

/* Fixed geometry of the loop (viewBox 50 48 580 470), drawn in the order found → sell → run → serve. */
const PATHS: Record<LineKey, string> = {
  found: "M168.75 128.75 A64 64 0 0 1 214 110 L426 110 A64 64 0 0 1 471.25 128.75",
  sell: "M471.25 128.75 A64 64 0 0 1 490 174 L490 386 A64 64 0 0 1 471.25 431.25",
  run: "M471.25 431.25 A64 64 0 0 1 426 450 L214 450 A64 64 0 0 1 168.75 431.25",
  serve: "M168.75 431.25 A64 64 0 0 1 150 386 L150 174 A64 64 0 0 1 168.75 128.75",
};
const LOOP = "M214 110 L426 110 A64 64 0 0 1 490 174 L490 386 A64 64 0 0 1 426 450 L214 450 A64 64 0 0 1 150 386 L150 174 A64 64 0 0 1 214 110 Z";
const NAME_POS: Record<LineKey, { x: number; y: number; rotate?: number }> = {
  found: { x: 320, y: 150 },
  sell: { x: 450, y: 280, rotate: 90 },
  run: { x: 320, y: 424 },
  serve: { x: 190, y: 280, rotate: -90 },
};
const ORDER: LineKey[] = ["found", "sell", "run", "serve"];

export function TransitMap({ content, lang }: { content: Content; lang: Lang }) {
  const lines = lineMap(content.lines);
  const hero = content.sections.hero;
  return (
    <figure className="map" aria-labelledby="map-cap">
      <svg className="map-svg" viewBox="50 48 580 470" role="group" aria-labelledby="map-title map-desc">
        <title id="map-title">{ui(lang).mapTitle}</title>
        <desc id="map-desc">{t(hero.mapCaption, lang)}</desc>
        <g className="map-lines" fill="none" strokeWidth="14" strokeLinecap="butt">
          {ORDER.map((k) => <path key={k} className="ln" data-line={k} d={PATHS[k]} />)}
        </g>
        <path className="loop" d={LOOP} fill="none" stroke="none" />
        <g className="trains" aria-hidden="true">
          <rect className="train" x="-13" y="-4.5" width="26" height="9" rx="4.5" />
          <rect className="train" x="-13" y="-4.5" width="26" height="9" rx="4.5" />
        </g>
        <g className="map-linenames">
          {ORDER.map((k) => {
            const p = NAME_POS[k];
            return (
              <a key={k} href="#karya" data-filter-link={k}>
                <text x={p.x} y={p.y} textAnchor="middle" transform={p.rotate ? `rotate(${p.rotate} ${p.x} ${p.y})` : undefined} className="lname" data-line={k}>
                  {t(lines[k]?.name, lang)}
                </text>
              </a>
            );
          })}
        </g>
        <g className="map-center" aria-hidden="true">
          <text x="320" y="282" textAnchor="middle" className="mc-big">{t(hero.mapCenter, lang)}</text>
        </g>
        <g className="map-stations">
          {stations(content.projects).map(({ project: p, geo }) => (
            <a key={p.id} href={`#${roomId(p.slug)}`} className={geo.major ? "st st-x" : "st"} data-room={p.slug} data-lines={p.lines.join(" ")} aria-label={p.name}>
              <circle className="hit" cx={geo.cx} cy={geo.cy} r={geo.major ? 30 : 28} />
              <circle className="dot" cx={geo.cx} cy={geo.cy} r={geo.major ? 15 : 10} />
              <text x={geo.label.x} y={geo.label.y} textAnchor={geo.label.anchor} className="sname">{p.mapLabel || p.name}</text>
            </a>
          ))}
        </g>
      </svg>
      <figcaption id="map-cap">{t(hero.mapCaption, lang)}</figcaption>
    </figure>
  );
}
