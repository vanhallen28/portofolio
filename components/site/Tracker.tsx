"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

/* Counts visits for the admin's statistics page (no cookie), and sends real-visitor web vitals.
   Also tells the Meta Pixel, when one is installed, about page changes and WhatsApp clicks.
   A browser where the owner switched counting off (admin → Statistik) sends nothing. */

type Fbq = (...args: unknown[]) => void;
const NO_TRACK = "porto:notrack";

function off(): boolean {
  try { return window.localStorage.getItem(NO_TRACK) === "1"; } catch { return false; }
}

function send(body: Record<string, unknown>) {
  if (off()) return;
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/v", new Blob([json], { type: "text/plain" }))) return;
  } catch { /* fall through */ }
  fetch("/api/v", { method: "POST", body: json, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

const report: Parameters<typeof useReportWebVitals>[0] = (m) => {
  if (!["LCP", "INP", "CLS", "FCP", "TTFB"].includes(m.name)) return;
  send({ k: "vital", n: m.name, v: Math.max(0, Math.round(m.value * (m.name === "CLS" ? 10000 : 1)) / (m.name === "CLS" ? 10000 : 1)), p: window.location.pathname });
};

/** The project a click belongs to: its room on the home page, or the case study being read. */
function projectOf(el: Element): string {
  const room = el.closest<HTMLElement>("article.room[data-room]");
  if (room?.dataset.room) return room.dataset.room;
  const m = /^\/(?:karya|en\/work)\/([a-z0-9-]+)/.exec(window.location.pathname);
  return m ? m[1] : "";
}

let last = { path: "", t: 0 };
/** How this visit arrived (first page): WhatsApp and preview clicks are credited to the same source. */
let entry: Record<string, unknown> = {};

export function Tracker() {
  useReportWebVitals(report);
  const path = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const now = Date.now();
    if (last.path === path && now - last.t < 1500) return; // React's double effects in development
    last = { path, t: now };
    const q = new URLSearchParams(window.location.search);
    if (first.current) {
      first.current = false;
      entry = {
        r: document.referrer.slice(0, 600),
        ...(q.get("utm_source") ? { u: q.get("utm_source")!.slice(0, 80) } : {}),
        ...(q.has("fbclid") ? { fb: 1 } : {}), ...(q.has("gclid") ? { g: 1 } : {}),
      };
      send({ k: "view", p: path, ...entry });
    } else {
      send({ k: "view", p: path, r: window.location.origin + "/" });
      const fbq = (window as unknown as { fbq?: Fbq }).fbq;
      if (fbq) fbq("track", "PageView");
    }
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const a = el?.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      if (a.hasAttribute("data-preview")) { send({ k: "preview", p: window.location.pathname, s: projectOf(a), ...entry }); return; }
      if (/^(https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\/|whatsapp:)/i.test(a.href)) {
        send({ k: "wa", p: window.location.pathname, s: projectOf(a), ...entry });
        const fbq = (window as unknown as { fbq?: Fbq }).fbq;
        if (fbq) fbq("track", "Contact");
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
