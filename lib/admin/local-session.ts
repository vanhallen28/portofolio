import { createHmac, timingSafeEqual } from "node:crypto";

/* Sign-in for development without Supabase: one password from ADMIN_LOCAL_PASSWORD,
   remembered in an HMAC-signed cookie. Never used when Supabase is configured. */

export const LOCAL_COOKIE = "porto_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export function localPassword(): string | null {
  const p = process.env.ADMIN_LOCAL_PASSWORD?.trim();
  if (p) return p;
  return process.env.NODE_ENV === "production" ? null : "portofolio-lokal";
}

function secret(): string {
  return `${process.env.ADMIN_LOCAL_SECRET ?? ""}:${localPassword() ?? ""}:porto-local-session`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkLocalPassword(input: string): boolean {
  const p = localPassword();
  return !!p && same(input, p);
}

export function createLocalSession(now = Date.now()): { value: string; maxAge: number } {
  const exp = Math.floor(now / 1000) + MAX_AGE;
  return { value: `${exp}.${sign(String(exp))}`, maxAge: MAX_AGE };
}

export function verifyLocalSession(token: string | undefined, now = Date.now()): boolean {
  if (!token || !localPassword()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (+exp < Math.floor(now / 1000)) return false;
  return same(sig, sign(exp));
}
