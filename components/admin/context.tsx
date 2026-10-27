"use client";
import { createContext, useContext } from "react";
import type { Backend } from "@/lib/env";

export type AdminInfo = { mode: Backend; projects: { slug: string; name: string }[] };

const Ctx = createContext<AdminInfo>({ mode: "seed", projects: [] });

export function AdminProvider({ value, children }: { value: AdminInfo; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);
