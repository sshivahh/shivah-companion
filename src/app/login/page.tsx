"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="pt-safe mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <span aria-hidden className="grid h-12 w-12 place-items-center rounded-xl bg-ink">
        <span className="h-3.5 w-7 rounded-sm bg-[#ffe04d]" />
      </span>
      <h1 className="mt-6 text-[34px] leading-tight font-bold tracking-tight">sshivahh</h1>
      <p className="mt-1 text-[17px] text-pencil">Enter your password to continue.</p>
      <form action={action} className="mt-8 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          aria-invalid={Boolean(state?.error)}
          className="w-full rounded-xl border border-rule bg-surface px-4 py-3.5 text-[17px] outline-none focus:border-ink"
        />
        {state?.error && (
          <p role="alert" className="px-1 text-[15px] text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          disabled={pending}
          className="w-full rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
