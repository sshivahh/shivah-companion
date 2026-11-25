"use client";

import Link from "next/link";
import type { SessionDTO, StudentDTO } from "@/lib/data";
import { EN_DAYS, EN_MONTHS, addDays, addMonths, monthKey, parseYmd, relativeLabel, weekStart, weekday } from "@/lib/dates";
import { groupLessons } from "@/lib/lessons";
import { IconChevron, IconSettings } from "./icons";
import { useLessonDialog } from "./lesson-dialog";
import { LessonsTable } from "./lessons-table";
import { ThemeToggle } from "./theme-toggle";

export function HomeView({
  students,
  sessions,
  today,
}: {
  students: StudentDTO[];
  /** From the start of last month onward. */
  sessions: SessionDTO[];
  today: string;
}) {
  const { openNew, openEdit } = useLessonDialog();
  const { d, m } = parseYmd(today);
  const month = monthKey(today);
  const lastMonth = addMonths(month, -1);
  const monthName = EN_MONTHS[m - 1];
  const lastMonthName = EN_MONTHS[Number(lastMonth.slice(5)) - 1];
  const studentById = new Map(students.map((s) => [s.id, s]));

  const thisMonth = sessions.filter((s) => s.date.startsWith(month));
  const prevMonth = sessions.filter((s) => s.date.startsWith(lastMonth));
  const wk = weekStart(today);
  const thisWeek = sessions.filter((s) => s.date >= wk && s.date <= addDays(wk, 6));
  const past = groupLessons(sessions.filter((s) => s.date <= today)).reverse();
  const todays = past.filter((l) => l.date === today).reverse();
  const recent = past.slice(0, 8);
  const active = students.filter((s) => !s.archived);
  const diff = thisMonth.length - prevMonth.length;

  const perStudent = students
    .map((st) => ({ st, n: thisMonth.filter((s) => s.studentId === st.id).length }))
    .filter((x) => !x.st.archived || x.n > 0);
  const max = Math.max(1, ...perStudent.map((x) => x.n));

  return (
    <>
      {/* Phones: feature hub */}
      <div className="pt-3 lg:hidden">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] text-pencil">{EN_DAYS[weekday(today)]}</p>
            <h1 className="text-[34px] leading-tight font-bold tracking-tight md:text-[40px]">
              {d} {monthName}
            </h1>
          </div>
          <div className="mt-1 flex shrink-0 gap-2">
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Settings"
              className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-surface text-ink hover:bg-paper"
            >
              <IconSettings className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
          <section className="overflow-hidden rounded-2xl bg-surface" aria-labelledby="lessons-card">
            <Link href="/lessons" className="flex items-center justify-between px-4 pt-4 pb-1 active:opacity-70">
              <h2 id="lessons-card" className="text-[22px] font-bold tracking-tight">
                Lessons
              </h2>
              <span className="flex items-center gap-0.5 text-[15px] text-pencil">
                <span className="tabular-nums">{thisMonth.length}</span> in {monthName}
                <IconChevron className="h-4 w-4" />
              </span>
            </Link>
            <div className="px-4 pb-4">
              {todays.length === 0 ? (
                <p className="text-[15px] text-pencil">Nothing logged today.</p>
              ) : (
                <ul className="mt-1 space-y-1.5">
                  {todays.map((l) => (
                    <li key={l.key} className="flex items-baseline gap-3 text-[15px]">
                      <span className="w-11 shrink-0 font-semibold tabular-nums">{l.time ?? "–"}</span>
                      <span className="min-w-0">{l.studentIds.map((id) => studentById.get(id)?.name).filter(Boolean).join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => openNew()}
                className="mt-4 w-full rounded-xl bg-ink py-3 text-[17px] font-semibold text-paper active:opacity-80"
              >
                Log a lesson
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Desktop: dashboard */}
      <div className="hidden space-y-6 lg:block">
        <div className="grid grid-cols-4 gap-6">
          <Stat
            label={`Lessons in ${monthName}`}
            value={thisMonth.length}
            note={`${diff > 0 ? "+" : ""}${diff} vs ${lastMonthName}`}
          />
          <Stat label="This week" value={thisWeek.length} note="Monday to Sunday" />
          <Stat label="Active students" value={active.length} note={`${students.length - active.length} archived`} />
          <Stat
            label="Last lesson"
            value={past[0] ? relativeLabel(past[0].date, today) : "None yet"}
            note={past[0] ? past[0].studentIds.map((id) => studentById.get(id)?.name).filter(Boolean).join(", ") : "Log your first lesson"}
          />
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start gap-6">
          <section className="overflow-hidden rounded-2xl border border-rule bg-surface">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-[17px] font-semibold">Recent lessons</h2>
              <Link href="/lessons" className="text-[15px] font-semibold text-pencil hover:text-ink">
                View all
              </Link>
            </div>
            {recent.length ? (
              <div className="border-t border-rule">
                <LessonsTable lessons={recent} studentById={studentById} onEdit={openEdit} />
              </div>
            ) : (
              <p className="border-t border-rule px-5 py-6 text-[15px] text-pencil">No lessons yet. Click a day in the calendar to log one.</p>
            )}
          </section>

          <section className="rounded-2xl border border-rule bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold">{monthName} by student</h2>
              <Link href={`/lessons/calendar?m=${month}`} className="text-[15px] font-semibold text-pencil hover:text-ink">
                Calendar
              </Link>
            </div>
            {perStudent.length === 0 ? (
              <p className="mt-3 text-[15px] text-pencil">
                <Link href="/lessons/students" className="font-semibold text-ink underline underline-offset-2">
                  Add a student
                </Link>{" "}
                to start tracking.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {perStudent.map(({ st, n }) => (
                  <li key={st.id}>
                    <div className="flex items-baseline justify-between text-[15px]">
                      <span className="font-semibold">{st.name}</span>
                      <span className="tabular-nums text-pencil">{n}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                      <div className="h-full rounded-full" style={{ width: `${(n / max) * 100}%`, background: st.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) {
  return (
    <div className="rounded-2xl border border-rule bg-surface p-5">
      <p className="text-[15px] text-pencil">{label}</p>
      <p className="mt-2 truncate text-[30px] leading-tight font-bold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 truncate text-[13px] text-pencil">{note}</p>
    </div>
  );
}
