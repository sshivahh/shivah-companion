"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { endSession, getAccount, requireAuth, startSession } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from "@/lib/password";
import { isYmd } from "@/lib/dates";
import { STUDENT_COLORS } from "@/lib/colors";
import { isTime } from "@/lib/lessons";

const refresh = () => revalidatePath("/", "layout");

function cleanName(v: unknown) {
  const name = String(v ?? "").trim().slice(0, 40);
  if (!name) throw new Error("Name is required");
  return name;
}

function cleanColor(v: unknown) {
  const c = String(v ?? "");
  return STUDENT_COLORS.includes(c) ? c : STUDENT_COLORS[0];
}

type LessonInput = { date: string; time: string | null; studentIds: string[]; note?: string | null };

const MAX_NOTE = 2000;

function cleanLesson(input: LessonInput) {
  if (!isYmd(input.date)) throw new Error("Pick a valid date");
  const time = input.time ? input.time : null;
  if (time !== null && !isTime(time)) throw new Error("Pick a valid time");
  const studentIds = [...new Set(input.studentIds)];
  if (studentIds.length === 0) throw new Error("Pick at least one student");
  const note = (input.note ?? "").trim();
  if (note.length > MAX_NOTE) throw new Error(`Keep the note under ${MAX_NOTE} characters`);
  return { date: input.date, time, studentIds, note: note || null };
}

// A lesson's note is stored on every student's row for that date/time.
async function insertLesson({ date, time, studentIds, note }: ReturnType<typeof cleanLesson>) {
  for (const studentId of studentIds) {
    const exists = await db.session.findFirst({ where: { studentId, date, time } });
    if (!exists) await db.session.create({ data: { studentId, date, time, note } });
  }
  if (note) await db.session.updateMany({ where: { date, time }, data: { note } });
}

/** Logs one lesson: a session for each student at this date and time. */
export async function logLesson(input: LessonInput) {
  await requireAuth();
  await insertLesson(cleanLesson(input));
  refresh();
}

/** Replaces the lesson at `previous` date/time with the new details. */
export async function updateLesson(previous: { date: string; time: string | null }, input: LessonInput) {
  await requireAuth();
  const next = cleanLesson(input);
  await db.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { date: previous.date, time: previous.time } });
    for (const studentId of next.studentIds) {
      const exists = await tx.session.findFirst({ where: { studentId, date: next.date, time: next.time } });
      if (!exists) await tx.session.create({ data: { studentId, date: next.date, time: next.time, note: next.note } });
    }
    await tx.session.updateMany({ where: { date: next.date, time: next.time }, data: { note: next.note } });
  });
  refresh();
}

export async function deleteLesson(lesson: { date: string; time: string | null }) {
  await requireAuth();
  await db.session.deleteMany({ where: { date: lesson.date, time: lesson.time } });
  refresh();
}

export async function createStudent(name: string, color: string) {
  await requireAuth();
  await db.student.create({ data: { name: cleanName(name), color: cleanColor(color) } });
  refresh();
}

export async function updateStudent(id: string, name: string, color: string) {
  await requireAuth();
  await db.student.update({ where: { id }, data: { name: cleanName(name), color: cleanColor(color) } });
  refresh();
}

export async function setStudentArchived(id: string, archived: boolean) {
  await requireAuth();
  await db.student.update({ where: { id }, data: { archived } });
  refresh();
}

export async function deleteStudent(id: string) {
  await requireAuth();
  await db.student.delete({ where: { id } });
  refresh();
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  let account = await getAccount();

  // First run on a fresh database: accept APP_INITIAL_PASSWORD once and store it hashed.
  const initial = process.env.APP_INITIAL_PASSWORD;
  if (!account && initial && password === initial) {
    account = await db.account.create({ data: { id: 1, passwordHash: await hashPassword(initial) } });
  }
  if (!account) return { error: "No password is set up yet. Run npm run set-password on the server." };

  if (!(await verifyPassword(password, account.passwordHash))) {
    await pause(600); // slow down guessing
    return { error: "That password isn't right. Try again." };
  }
  await startSession(account.passwordHash);
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

type PasswordState = { error?: string; ok?: boolean } | undefined;

export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  await requireAuth();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const account = await getAccount();
  if (!account) return { error: "No account found." };

  if (!(await verifyPassword(current, account.passwordHash))) {
    await pause(600);
    return { error: "Your current password isn't right." };
  }
  if (next.length < MIN_PASSWORD_LENGTH) return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for the new password.` };
  if (next !== confirm) return { error: "The new passwords don't match." };
  if (next === current) return { error: "The new password is the same as the current one." };

  const passwordHash = await hashPassword(next);
  await db.account.update({ where: { id: 1 }, data: { passwordHash } });
  await startSession(passwordHash); // keep this device signed in; other devices are signed out
  return { ok: true };
}
