import "./styles/site.css";
import type { Metadata } from "next";
import { NotFound } from "@/components/site/NotFound";
import { siteUrl } from "@/lib/env";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = { metadataBase: new URL(siteUrl()), title: "404", robots: { index: false } };

/** Any URL that matches no route at all (the site has several root layouts). */
export default function GlobalNotFound() {
  return (
    <html lang="id" className={fontVariables}>
      <body>
        <NotFound lang="id" />
      </body>
    </html>
  );
}
