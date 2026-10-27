"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser client for the admin (image uploads go straight to Storage with the admin's session). */
export function browserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase belum dikonfigurasi");
  client ??= createBrowserClient(url, key, { cookieOptions: { secure: window.location.protocol === "https:", sameSite: "lax", path: "/" } });
  return client;
}
