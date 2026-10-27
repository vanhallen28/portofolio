import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backend } from "@/lib/env";
import { LOCAL_COOKIE, verifyLocalSession } from "./local-session";

export type Admin = { email: string };

/** The signed-in admin, or null. Checked again on every admin page and every save. */
export async function getAdmin(): Promise<Admin | null> {
  const b = backend();
  if (b === "local") {
    const jar = await cookies();
    return verifyLocalSession(jar.get(LOCAL_COOKIE)?.value) ? { email: "admin (mode lokal)" } : null;
  }
  if (b !== "supabase") return null;
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const db = await createServerSupabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) return null;
  const row = await db.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (row.error || !row.data) return null;
  return { email: data.user.email ?? "admin" };
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
