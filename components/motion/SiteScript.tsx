"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { initSite } from "@/lib/motion/site";

/* Scroll position when a new page opens.
   The site uses CSS smooth scrolling. Before data-scroll-behavior="smooth" (lib/layout.tsx), Next.js's
   jump to the top of a new page was animated, and ScrollTrigger's refresh then put the old position
   back, so a case study opened from the bottom of another one stayed at the bottom. The attribute
   fixes that; this component is the safety net and also handles links with an anchor:
   - forward navigation inside the site: start at the top;
   - first load: leave it to the browser (a reload keeps its place);
   - back/forward: leave it to history (it restores the old spot);
   - a URL with #anchor (e.g. /#karya): go to that section once the page is set up. */
let firstMount = true;
let historyNavigation = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => { historyNavigation = true; });
  // Back after an in-page #link fires popstate without a new page; any click starts a fresh navigation.
  window.addEventListener("click", () => { historyNavigation = false; }, true);
}

function sectionFromHash(): HTMLElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

/** Attaches menu, filters, wall colours and motion to the server-rendered page. */
export function SiteScript({ page }: { page: "home" | "case" }) {
  const done = useRef(false);
  useLayoutEffect(() => {
    if (done.current) return; // React runs effects twice in development; act once per page
    done.current = true;
    if (!firstMount && !historyNavigation && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    firstMount = false;
    historyNavigation = false;
  }, []);
  useEffect(() => {
    const cleanup = initSite(page);
    // Setting up the scroll animations can cancel the browser's jump to #section: redo it, instantly.
    const target = !historyNavigation ? sectionFromHash() : null;
    const raf = target ? requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "instant" })) : 0;
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, [page]);
  return null;
}
