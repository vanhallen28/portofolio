"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; group?: string; dot?: string };

export function AdminNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Menu admin">
      {items.map((it, i) => {
        const head = it.group && it.group !== items[i - 1]?.group ? <span className="adm-nav-group">{it.group}</span> : null;
        const exact = it.href === "/admin" || it.href === "/admin/projects";
        const current = exact ? path === it.href : path === it.href || path.startsWith(`${it.href}/`);
        return (
          <span key={it.href} style={{ display: "contents" }}>
            {head}
            <Link href={it.href} aria-current={current ? "page" : undefined}>
              {it.dot ? <i className="ldot" style={{ background: it.dot }} /> : null}
              {it.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
