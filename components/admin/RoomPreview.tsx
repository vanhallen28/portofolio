"use client";
import { useEffect, useRef, useState } from "react";
import { Room } from "@/components/site/Room";
import type { Lang, Line, LineKey, Project, Sections } from "@/lib/content/types";

/** The real <Room> from the site, rendered at desktop width (1280 px) and scaled to fit. */
export function RoomPreview({ project, index, lines, works }: { project: Project; index: number; lines: Record<LineKey, Line>; works: Sections["works"] }) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(400);
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    const f = frame.current, i = inner.current;
    if (!f || !i) return;
    const measure = () => {
      // Desktop admin: show the room as it looks on a 1280 px screen. Small screens: as it looks on this device.
      const virtual = window.innerWidth >= 1100 ? 1280 : f.clientWidth;
      i.style.width = `${virtual}px`;
      const s = f.clientWidth / virtual;
      setScale(s);
      setHeight(Math.ceil(i.scrollHeight * s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(f);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <details className="adm-preview" open>
      <summary className="adm-preview-cap">
        <span>▾ Pratinjau langsung</span>
        <span className="adm-tabs" role="group" aria-label="Bahasa pratinjau">
          <button type="button" aria-pressed={lang === "id"} onClick={(e) => { e.preventDefault(); setLang("id"); }}>ID</button>
          <button type="button" aria-pressed={lang === "en"} onClick={(e) => { e.preventDefault(); setLang("en"); }}>EN</button>
        </span>
      </summary>
      <div className="adm-preview-frame" ref={frame} style={{ height, ["--r-wall" as string]: project.theme.wall }} aria-hidden="true" inert>
        <div className="adm-preview-scale" ref={inner} style={{ transform: `scale(${scale})` }}>
          <Room project={project} index={index} lines={lines} works={works} lang={lang} caseLink={null} />
        </div>
      </div>
    </details>
  );
}
