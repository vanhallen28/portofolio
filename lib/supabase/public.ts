import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/env";

/** Anonymous client without cookies — safe inside the shared content cache. RLS limits it to published content. */
export function createPublicSupabase(): SupabaseClient {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase belum dikonfigurasi");
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
