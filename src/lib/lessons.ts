import type { SessionDTO } from "./data";

/** A lesson is everyone taught at the same date and time. */
export type Lesson = { key: string; date: string; time: string | null; studentIds: string[]; note: string | null };

export function lessonKey(date: string, time: string | null) {
  return `${date}|${time ?? ""}`;
}

/** Groups per-student sessions into lessons, sorted oldest first. */
export function groupLessons(sessions: SessionDTO[]): Lesson[] {
  const map = new Map<string, Lesson>();
  for (const s of sessions) {
    const key = lessonKey(s.date, s.time);
    const lesson = map.get(key) ?? { key, date: s.date, time: s.time, studentIds: [], note: null };
    lesson.studentIds.push(s.studentId);
    lesson.note ??= s.note;
    map.set(key, lesson);
  }
  // By date, then time; lessons without a time go after timed ones on the same day.
  return [...map.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.time ?? "99:99").localeCompare(b.time ?? "99:99"),
  );
}

export function isTime(s: unknown): s is string {
  return typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}
