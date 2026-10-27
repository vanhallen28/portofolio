import Link from "next/link";
import type { Lang } from "@/lib/content/types";
import { homePath } from "@/lib/i18n";
import { ui } from "@/lib/ui";

export function NotFound({ lang }: { lang: Lang }) {
  const u = ui(lang);
  return (
    <main id="isi" className="not-found">
      <h1>{u.notFoundTitle}</h1>
      <p>{u.notFoundText}</p>
      <Link className="btn" href={homePath(lang)}>{u.notFoundCta}</Link>
    </main>
  );
}
