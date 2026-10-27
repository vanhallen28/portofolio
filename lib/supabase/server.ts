import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { supabaseEnv } from "@/lib/env";

/** Per-request client carrying the admin's session cookie (server components, server actions). */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase belum dikonfigurasi");
  const store = await cookies();
  const secure = (await headers()).get("x-forwarded-proto") === "https" || process.env.VERCEL === "1";
  return createServerClient(env.url, env.anonKey, {
    cookieOptions: { secure, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
