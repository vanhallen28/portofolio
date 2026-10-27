import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCAL_COOKIE, verifyLocalSession } from "@/lib/admin/local-session";
import { backend, supabaseEnv } from "@/lib/env";

/* Guards /admin: refreshes the Supabase session cookie and sends visitors without a session to the
   login page. Pages and server actions check admin rights again (requireAdmin), so this is the
   first gate, not the only one. */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  let response = NextResponse.next({ request });
  let signedIn = false;

  const b = backend();
  const env = supabaseEnv();
  if (b === "supabase" && env) {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookieOptions: { secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    signedIn = !!data?.claims?.sub;
  } else if (b === "local") {
    signedIn = verifyLocalSession(request.cookies.get(LOCAL_COOKIE)?.value);
  }

  const go = (path: string) => {
    const r = NextResponse.redirect(new URL(path, request.url));
    for (const c of response.cookies.getAll()) r.cookies.set(c);
    return r;
  };
  if (!signedIn && !isLogin) return go(`/admin/login?next=${encodeURIComponent(pathname + search)}`);
  // A signed-in user on /admin/login is NOT bounced to /admin here: the login page itself checks
  // admin rights with Supabase (getUser + admins), so a revoked or non-admin session can still sign in again.

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
