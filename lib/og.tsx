import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPublicContent } from "@/lib/content/get";
import type { Lang } from "@/lib/content/types";
import { t } from "@/lib/i18n";

export const ogSize = { width: 1200, height: 630 };

/** Link preview card (WhatsApp, LinkedIn): name, headline and the four business lines. */
export async function ogImage(lang: Lang) {
  const c = await getPublicContent();
  const [bold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/schibsted-grotesk-latin-800-normal.woff")),
    readFile(join(process.cwd(), "assets/og/schibsted-grotesk-latin-500-normal.woff")),
  ]);
  const title = t(c.sections.hero.title, lang);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F3F3F1", color: "#151619", padding: "64px 72px", fontFamily: "Shell" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "#151619", color: "#F3F3F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
            {c.settings.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{c.settings.name}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "#5C5F65" }}>{t(c.settings.role, lang)}</div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 80 ? 58 : 66, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.04, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", gap: 14 }}>
          {c.lines.map((l) => (
            <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, border: "2px solid #DADAD6", fontSize: 22, fontWeight: 500 }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, background: l.color }} />
              {t(l.name, lang)}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Shell", data: bold, weight: 800, style: "normal" },
        { name: "Shell", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
