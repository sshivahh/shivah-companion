import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "./db";

export const SESSION_COOKIE = "sc_session";
const MAX_AGE = 60 * 60 * 24 * 365; // stay signed in for a year on a device

// The signing key includes the current password hash, so changing the
// password invalidates every existing session at once.
function sign(passwordHash: string, payload: string) {
  return createHmac("sha256", `${process.env.AUTH_SECRET ?? ""}|${passwordHash}`).update(payload).digest("base64url");
}

export function getAccount() {
  return db.account.findUnique({ where: { id: 1 } });
}

export async function startSession(passwordHash: string) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(SESSION_COOKIE, `${exp}.${sign(passwordHash, exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Checked once per request. */
export const isAuthed = cache(async () => {
  await connection(); // per-request check (reads cookies and the clock)
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const account = await getAccount();
  if (!account) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(account.passwordHash, exp));
  return a.length === b.length && timingSafeEqual(a, b);
});

/** For server actions. */
export async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Your session has ended. Sign in again.");
}

/** For pages and data loading: sends you to the login page. */
export async function requirePageAuth() {
  if (!(await isAuthed())) redirect("/login");
}
