import type { Metadata, Viewport } from "next";
import { Tracker } from "@/components/site/Tracker";
import { adsenseSrc, pixelCode, pixelNoscript, type AdCodes } from "@/lib/ads";
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

/** Every public page: the no-JS flag, the visit counter, and the ad codes set in admin → Kode iklan. */
export function PublicHtml({ lang, ads, children }: { lang: Lang; ads?: AdCodes; children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next.js switches the CSS smooth scrolling off while it changes page.
    <html lang={lang} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* App Router root layout: a plain <head> is the documented way to add an inline script. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        {ads?.adsenseClient ? <meta name="google-adsense-account" content={ads.adsenseClient} /> : null}
        {/* AdSense asks for its code in the page's <head> as served, so it is not loaded later by script */}
        {ads?.adsenseClient ? <script async src={adsenseSrc(ads.adsenseClient)} crossOrigin="anonymous" /> : null}
        {ads?.metaPixelId ? <script dangerouslySetInnerHTML={{ __html: pixelCode(ads.metaPixelId) }} /> : null}
      </head>
      <body>
        {ads?.metaPixelId ? (
          <noscript><img height={1} width={1} style={{ display: "none" }} alt="" src={pixelNoscript(ads.metaPixelId)} /></noscript>
        ) : null}
        {children}
        <Tracker />
      </body>
    </html>
  );
}
