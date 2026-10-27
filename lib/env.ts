/** Where content comes from.
 *  - supabase: both public Supabase variables are set (production and normal development).
 *  - local:    no Supabase, not a production build (or PORTO_LOCAL=1) → read/write `.data/content.json`.
 *  - seed:     no Supabase in production → read-only built-in content; admin explains how to connect. */
export type Backend = "supabase" | "local" | "seed";

export function supabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

export function backend(): Backend {
  if (supabaseEnv()) return "supabase";
  if (process.env.PORTO_LOCAL === "1" || process.env.NODE_ENV !== "production") return "local";
  return "seed";
}

export function siteUrl(): string {
  const v = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") || "http://localhost:3000";
  return v.replace(/\/+$/, "");
}
