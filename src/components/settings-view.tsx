"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { changePassword, logout } from "@/app/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-rules";
import { IconChevron, IconLogout } from "./icons";
import { ThemeToggle } from "./theme-toggle";

const input =
  "w-full rounded-xl border border-rule bg-surface px-4 py-3 text-[17px] outline-none placeholder:text-pencil/70 focus:border-ink";

export function SettingsView() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Awaited<ReturnType<typeof changePassword>>, fd: FormData) => {
    const result = await changePassword(prev, fd);
    if (result?.ok) form.current?.reset();
    return result;
  }, undefined);

  return (
    <div className="pt-3 lg:pt-0">
      {/* Phones: header with a way back */}
      <header className="lg:hidden">
        <Link href="/" className="-ml-1 inline-flex items-center gap-0.5 py-1 text-[17px] text-pencil">
          <IconChevron className="h-5 w-5 rotate-180" />
          Home
        </Link>
        <h1 className="mt-1 text-[34px] leading-tight font-bold tracking-tight">Settings</h1>
      </header>

      <div className="mt-6 max-w-xl space-y-6 lg:mt-0">
        <section className="rounded-2xl bg-surface p-5 lg:border lg:border-rule" aria-labelledby="pw">
          <h2 id="pw" className="text-[17px] font-semibold">Password</h2>
          <p className="mt-1 text-[15px] text-pencil">
            Changing it signs out your other devices. This one stays signed in.
          </p>
          <form ref={form} action={action} className="mt-4 space-y-3">
            <input name="current" type="password" required autoComplete="current-password" placeholder="Current password" aria-label="Current password" className={input} />
            <input
              name="next"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              placeholder={`New password (at least ${MIN_PASSWORD_LENGTH} characters)`}
              aria-label="New password"
              className={input}
            />
            <input name="confirm" type="password" required autoComplete="new-password" placeholder="Repeat new password" aria-label="Repeat new password" className={input} />
            {state?.error && (
              <p role="alert" className="px-1 text-[15px] text-red-600 dark:text-red-400">
                {state.error}
              </p>
            )}
            {state?.ok && (
              <p role="status" className="px-1 text-[15px] font-semibold text-emerald-700 dark:text-emerald-400">
                Password changed.
              </p>
            )}
            <button
              disabled={pending}
              className="rounded-xl bg-ink px-5 py-3 text-[17px] font-semibold text-paper hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Changing…" : "Change password"}
            </button>
          </form>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-5 lg:border lg:border-rule">
          <div>
            <h2 className="text-[17px] font-semibold">Theme</h2>
            <p className="mt-1 text-[15px] text-pencil">Switch between light and dark on this device.</p>
          </div>
          <ThemeToggle className="shrink-0" />
        </section>

        <section className="rounded-2xl bg-surface p-5 lg:border lg:border-rule">
          <h2 className="text-[17px] font-semibold">Sign out</h2>
          <p className="mt-1 text-[15px] text-pencil">You&apos;ll need your password to get back in on this device.</p>
          <form action={logout} className="mt-4">
            <button className="inline-flex items-center gap-2 rounded-xl border border-rule px-5 py-3 text-[17px] font-semibold text-red-600 hover:bg-paper dark:text-red-400">
              <IconLogout className="h-5 w-5" />
              Log out
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
