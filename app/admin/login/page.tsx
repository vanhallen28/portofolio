import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { backend } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/admin" } = await searchParams;
  const b = backend();
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <p className="adm-kicker">Panel admin</p>
        <h1>Masuk untuk mengubah isi portofolio</h1>
        {b === "seed" ? (
          <div className="adm-callout">
            <p><b>Database belum terhubung.</b> Situs tampil dengan isi awal dan belum bisa diubah.</p>
            <ol>
              <li>Di Vercel → Project → Settings → Environment Variables, isi <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
              <li>Deploy ulang (Deployments → ⋯ → Redeploy).</li>
              <li>Buka halaman ini lagi.</li>
            </ol>
          </div>
        ) : (
          <>
            {b === "local" ? <p className="adm-muted">Mode pengembangan tanpa Supabase. Kata sandinya dari <code>ADMIN_LOCAL_PASSWORD</code>.</p> : null}
            <LoginForm mode={b} next={next} />
          </>
        )}
      </div>
    </main>
  );
}
