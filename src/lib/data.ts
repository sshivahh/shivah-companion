import "server-only";
import { connection } from "next/server";
import { db } from "./db";
import { requirePageAuth } from "./auth";
import { todayYmd } from "./dates";

export type StudentDTO = { id: string; name: string; color: string; archived: boolean };
export type SessionDTO = { id: string; date: string; time: string | null; studentId: string; note: string | null };

const studentSelect = { id: true, name: true, color: true, archived: true } as const;

export async function getStudents({ includeArchived = false } = {}): Promise<StudentDTO[]> {
  await connection();
  await requirePageAuth();
  return db.student.findMany({
    where: includeArchived ? undefined : { archived: false },
    orderBy: [{ archived: "asc" }, { createdAt: "asc" }],
    select: studentSelect,
  });
}

export async function getSessionsBetween(start: string, end: string): Promise<SessionDTO[]> {
  await connection();
  await requirePageAuth();
  return db.session.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "asc" }],
    select: { id: true, date: true, time: true, studentId: true, note: true },
  });
}

export async function getTotals() {
  await connection();
  await requirePageAuth();
  const rows = await db.session.groupBy({ by: ["studentId"], _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.studentId, r._count._all])) as Record<string, number>;
}

/** Today's date in the app timezone, evaluated per request. */
export async function getToday() {
  await connection();
  await requirePageAuth();
  return todayYmd();
}
