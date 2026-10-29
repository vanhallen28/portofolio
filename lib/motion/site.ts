import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AUTO_MOTIONS } from "@/lib/content/constants";

/* Motion identity: one personality for the whole site, calm and confident, no bounce on content.
   Signature ease: power3.out for entrances, power2.inOut for things already on screen.
   Text rises out of a mask, wall colours travel outward from the floor-plan dot, and each
   room's screens have their own scroll effect (SCREEN_EFFECTS), picked per project. Port of the approved preview (portfolio-preview/src/app.js).

   Everything here enhances server-rendered markup that is complete without JavaScript.
   initSite() returns a cleanup that puts the DOM back the way React rendered it. */

const EASE_IN = "power3.out";
const EASE_ON = "power2.inOut";

/** avatar: the circle behind the header character — the room's accent, or the shell pink. */
type Theme = { wall: string; ink: string; muted: string; accent: string; btnBg: string; btnInk: string; avatar: string };
type Cleanup = () => void;

const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll<T>(s));

/** Wraps each word of `el` in .w > .wi for the mask-rise entrance. The original text nodes are kept
    so revert() can hand React back the exact nodes it rendered. */
function splitWords(el: Element | null, undo: Cleanup[]): HTMLElement[] {
  if (!el || el.hasAttribute("data-split")) return [];
  el.setAttribute("data-split", "1");
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) if (n.nodeValue?.trim()) nodes.push(n as Text);
  const swaps: { original: Text; parts: Node[] }[] = [];
  for (const node of nodes) {
    const parts: Node[] = [];
    for (const part of (node.nodeValue ?? "").split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { parts.push(document.createTextNode(part)); continue; }
      const w = document.createElement("span");
      w.className = "w";
      const i = document.createElement("span");
      i.className = "wi";
      i.textContent = part;
      w.appendChild(i);
      parts.push(w);
    }
    const parent = node.parentNode!;
    for (const p of parts) parent.insertBefore(p, node);
    parent.removeChild(node);
    swaps.push({ original: node, parts });
  }
  undo.push(() => {
    for (const { original, parts } of swaps) {
      const first = parts[0];
      if (first?.parentNode) first.parentNode.insertBefore(original, first);
      for (const p of parts) p.parentNode?.removeChild(p);
    }
    el.removeAttribute("data-split");
  });
  return $$(".wi", el);
}

function on<K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, undo: Cleanup[]): void;
function on<K extends keyof DocumentEventMap>(target: Document, type: K, fn: (e: DocumentEventMap[K]) => void, undo: Cleanup[]): void;
function on(target: EventTarget, type: string, fn: EventListener, undo: Cleanup[]): void;
function on(target: EventTarget, type: string, fn: (e: never) => void, undo: Cleanup[]) {
  target.addEventListener(type, fn as EventListener);
  undo.push(() => target.removeEventListener(type, fn as EventListener));
}

/* ---------- Mobile menu (every page) ---------- */
function initMenu(undo: Cleanup[], reduce: MediaQueryList) {
  const root = document.documentElement;
  const btn = $<HTMLButtonElement>(".menu-btn");
  const mnav = $<HTMLElement>("#mnav");
  const head = $(".site-head");
  if (!btn || !mnav || !head) return;
  const setMenu = (open: boolean) => {
    btn.setAttribute("aria-expanded", String(open));
    root.classList.toggle("menu-open", open);
    root.style.setProperty("--head-top", `${Math.max(0, head.getBoundingClientRect().bottom)}px`);
    if (open) {
      mnav.hidden = false;
      root.style.overflow = "hidden";
      if (!reduce.matches) {
        gsap.fromTo(mnav, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" });
        gsap.fromTo($$("li a, .btn", mnav), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: EASE_IN, stagger: 0.05 });
      }
      $<HTMLAnchorElement>("a", mnav)?.focus();
    } else {
      mnav.hidden = true;
      root.style.overflow = "";
    }
  };
  on(btn, "click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"), undo);
  for (const a of $$("a", mnav)) on(a, "click", () => setMenu(false), undo);
  on(document, "keydown", (e) => {
    if (e.key === "Escape" && !mnav.hidden) { setMenu(false); btn.focus(); }
  }, undo);
  on(window, "resize", () => { if (window.innerWidth > 1100 && !mnav.hidden) setMenu(false); }, undo);
  undo.push(() => {
    mnav.hidden = true;
    root.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    root.style.overflow = "";
    root.style.removeProperty("--head-top");
  });
}

/* ---------- WhatsApp bar on phones (every page) ----------
   Hidden while another WhatsApp button (hero, contact) or the footer is on screen, so there is
   never a doubled call to action. Without JavaScript it simply stays visible. */
function initStickyCta(undo: Cleanup[]) {
  const bar = $("[data-sticky-cta]");
  if (!bar) return;
  if (typeof IntersectionObserver === "undefined") { bar.classList.add("is-ready"); return; }
  const targets = $$(".hero-actions, .contact-actions, .site-foot");
  if (!targets.length) { bar.classList.add("is-ready"); return; }
  const seen = new Set<Element>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) seen.add(e.target);
      else seen.delete(e.target);
    }
    bar.classList.toggle("is-hidden", seen.size > 0);
    bar.classList.add("is-ready");
  });
  for (const t of targets) io.observe(t);
  undo.push(() => { io.disconnect(); bar.classList.remove("is-hidden", "is-ready"); });
}

/* ---------- Wall colours ---------- */
function themeOf(el: HTMLElement): Theme {
  const d = el.dataset;
  return { wall: d.wall!, ink: d.ink!, muted: d.muted!, accent: d.accent!, btnBg: d.btnBg!, btnInk: d.btnInk!, avatar: d.accent! };
}

function createWalls(undo: Cleanup[], reduce: MediaQueryList) {
  const root = document.documentElement;
  const metas = $$<HTMLMetaElement>('meta[name="theme-color"]');
  const metaBefore = metas.map((m) => m.getAttribute("content"));
  const wipe = document.createElement("div");
  wipe.className = "wipe";
  wipe.setAttribute("aria-hidden", "true");
  document.body.insertBefore(wipe, document.body.firstChild);

  const props = ["--wall", "--chrome", "--ink", "--muted", "--accent", "--btn-bg", "--btn-ink", "--avatar-bg"];
  const shellTheme = (): Theme => {
    const cs = getComputedStyle(root);
    const g = (n: string) => cs.getPropertyValue(n).trim();
    return { wall: g("--shell-wall"), ink: g("--shell-ink"), muted: g("--shell-muted"), accent: g("--shell-accent"), btnBg: g("--shell-btn-bg"), btnInk: g("--shell-btn-ink"), avatar: g("--shell-avatar") };
  };
  let current: string | null = null;
  let wipeTween: gsap.core.Tween | null = null;
  let wipeWall = "";
  const setVars = (t: Theme) => {
    root.style.setProperty("--wall", t.wall); root.style.setProperty("--chrome", t.wall);
    root.style.setProperty("--ink", t.ink); root.style.setProperty("--muted", t.muted);
    root.style.setProperty("--accent", t.accent); root.style.setProperty("--btn-bg", t.btnBg); root.style.setProperty("--btn-ink", t.btnInk);
    root.style.setProperty("--avatar-bg", t.avatar);
  };
  const finishWipe = () => {
    if (!wipeTween) return;
    wipeTween.kill(); wipeTween = null;
    root.style.setProperty("--wall", wipeWall);
    wipe.style.clipPath = "circle(0px at 0 0)";
  };
  /** origin: viewport point the new wall colour spreads from. */
  const apply = (t: Theme | null, instant = false, origin?: { x: number; y: number } | null) => {
    if (!t?.wall) return;
    const key = t.wall + t.ink;
    if (current === key && !instant) return;
    current = key;
    for (const m of metas) m.setAttribute("content", t.wall);
    if (instant || reduce.matches) {
      finishWipe(); gsap.killTweensOf(root, props.join(","));
      setVars(t);
      return;
    }
    finishWipe();
    const vw = window.innerWidth, vh = window.innerHeight;
    const o = origin ?? { x: vw * 0.86, y: vh * 0.5 };
    const r = Math.hypot(Math.max(o.x, vw - o.x), Math.max(o.y, vh - o.y)) + 2;
    const st = { r: 0 };
    wipe.style.background = t.wall; wipeWall = t.wall;
    wipeTween = gsap.to(st, {
      r, duration: 0.85, ease: EASE_ON,
      onUpdate: () => { wipe.style.clipPath = `circle(${st.r.toFixed(1)}px at ${o.x.toFixed(1)}px ${o.y.toFixed(1)}px)`; },
      onComplete: () => { root.style.setProperty("--wall", t.wall); wipe.style.clipPath = "circle(0px at 0 0)"; wipeTween = null; },
    });
    gsap.to(root, { "--ink": t.ink, "--muted": t.muted, "--accent": t.accent, "--btn-bg": t.btnBg, "--btn-ink": t.btnInk, "--chrome": t.wall, "--avatar-bg": t.avatar, duration: 0.7, ease: EASE_ON, overwrite: "auto" });
  };
  let shell = shellTheme();
  apply(shell, true);
  const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    finishWipe();
    for (const p of props) root.style.removeProperty(p);
    shell = shellTheme(); current = null; apply(shell, true);
    ScrollTrigger.refresh();
  };
  mqDark.addEventListener("change", onScheme);
  undo.push(() => {
    mqDark.removeEventListener("change", onScheme);
    wipeTween?.kill();
    gsap.killTweensOf(root);
    for (const p of props) root.style.removeProperty(p);
    wipe.remove();
    metas.forEach((m, i) => { const c = metaBefore[i]; if (c !== null) m.setAttribute("content", c); });
  });
  return { apply, shell: () => shell };
}

/* ---------- Room screens: one scroll effect per room ---------- */
/* Each effect fills a scrubbed entrance timeline (the screens arrive as the room scrolls in and leave
   again when scrolling back up) and returns the drift each screen keeps while the room scrolls past.
   Entrances use transform, opacity, clip-path and filter; drifts use --px/--py/--rz (CSS translate and
   rotate), so the two never fight over one property. */
type ScreenEffect = (typeof AUTO_MOTIONS)[number];
type ScreenSet = { desks: HTMLElement[]; phones: HTMLElement[]; all: HTMLElement[]; box: HTMLElement };
type Drift = { el: HTMLElement; px?: number; py?: number; rz?: number };
/* clip-path fully open: larger than the screen so its shadow is not cut off */
const OPEN = "inset(-30% -30% -30% -30% round 0% 0% 0% 0%)";
const clip = (top: number, right: number, bottom: number, left: number, r = "0% 0% 0% 0%") => `inset(${top}% ${right}% ${bottom}% ${left}% round ${r})`;
const drift = (els: HTMLElement[], d: Omit<Drift, "el">, alt?: Omit<Drift, "el">) => els.map((el, i) => ({ el, ...(alt && i % 2 ? alt : d) }));

const SCREEN_EFFECTS: Record<ScreenEffect, (s: ScreenSet, tl: gsap.core.Timeline) => Drift[]> = {
  /* Gerbang: the desktop rises through an arch; the phone settles in softly */
  arch: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { clipPath: clip(100, 0, 0, 0, "50% 50% 0% 0%"), y: 40 }, { clipPath: OPEN, y: 0, duration: 1, ease: "power2.out", stagger: 0.15 }, 0);
    if (phones.length) tl.fromTo(phones, { y: 80, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 }, 0.35);
    return [...drift(desks, { py: 20 }), ...drift(phones, { py: 60 })];
  },
  /* Geser: panels wipe in from opposite sides, then keep sliding against each other */
  slide: ({ desks, phones }, tl) => {
    desks.forEach((el, i) => {
      const left = i % 2 === 0;
      tl.fromTo(el, { x: left ? -90 : 90, clipPath: left ? clip(0, 100, 0, 0) : clip(0, 0, 0, 100) }, { x: 0, clipPath: OPEN, duration: 1, ease: "power3.out" }, i * 0.15);
    });
    if (phones.length) tl.fromTo(phones, { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 0.3);
    return [...drift(desks, { px: 26 }, { px: -26 }), ...drift(phones, { py: 50 })];
  },
  /* Tirai: the desktop opens from the middle like curtains; the phone swings in from its top edge */
  curtain: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { clipPath: clip(0, 50, 0, 50), scale: 1.04 }, { clipPath: OPEN, scale: 1, duration: 1, ease: "power2.inOut", stagger: 0.12 }, 0);
    if (phones.length) tl.fromTo(phones, { rotation: -14, y: -30, opacity: 0, transformOrigin: "50% 0%" }, { rotation: 0, y: 0, opacity: 1, duration: 0.9, ease: "back.out(1.4)", stagger: 0.1 }, 0.3);
    return [...drift(desks, { py: 18 }), ...drift(phones, { py: 40, rz: 3 })];
  },
  /* Kipas: the screens start stacked in the middle and fan out to their places */
  spread: ({ all, box }, tl) => {
    const toCenter = (el: HTMLElement) => box.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
    tl.fromTo(all, { x: (_i: number, el: HTMLElement) => toCenter(el), rotation: (i: number) => (i % 2 ? -8 : 8), scale: 0.9, opacity: 0.4 },
      { x: 0, rotation: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.05 }, 0);
    return drift(all, { py: 30 }, { py: 70 });
  },
  /* Fokus: blurred and close, then sharp, like a lens finding focus */
  focus: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { filter: "blur(16px)", scale: 1.08, opacity: 0.25 }, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, ease: "power2.out", stagger: 0.12 }, 0);
    if (phones.length) tl.fromTo(phones, { filter: "blur(12px)", y: 50, opacity: 0 }, { filter: "blur(0px)", y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 0.25);
    return [...drift(desks, { py: 14 }), ...drift(phones, { py: 55 })];
  },
  /* Putar 3D: the desktop lifts up from its bottom edge, the phone turns toward you */
  tilt: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { rotationX: 32, y: 70, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 100%" },
      { rotationX: 0, y: 0, opacity: 1, transformPerspective: 1400, duration: 1, ease: "power3.out", stagger: 0.12 }, 0);
    if (phones.length) tl.fromTo(phones, { rotationY: -38, x: 70, opacity: 0, transformPerspective: 1000, transformOrigin: "0% 50%" },
      { rotationY: 0, x: 0, opacity: 1, transformPerspective: 1000, duration: 0.9, ease: "power3.out" }, 0.3);
    return [...drift(desks, { py: 24 }), ...drift(phones, { py: 70, rz: -4 })];
  },
  /* Sinyal: the desktop pops up to size, the phone drops in and bounces */
  signal: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { scale: 0.72, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.7)", stagger: 0.12 }, 0);
    if (phones.length) {
      tl.fromTo(phones, { y: -160 }, { y: 0, duration: 1, ease: "bounce.out" }, 0.25)
        .fromTo(phones, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0.25);
    }
    return [...drift(desks, { py: 12 }), ...drift(phones, { py: 95 })];
  },
  /* Cetak: each screen comes out line by line, like a receipt from the printer */
  print: ({ desks, phones }, tl) => {
    if (desks.length) tl.fromTo(desks, { clipPath: clip(0, 0, 100, 0), y: -24 }, { clipPath: OPEN, y: 0, duration: 1, ease: "steps(14)", stagger: 0.15 }, 0);
    if (phones.length) tl.fromTo(phones, { clipPath: clip(0, 0, 100, 0), y: -16 }, { clipPath: OPEN, y: 0, duration: 0.8, ease: "steps(10)" }, 0.45);
    return [...drift(desks, { py: 20 }), ...drift(phones, { py: 60 })];
  },
};

/* ---------- Home page ---------- */
function initHome(undo: Cleanup[], reduce: MediaQueryList) {
  const root = document.documentElement;
  const walls = createWalls(undo, reduce);
  const rooms = $$<HTMLElement>(".room");
  const chips = $$<HTMLButtonElement>("[data-filter]");
  const plan = $(".plan");
  const planLinks = $$<HTMLAnchorElement>(".plan a");

  /* Filters */
  const setFilter = (line: string) => {
    for (const c of chips) c.setAttribute("aria-pressed", String(c.dataset.filter === line));
    for (const r of rooms) {
      const visible = line === "all" || ` ${r.dataset.lines} `.includes(` ${line} `);
      r.hidden = !visible;
      $(`.plan a[data-room="${r.dataset.room}"]`)?.parentElement?.classList.toggle("off", !visible);
    }
    ScrollTrigger.refresh();
    if (!reduce.matches) gsap.fromTo(rooms.filter((r) => !r.hidden).slice(0, 2), { opacity: 0.2 }, { opacity: 1, duration: 0.4, ease: "power1.out" });
  };
  for (const c of chips) on(c, "click", () => setFilter(c.dataset.filter!), undo);
  for (const a of $$<SVGAElement>("[data-filter-link]")) on(a, "click", () => setFilter(a.dataset.filterLink!), undo);
  undo.push(() => {
    for (const r of rooms) r.hidden = false;
    for (const c of chips) c.setAttribute("aria-pressed", String(c.dataset.filter === "all"));
    for (const li of $$(".plan li.off")) li.classList.remove("off");
  });

  /* Map hover lights up the station's lines */
  const map = $(".map");
  for (const st of $$<SVGAElement>(".map .st")) {
    const lines = (st.dataset.lines ?? "").split(" ");
    const lit = () => {
      map?.classList.add("is-focus");
      for (const ln of $$<SVGPathElement>(".map .ln")) ln.classList.toggle("on", lines.includes(ln.dataset.line ?? ""));
    };
    const unlit = () => map?.classList.remove("is-focus");
    on(st, "mouseenter", lit, undo); on(st, "focus", lit, undo);
    on(st, "mouseleave", unlit, undo); on(st, "blur", unlit, undo);
    on(st, "click", () => setFilter("all"), undo);
  }

  /* Walls follow the room under the 55% line; the floor plan marks it */
  const originFor = (room: HTMLElement | null) => {
    const dot = room && $(`.plan a[data-room="${room.dataset.room}"] .plan-n`);
    const b = dot?.getBoundingClientRect();
    if (b && b.width) return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    return { x: window.innerWidth * 0.86, y: window.innerHeight * 0.5 };
  };
  const markPlan = (room: HTMLElement | null) => {
    for (const a of planLinks) a.classList.toggle("cur", !!room && a.dataset.room === room.dataset.room);
  };

  const ctx = gsap.context(() => {
    for (const room of rooms) {
      const t = themeOf(room);
      ScrollTrigger.create({
        trigger: room, start: "top 55%", end: "bottom 55%",
        onToggle: (self) => { if (!self.isActive) return; markPlan(room); walls.apply(t, false, originFor(room)); },
      });
    }
    const toShell = (s: ScrollTrigger) => {
      if (!s.isActive) return;
      markPlan(null);
      walls.apply(walls.shell(), false, { x: window.innerWidth / 2, y: s.direction > 0 ? 0 : window.innerHeight });
    };
    for (const sel of [".hero", ".works-head"]) if ($(sel)) ScrollTrigger.create({ trigger: sel, start: "top 55%", end: "bottom 55%", onToggle: toShell });
    const afterWorks = $(".works")?.nextElementSibling;
    if (afterWorks) ScrollTrigger.create({ trigger: afterWorks, start: "top 55%", endTrigger: ".site-foot", end: "bottom bottom", onToggle: toShell });
    const works = $(".works"), worksHead = $(".works-head");
    if (works && worksHead && plan) {
      ScrollTrigger.create({
        trigger: works, start: () => `top+=${worksHead.offsetHeight} center`, end: "bottom center",
        onToggle: (s) => plan.classList.toggle("on", s.isActive),
      });
    }
    /* reading progress */
    gsap.to(root, { "--p": 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });
  });
  undo.push(() => { ctx.revert(); plan?.classList.remove("on"); markPlan(null); root.style.removeProperty("--p"); });

  /* Safety net: after any jump or refresh, read the wall from what sits under the 55% line */
  const syncTheme = () => {
    const line = window.innerHeight * 0.55;
    let hit: HTMLElement | null = null;
    for (const r of rooms) {
      if (r.hidden) continue;
      const b = r.getBoundingClientRect();
      if (b.top <= line && b.bottom > line) hit = r;
    }
    markPlan(hit);
    walls.apply(hit ? themeOf(hit) : walls.shell(), false, hit ? originFor(hit) : null);
  };
  const onRefresh = (): void => { requestAnimationFrame(syncTheme); };
  ScrollTrigger.addEventListener("scrollEnd", syncTheme);
  ScrollTrigger.addEventListener("refresh", onRefresh);
  undo.push(() => { ScrollTrigger.removeEventListener("scrollEnd", syncTheme); ScrollTrigger.removeEventListener("refresh", onRefresh); });

  /* Motion: skipped entirely when the visitor prefers reduced motion */
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px)" }, (mctx) => {
    if (!mctx.conditions?.motion) return;
    const wide = !!mctx.conditions.wide;
    const local: Cleanup[] = [];

    /* 1 · Hero: the one orchestrated load moment */
    /* The poster caps rise word by word; the loop then draws itself around them. */
    const heroWords = splitWords($(".hero-big") ?? $("#hero-title"), local);
    const intro = gsap.timeline({ delay: 0.1 });
    intro.from(".hero-role, .avail, .hero-offer", { y: 12, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.06 })
      .from(heroWords, { yPercent: 110, duration: 0.9, ease: EASE_IN, stagger: 0.06 }, 0.1)
      .from(".hero-lede, .hero-actions, .hero-badge", { y: 18, opacity: 0, duration: 0.6, ease: EASE_IN, stagger: 0.08 }, 0.6);
    const lines = $$<SVGPathElement>(".map .ln");
    if (lines.length) {
      for (const ln of lines) { const L = ln.getTotalLength(); gsap.set(ln, { strokeDasharray: L, strokeDashoffset: L }); }
      gsap.set(".map .st .dot", { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(".map .lname, .map .train", { opacity: 0 });
      const draw = gsap.timeline({ delay: 0.55 });
      for (const name of ["found", "sell", "run", "serve"]) {
        draw.to(`.map .ln[data-line="${name}"]`, { strokeDashoffset: 0, duration: 0.45, ease: "power1.inOut" }, ">-0.05");
        draw.to(`.map .lname[data-line="${name}"]`, { opacity: 1, duration: 0.3 }, "<0.15");
      }
      if ($(".map .st")) draw.to(".map .st .dot", { scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.05 }, "-=0.2");
      draw.to(".map .train", { opacity: 1, duration: 0.4 }, "-=0.1");
    }

    /* 2 · Ambient: two trains travel the loop; a station brightens as one passes */
    const loop = $<SVGPathElement>(".map .loop");
    const trains = $$<SVGRectElement>(".map .train");
    if (loop && trains.length) {
      const LEN = loop.getTotalLength(), PERIOD = 26;
      let run = true;
      const t0 = performance.now();
      const stations = $$<SVGCircleElement>(".map .st .dot").map((d) => ({ el: d, x: +d.getAttribute("cx")!, y: +d.getAttribute("cy")!, hot: false }));
      const tick = (): void => {
        if (!run) return;
        const t = (performance.now() - t0) / 1000 / PERIOD;
        const near = new Set<number>();
        trains.forEach((tr, i) => {
          const s = ((t + i / trains.length) % 1) * LEN;
          const p = loop.getPointAtLength(s), q = loop.getPointAtLength((s + 1) % LEN);
          const a = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
          tr.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${a.toFixed(1)})`);
          stations.forEach((st, k) => { if (Math.abs(st.x - p.x) < 16 && Math.abs(st.y - p.y) < 16) near.add(k); });
        });
        stations.forEach((st, k) => {
          const hot = near.has(k);
          if (hot !== st.hot) {
            st.hot = hot;
            gsap.to(st.el, { scale: hot ? 1.35 : 1, duration: hot ? 0.25 : 0.5, ease: hot ? "power2.out" : "power2.inOut", overwrite: "auto" });
          }
        });
      };
      gsap.ticker.add(tick);
      local.push(() => { gsap.ticker.remove(tick); for (const tr of trains) tr.removeAttribute("transform"); });
      ScrollTrigger.create({ trigger: ".hero", start: "top bottom", end: "bottom top", onToggle: (s) => { run = s.isActive; } });
    }

    /* 3 · Section headings rise word by word as they arrive */
    for (const sel of [".works-head h2", "#svc-title", "#proc-title", "#testi-title", "#about-title", "#faq-title"]) {
      const el = $(sel);
      if (!el) continue;
      gsap.from(splitWords(el, local), { yPercent: 110, duration: 0.8, ease: EASE_IN, stagger: 0.05, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    }
    const clients = $$(".clients-title, .clients-list li");
    if (clients.length) gsap.from(clients, { y: 10, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.05, delay: 0.9 });
    if ($(".works-head")) {
      gsap.from(".works-intro, .filters .chip", { y: 14, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.04, scrollTrigger: { trigger: ".works-head", start: "top 75%", once: true } });
    }

    /* 4 · Rooms: title rises, copy follows, numbers count, screens arrive from depth */
    for (const room of rooms) {
      const words = splitWords($(".room-title", room), local);
      const shots = $$(".room-visual .shot, .brand-card", room);
      const phones = shots.filter((s) => s.classList.contains("shot-phone"));
      const desks = shots.filter((s) => !phones.includes(s));
      const arch = $(".arch", room);
      const swatches = $$(".swatches li", room);
      const tl = gsap.timeline({ paused: true });
      tl.from($$(".room-no, .room-lines", room), { y: 10, opacity: 0, duration: 0.4, ease: EASE_IN, stagger: 0.05 }, 0);
      if (words.length) tl.from(words, { yPercent: 110, duration: 0.85, ease: EASE_IN, stagger: 0.06 }, 0.05);
      const copy = $$(".room-meta, .room-text, .room-result, .facts > div, .room-actions, .room-links", room);
      if (copy.length) tl.from(copy, { y: 16, opacity: 0, duration: 0.55, ease: EASE_IN, stagger: 0.05 }, 0.25);
      if (arch) tl.fromTo(arch, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: EASE_IN, clearProps: "clipPath" }, 0.3);
      if (swatches.length) tl.from(swatches, { scale: 0.4, opacity: 0, duration: 0.45, ease: "back.out(1.6)", stagger: 0.04 }, 0.6);
      for (const dt of $$("dt", room)) {
        const text = dt.firstChild;
        if (!(text instanceof Text)) continue;
        const original = text.nodeValue ?? "";
        const m = /^(\d+)(.*)$/.exec(original.trim());
        if (!m || +m[1] < 2) continue;
        const n = +m[1], suffix = m[2], o = { v: 0 };
        tl.to(o, { v: n, duration: 1.1, ease: "power2.out", onUpdate: () => { text.nodeValue = Math.round(o.v) + suffix; } }, 0.4);
        local.push(() => { text.nodeValue = original; });
      }
      const st = ScrollTrigger.create({ trigger: room, start: "top 72%", once: true, onEnter: () => tl.play() });
      /* a room already above the viewport (deep link, reload) is shown finished, never left hidden */
      requestAnimationFrame(() => { if (st.progress > 0 || room.getBoundingClientRect().top < window.innerHeight * 0.72) tl.play(); });
      /* the screens: this room's own effect, tied to the scroll in both directions */
      const visual = $(".room-visual", room);
      if (visual && shots.length) {
        const effect = SCREEN_EFFECTS[room.dataset.motion as ScreenEffect] ?? SCREEN_EFFECTS.arch;
        const enter = gsap.timeline({ scrollTrigger: { trigger: visual, start: "top 92%", end: "top 30%", scrub: 0.6, invalidateOnRefresh: true } });
        const drifts = effect({ desks, phones, all: shots, box: visual }, enter);
        /* depth while the room scrolls past; gentler on phones' small screens */
        const k = wide ? 1 : 0.5;
        for (const d of drifts) {
          const from: gsap.TweenVars = {}, to: gsap.TweenVars = {};
          if (d.px) { from["--px"] = `${d.px * k}px`; to["--px"] = `${-d.px * k}px`; }
          if (d.py) { from["--py"] = `${d.py * k}px`; to["--py"] = `${-d.py * k}px`; }
          if (d.rz) { from["--rz"] = `${d.rz}deg`; to["--rz"] = `${-d.rz}deg`; }
          gsap.fromTo(d.el, from, { ...to, ease: "none", scrollTrigger: { trigger: room, start: "top bottom", end: "bottom top", scrub: true } });
        }
      }
    }

    /* 5 · Services: each line draws itself, like a route on the map */
    const svcs = $$(".svc");
    if (svcs.length) {
      gsap.set(svcs, { "--draw": 0 });
      gsap.timeline({ scrollTrigger: { trigger: ".svc-list", start: "top 80%", once: true } })
        .to(svcs, { "--draw": 1, duration: 0.7, ease: EASE_ON, stagger: 0.14 }, 0)
        .from($$(".svc h3, .svc p"), { y: 14, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.04 }, 0.2);
    }

    /* 6 · Process: the route between steps fills in as you read down */
    const steps = $$(".steps li");
    if (steps.length) {
      gsap.set(steps, { "--draw": 0 });
      gsap.to(steps, { "--draw": 1, ease: "none", stagger: 0.5, scrollTrigger: { trigger: ".steps", start: "top 75%", end: "bottom 55%", scrub: 0.6 } });
      gsap.from(steps, { y: 18, opacity: 0, duration: 0.6, ease: EASE_IN, stagger: 0.12, scrollTrigger: { trigger: ".steps", start: "top 80%", once: true } });
    }

    /* 7 · Testimonials and FAQ arrive gently */
    for (const sel of [".quote", ".faq-list details", ".exp-list li"]) {
      const items = $$(sel);
      if (items.length) gsap.from(items, { y: 18, opacity: 0, duration: 0.6, ease: EASE_IN, stagger: 0.08, scrollTrigger: { trigger: items[0], start: "top 85%", once: true } });
    }

    /* 8 · About: the portrait opens like an iris */
    const portrait = $(".portrait");
    const about = $(".about");
    if (about) {
      const abTl = gsap.timeline({ scrollTrigger: { trigger: about, start: "top 70%", once: true } });
      if (portrait) {
        abTl.fromTo(portrait, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(71% at 50% 50%)", duration: 1.0, ease: EASE_ON, clearProps: "clipPath" });
        const pImg = $("img", portrait);
        if (pImg) abTl.from(pImg, { scale: 1.18, duration: 1.4, ease: EASE_IN }, 0);
      }
      const copy = $$(".about-copy p, .skills li");
      if (copy.length) abTl.from(copy, { y: 14, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.05 }, 0.35);
    }

    /* 9 · Contact: the closing line arrives word by word, then the ways to reach me */
    const contact = $(".contact");
    if (contact) {
      const cWords = splitWords($("#contact-title"), local);
      gsap.timeline({ scrollTrigger: { trigger: contact, start: "top 70%", once: true } })
        .from(cWords, { yPercent: 110, duration: 0.9, ease: EASE_IN, stagger: 0.05 })
        .from(".contact .btn-big", { y: 20, opacity: 0, duration: 0.6, ease: EASE_IN }, 0.45)
        .from(".contact-list li", { y: 12, opacity: 0, duration: 0.5, ease: EASE_IN, stagger: 0.06 }, 0.55);
    }

    return () => {
      for (const u of local.reverse()) u();
    };
  });
  undo.push(() => mm.revert());
}

/* ---------- Case study page ---------- */
function initCase(undo: Cleanup[]) {
  const view = $('[data-view="case"]');
  if (!view) return;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const local: Cleanup[] = [];
    const words = splitWords($(".case-title", view), local);
    const tl = gsap.timeline();
    if (words.length) tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.85, ease: EASE_IN, stagger: 0.06 });
    tl.fromTo($$(".crumb, .case-sub, .case-actions, .case-label > div", view), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: EASE_IN, stagger: 0.04 }, 0.15);
    const cover = $(".case-cover", view);
    if (cover) tl.fromTo(cover, { y: 60, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.95, ease: EASE_IN }, 0.3);
    for (const b of $$(".case-block", view)) {
      gsap.from(b.children, { y: 24, opacity: 0, duration: 0.7, ease: EASE_IN, stagger: 0.08, scrollTrigger: { trigger: b, start: "top 80%", once: true } });
    }
    for (const dt of $$(".case-numbers dt", view)) {
      const text = dt.firstChild;
      if (!(text instanceof Text)) continue;
      const original = text.nodeValue ?? "";
      const m = /^(\d+)(.*)$/.exec(original.trim());
      if (!m || +m[1] < 2) continue;
      const o = { v: 0 };
      gsap.to(o, { v: +m[1], duration: 1.1, ease: "power2.out", onUpdate: () => { text.nodeValue = Math.round(o.v) + m[2]; }, scrollTrigger: { trigger: dt, start: "top 85%", once: true } });
      local.push(() => { text.nodeValue = original; });
    }
    return () => { for (const u of local.reverse()) u(); };
  });
  const root = document.documentElement;
  const ctx = gsap.context(() => {
    gsap.to(root, { "--p": 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });
  });
  undo.push(() => { mm.revert(); ctx.revert(); root.style.removeProperty("--p"); });
}

export function initSite(page: "home" | "case"): Cleanup {
  gsap.registerPlugin(ScrollTrigger);
  const undo: Cleanup[] = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  initMenu(undo, reduce);
  initStickyCta(undo);
  if (page === "home") initHome(undo, reduce);
  else initCase(undo);
  /* web fonts change line lengths: measure again once they are in */
  let alive = true;
  document.fonts?.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
  undo.push(() => { alive = false; });
  return () => {
    for (const u of undo.reverse()) {
      try { u(); } catch { /* keep cleaning up */ }
    }
  };
}
