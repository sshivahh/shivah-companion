"use client";

import Link from "next/link";
import type { SessionDTO, StudentDTO } from "@/lib/data";
import { EN_MONTHS, monthKey, parseYmd, relativeLabel } from "@/lib/dates";
import { groupLessons, type Lesson } from "@/lib/lessons";
import { IconChevron } from "./icons";
import { useLessonDialog } from "./lesson-dialog";
import { LessonRow } from "./lesson-row";
import { LessonsTable } from "./lessons-table";

export function AgendaView({
  students,
  sessions,
  today,
}: {
  students: StudentDTO[];
  sessions: SessionDTO[];
  today: string;
}) {
  const { openNew, openEdit } = useLessonDialog();
  const studentById = new Map(students.map((s) => [s.id, s]));
  const newestFirst = groupLessons(sessions).reverse();

  // Phones: grouped by day, lessons within a day in time order.
  const days = new Map<string, Lesson[]>();
  for (const l of groupLessons(sessions)) days.set(l.date, [...(days.get(l.date) ?? []), l]);
  const ordered = [...days.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  // This month per student, for the desktop side panel.
  const month = monthKey(today);
  const monthName = EN_MONTHS[parseYmd(today).m - 1];
  const counts = students
    .map((st) => ({ st, n: sessions.filter((s) => s.studentId === st.id && s.date.startsWith(month)).length }))
    .filter((c) => !c.st.archived || c.n > 0);
  const monthTotal = counts.reduce((a, c) => a + c.n, 0);

  const empty = (
    <p className="px-1 text-[15px] text-pencil">
      {students.length === 0 ? "Add your students first, then log your lessons here." : "No lessons in the last 90 days."}
    </p>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-6">
      {/* Phones */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => openNew()}
          className="w-full rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper active:opacity-80 md:w-auto md:px-6 md:py-3"
        >
          Log a lesson
        </button>
        <div className="mt-6 space-y-6">
          {ordered.length === 0
            ? empty
            : ordered.map(([date, lessons]) => (
                <section key={date}>
                  <h2 className="mb-2 px-1 text-[15px] font-semibold text-pencil">{relativeLabel(date, today)}</h2>
                  <ul className="overflow-hidden rounded-2xl bg-surface">
                    {lessons.map((l, i) => (
                      <li key={l.key} className={i > 0 ? "border-t border-rule" : ""}>
                        <LessonRow lesson={l} studentById={studentById} onOpen={() => openEdit(l)} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
        </div>
      </div>

      {/* Desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-rule bg-surface lg:block">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="flex items-baseline gap-3 text-[17px] font-semibold">
            Last 90 days
            <span className="text-[15px] font-normal text-pencil tabular-nums">
              {newestFirst.length} lesson{newestFirst.length === 1 ? "" : "s"}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => openNew()}
            className="rounded-lg bg-ink px-4 py-2 text-[15px] font-semibold text-paper hover:opacity-90"
          >
            Log a lesson
          </button>
        </div>
        <div className="border-t border-rule">
          {newestFirst.length ? (
            <LessonsTable lessons={newestFirst} studentById={studentById} onEdit={openEdit} />
          ) : (
            <div className="px-5 py-6">{empty}</div>
          )}
        </div>
      </section>

      <aside className="sticky top-24 hidden rounded-2xl border border-rule bg-surface p-5 lg:block" aria-label={`${monthName} so far`}>
        <h2 className="text-[17px] font-semibold">{monthName} so far</h2>
        <p className="mt-1 text-[34px] leading-tight font-bold tabular-nums">
          {monthTotal} <span className="text-[17px] font-normal text-pencil">lesson{monthTotal === 1 ? "" : "s"}</span>
        </p>
        <ul className="mt-4 space-y-2.5">
          {counts.map(({ st, n }) => (
            <li key={st.id} className="flex items-center gap-3 text-[15px]">
              <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ background: st.color }} />
              <span className="min-w-0 flex-1 truncate">{st.name}</span>
              <span className="tabular-nums text-pencil">{n}</span>
            </li>
          ))}
        </ul>
        <Link href={`/lessons/calendar?m=${month}`} className="mt-5 flex items-center gap-0.5 text-[15px] font-semibold hover:underline">
          Open calendar <IconChevron className="h-4 w-4" />
        </Link>
      </aside>
    </div>
  );
}
