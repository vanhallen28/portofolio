import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import type { Lang } from "@/lib/content/types";
import { siteUrl } from "@/lib/env";

/* Shared by the two public root layouts (Indonesian at /, English at /en). */

export const publicViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F3F1" },
    { media: "(prefers-color-scheme: dark)", color: "#141517" },
  ],
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  formatDetection: { telephone: false, email: false, address: false },
};

/** Marks the document as scripted before first paint, so no-JS fallbacks only apply without JS. */
const JS_FLAG = "document.documentElement.classList.add('js')";

export function PublicHtml({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next.js switches the CSS smooth scrolling off while it changes page.
    <html lang={lang} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* App Router root layout: a plain <head> is the documented way to add an inline script. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
