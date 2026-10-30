import localFont from "next/font/local";

/** Shell font: carries the portfolio's own voice (header, hero, sections). */
export const fontShell = localFont({
  src: [
    { path: "../app/fonts/schibsted-grotesk-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/schibsted-grotesk-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/schibsted-grotesk-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../app/fonts/schibsted-grotesk-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--f-shell",
  display: "swap",
});

/* Hero poster: condensed display caps and the italic serif phrase between them. Preloaded: they are the first thing on screen. */
export const fontDisplay = localFont({ src: "../app/fonts/anton-latin-400-normal.woff2", weight: "400", variable: "--f-display", display: "swap" });
export const fontItalic = localFont({ src: "../app/fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic", variable: "--f-italic", display: "swap" });

/* Title fonts borrowed from each client's brand. Not preloaded: they appear further down the page. */
const marcellus = localFont({ src: "../app/fonts/marcellus-latin-400-normal.woff2", weight: "400", variable: "--f-marcellus", display: "swap", preload: false });
const jakarta = localFont({
  src: [
    { path: "../app/fonts/plus-jakarta-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../app/fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../app/fonts/plus-jakarta-sans-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--f-jakarta", display: "swap", preload: false,
});
const archivo = localFont({ src: "../app/fonts/archivo-black-latin-400-normal.woff2", weight: "400", variable: "--f-archivo", display: "swap", preload: false });
const unbounded = localFont({ src: "../app/fonts/unbounded-latin-800-normal.woff2", weight: "800", variable: "--f-unbounded", display: "swap", preload: false });
const cormorant = localFont({ src: "../app/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", variable: "--f-cormorant", display: "swap", preload: false });
const host = localFont({
  src: [
    { path: "../app/fonts/host-grotesk-latin-500-normal.woff2", weight: "500" },
    { path: "../app/fonts/host-grotesk-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--f-host", display: "swap", preload: false,
});
const quicksand = localFont({ src: "../app/fonts/quicksand-latin-700-normal.woff2", weight: "700", variable: "--f-quicksand", display: "swap", preload: false });
const lora = localFont({ src: "../app/fonts/lora-latin-600-normal.woff2", weight: "600", variable: "--f-lora", display: "swap", preload: false });

/* Brand display faces of VALE, Loma and RUA, taken as they are from each project file (see app/fonts/LICENSES.md). */
const vale = localFont({ src: "../app/fonts/vale-display.woff2", weight: "400", variable: "--f-vale", display: "swap", preload: false });
const loma = localFont({ src: "../app/fonts/loma-display.woff2", weight: "400", variable: "--f-loma", display: "swap", preload: false });
const rua = localFont({ src: "../app/fonts/rua-display.woff2", weight: "400", variable: "--f-rua", display: "swap", preload: false });

/** Class names to put on <html> so every font variable is defined. */
export const fontVariables = [fontShell, fontDisplay, fontItalic, marcellus, jakarta, archivo, unbounded, cormorant, host, quicksand, lora, vale, loma, rua].map((f) => f.variable).join(" ");
