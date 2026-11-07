import type { Content, Lang, LineKey } from "@/lib/content/types";
import { t } from "@/lib/i18n";
import { lineMap, roomId, stations } from "@/lib/site";
import { ui } from "@/lib/ui";

/* The business loop drawn over the hero headline. Fixed geometry: a wide rounded loop
   (100–540 × 130–430, corner radius 64) drawn in the order found → sell → run → serve. */
const PATHS: Record<LineKey, string> = {
  found: "M118.75 148.75 A64 64 0 0 1 164 130 L476 130 A64 64 0 0 1 521.25 148.75",
  sell: "M521.25 148.75 A64 64 0 0 1 540 194 L540 366 A64 64 0 0 1 521.25 411.25",
  run: "M521.25 411.25 A64 64 0 0 1 476 430 L164 430 A64 64 0 0 1 118.75 411.25",
  serve: "M118.75 411.25 A64 64 0 0 1 100 366 L100 194 A64 64 0 0 1 118.75 148.75",
};
const LOOP = "M164 130 L476 130 A64 64 0 0 1 540 194 L540 366 A64 64 0 0 1 476 430 L164 430 A64 64 0 0 1 100 366 L100 194 A64 64 0 0 1 164 130 Z";
/* Line names sit just outside the loop, clear of the stations. */
const NAME_POS: Record<LineKey, { x: number; y: number; rotate?: number }> = {
  found: { x: 230, y: 113 },
  sell: { x: 561, y: 280, rotate: 90 },
  run: { x: 410, y: 461 },
  serve: { x: 79, y: 280, rotate: -90 },
};
const ORDER: LineKey[] = ["found", "sell", "run", "serve"];
/* Room for a name along each side. The labels are 14px bold capitals with .14em tracking, about 11.6 units a
   character; a longer name (the admin allows 24 characters) is squeezed to fit its side instead of running off it. */
const ROOM: Record<LineKey, number> = { found: 300, sell: 250, run: 300, serve: 250 };
const fit = (name: string, k: LineKey) => (name.length * 11.6 > ROOM[k] ? { textLength: ROOM[k], lengthAdjust: "spacingAndGlyphs" as const } : {});

export function TransitMap({ content, lang }: { content: Content; lang: Lang }) {
  const lines = lineMap(content.lines);
  const hero = content.sections.hero;
  return (
    <figure className="map" aria-labelledby="map-cap">
      <svg className="map-svg" viewBox="60 92 520 380" role="group" aria-labelledby="map-title map-desc">
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
            const name = t(lines[k]?.name, lang), desc = t(lines[k]?.desc, lang);
            return (
              <a key={k} href="#karya" data-filter-link={k}>
                {desc ? <title>{desc}</title> : null}
                <text x={p.x} y={p.y} textAnchor="middle" transform={p.rotate ? `rotate(${p.rotate} ${p.x} ${p.y})` : undefined} className="lname" data-line={k} {...fit(name, k)}>
                  {name}
                </text>
              </a>
            );
          })}
        </g>
        <g className="map-stations">
          {stations(content.projects).map(({ project: p, geo }) => (
            <a key={p.id} href={`#${roomId(p.slug)}`} className={geo.major ? "st st-x" : "st"} data-room={p.slug} data-lines={p.lines.join(" ")} aria-label={p.name}>
              <circle className="hit" cx={geo.cx} cy={geo.cy} r={geo.major ? 30 : 28} />
              <circle className="dot" cx={geo.cx} cy={geo.cy} r={geo.major ? 15 : 10} />
              <text x={geo.label.x} y={geo.label.y} textAnchor={geo.label.anchor} className="sname" aria-hidden="true">{p.mapLabel || p.name}</text>
            </a>
          ))}
        </g>
      </svg>
      <figcaption id="map-cap" className="sr-only">{t(hero.mapCaption, lang)}</figcaption>
    </figure>
  );
}
