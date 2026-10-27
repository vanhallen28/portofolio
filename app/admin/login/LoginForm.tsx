"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ mode, next }: { mode: "supabase" | "local"; next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  return (
    <form action={action} className="adm-login-form" noValidate>
      <input type="hidden" name="next" value={next} />
      {mode === "supabase" ? (
        <label className="adm-field">
          <span className="adm-label">Email</span>
          <input className="adm-input" type="email" name="email" autoComplete="username" required defaultValue="" />
        </label>
      ) : null}
      <label className="adm-field">
        <span className="adm-label">Kata sandi</span>
        <input className="adm-input" type="password" name="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="adm-error" role="alert">{state.error}</p> : null}
      <button className="adm-btn adm-btn-primary adm-btn-block" type="submit" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
