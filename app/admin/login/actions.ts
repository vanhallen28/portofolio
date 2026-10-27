"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkLocalPassword, createLocalSession, LOCAL_COOKIE } from "@/lib/admin/local-session";
import { backend } from "@/lib/env";

export type LoginState = { error: string | null };

function safeNext(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/admin") && !s.startsWith("//") && !s.startsWith("/admin/login") ? s : "/admin";
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const next = safeNext(form.get("next"));
  const password = String(form.get("password") ?? "");
  const b = backend();

  if (b === "local") {
    if (!checkLocalPassword(password)) return { error: "Kata sandi salah." };
    const s = createLocalSession();
    (await cookies()).set(LOCAL_COOKIE, s.value, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.PORTO_LOCAL !== "1", path: "/", maxAge: s.maxAge,
    });
    redirect(next);
  }

  if (b !== "supabase") return { error: "Database belum terhubung, jadi belum bisa masuk. Lihat langkah di bawah." };

  const email = String(form.get("email") ?? "").trim();
  if (!email || !password) return { error: "Isi email dan kata sandi." };
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const db = await createServerSupabase();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (/rate|too many/i.test(msg)) return { error: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi." };
    if (/confirm/i.test(msg)) return { error: "Email ini belum dikonfirmasi. Buka Supabase → Authentication → Users, lalu konfirmasi akunnya." };
    return { error: "Email atau kata sandi salah." };
  }
  const row = await db.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row.data) {
    await db.auth.signOut({ scope: "local" });
    return { error: "Akun ini belum terdaftar sebagai admin. Jalankan perintah insert into public.admins di README langkah 4." };
  }
  redirect(next);
}

export async function logoutAction() {
  const b = backend();
  if (b === "supabase") {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    // Only this browser: signing out on the phone must not end the session on the laptop.
    await (await createServerSupabase()).auth.signOut({ scope: "local" });
  }
  (await cookies()).delete(LOCAL_COOKIE);
  redirect("/admin/login");
}
