"use client";
import { useEffect } from "react";
import { initSite } from "@/lib/motion/site";

/** Attaches menu, filters, wall colours and motion to the server-rendered page. */
export function SiteScript({ page }: { page: "home" | "case" }) {
  useEffect(() => initSite(page), [page]);
  return null;
}
