"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionDTO, StudentDTO } from "@/lib/data";
import {
  EN_MONTHS,
  addMonths,
  daysInMonth,
  formatIndo,
  monthKey,
  monthLabel,
  monthRange,
  parseYmd,
  toYmd,
  weekday,
  whatsappText,
} from "@/lib/dates";
import { groupLessons } from "@/lib/lessons";
import { CopyButton } from "./copy-button";
import { IconChevron } from "./icons";
import { useLessonDialog } from "./lesson-dialog";

const WEEK_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export function CalendarView({
  month,
  today,
  students,
  sessions,
  initialFilter,
}: {
  month: string;
  today: string;
  students: StudentDTO[];
  sessions: SessionDTO[];
  initialFilter: string | null;
}) {
  const [filter, setFilterState] = useState<string | null>(
    initialFilter && students.some((st) => st.id === initialFilter) ? initialFilter : null,
  );
  const { openDay } = useLessonDialog();

  const setFilter = (id: string | null) => {
    setFilterState(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("s", id);
    else url.searchParams.delete("s");
    window.history.replaceState(null, "", url);
  };

  const { y, m } = monthRange(month);
  const { month: mName, year } = monthLabel(month);
  const days = Array.from({ length: daysInMonth(y, m) }, (_, i) => toYmd(y, m, i + 1));
  const lead = (weekday(days[0]) + 6) % 7; // Monday-first

  // Who was taught on each day (each student once per day, for the dots).
  const byDate = new Map<string, string[]>();
  for (const s of sessions) {
    const ids = byDate.get(s.date) ?? [];
    if (!ids.includes(s.studentId)) byDate.set(s.date, [...ids, s.studentId]);
  }
  const entriesFor = (studentId: string) => sessions.filter((s) => s.studentId === studentId);

  // Active students, plus archived ones that still have lessons this month.
  const visible = students.filter((st) => !st.archived || entriesFor(st.id).length > 0);
  const studentById = new Map(students.map((st) => [st.id, st]));
  const focus = filter ? studentById.get(filter) : null;
  const summaries = (focus ? [focus] : visible).map((st) => ({ st, entries: entriesFor(st.id) }));
  const total = summaries.reduce((a, b) => a + b.entries.length, 0);
  const withLessons = summaries.filter((x) => x.entries.length);
  const copyAll = withLessons.map((x) => whatsappText(x.st.name, month, x.entries)).join("\n\n");
  const lessonsByDate = new Map<string, ReturnType<typeof groupLessons>>();
  for (const l of groupLessons(sessions)) lessonsByDate.set(l.date, [...(lessonsByDate.get(l.date) ?? []), l]);
  const q = filter ? `&s=${filter}` : "";
  const base = "/lessons/calendar";

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
      <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-tight">
          {mName} <span className="font-normal text-pencil">{year}</span>
        </h2>
        <div className="flex items-center gap-1">
          {monthKey(today) !== month && (
            <Link
              href={`${base}?m=${monthKey(today)}${q}`}
              className="mr-1 rounded-full border border-rule bg-surface px-3.5 py-1.5 text-[15px] font-semibold"
            >
              Today
            </Link>
          )}
          <Link href={`${base}?m=${addMonths(month, -1)}${q}`} aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full bg-surface">
            <IconChevron className="h-5 w-5 rotate-180" />
          </Link>
          <Link href={`${base}?m=${addMonths(month, 1)}${q}`} aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full bg-surface">
            <IconChevron className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Who to show */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Show students">
        <FilterChip active={!filter} onClick={() => setFilter(null)}>
          Everyone
        </FilterChip>
        {visible.map((st) => (
          <FilterChip key={st.id} active={filter === st.id} onClick={() => setFilter(st.id)} color={st.color}>
            {st.name}
          </FilterChip>
        ))}
      </div>

      {/* Month grid */}
      <section className="mt-4 rounded-2xl bg-surface px-2 pt-2 pb-3 md:px-3 lg:border lg:border-rule">
        <div className="grid grid-cols-7 text-center text-[13px] text-pencil">
          {WEEK_LETTERS.map((d, i) => (
            <span key={i} className="py-2">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 md:gap-y-0 md:overflow-hidden md:rounded-xl md:border-t md:border-l md:border-rule">
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} aria-hidden className="md:border-r md:border-b md:border-rule md:bg-paper/50" />
          ))}
          {days.map((d) => {
            const dayAll = lessonsByDate.get(d) ?? [];
            const dayLessons = filter ? dayAll.filter((l) => l.studentIds.includes(filter)) : dayAll;
            const ids = (byDate.get(d) ?? []).filter((id) => !filter || id === filter);
            const fill = focus && ids.length ? focus.color : null;
            const isToday = d === today;
            const times = dayLessons.map((l) => l.time).filter((t): t is string => Boolean(t));
            // One label per student per lesson, e.g. "15:00 Gwen".
            const labels = dayLessons.flatMap((l) =>
              l.studentIds.filter((id) => !filter || id === filter).map((id) => ({ key: `${l.key}-${id}`, id, time: l.time })),
            );
            return (
              <button
                key={d}
                type="button"
                onClick={() => openDay(d, dayAll)}
                aria-label={`${formatIndo(d)}, ${dayAll.length ? `${dayAll.length} lesson${dayAll.length === 1 ? "" : "s"}` : "no lessons"}`}
                className="flex h-16 flex-col items-center pt-1.5 md:h-28 md:items-stretch md:border-r md:border-b md:border-rule md:px-2 md:pt-2 md:hover:bg-paper/60"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[17px] tabular-nums md:self-start ${
                    fill
                      ? "font-semibold text-mark-ink"
                      : isToday
                        ? "font-bold ring-[1.5px] ring-ink"
                        : d > today
                          ? "text-pencil/60"
                          : ""
                  }`}
                  style={fill ? { background: fill } : undefined}
                >
                  {parseYmd(d).d}
                </span>

                {/* Phones: colored marks + first lesson time */}
                <span className="mt-1 flex flex-col items-center md:hidden">
                  {!fill && (
                    <span className="flex h-1 gap-0.5">
                      {ids.slice(0, 3).map((id) => (
                        <span key={id} className="h-1 w-2.5 rounded-full" style={{ background: studentById.get(id)?.color }} />
                      ))}
                    </span>
                  )}
                  {times.length > 0 && (
                    <span className="mt-0.5 text-[10px] leading-tight font-semibold text-pencil tabular-nums">
                      {times[0]}
                      {times.length > 1 ? ` +${times.length - 1}` : ""}
                    </span>
                  )}
                </span>

                {/* Desktop: a label per student, with the time */}
                <span className="mt-1 hidden min-w-0 flex-col gap-0.5 md:flex">
                  {labels.slice(0, 2).map(({ key, id, time }) => (
                    <span
                      key={key}
                      className="truncate rounded px-1 text-left text-[12px] font-semibold text-mark-ink"
                      style={{ background: studentById.get(id)?.color }}
                    >
                      {time && <span className="tabular-nums opacity-70">{time} </span>}
                      {studentById.get(id)?.name}
                    </span>
                  ))}
                  {labels.length > 2 && <span className="px-1 text-left text-[12px] text-pencil">+{labels.length - 2} more</span>}
                </span>
              </button>
            );
          })}
          {Array.from({ length: (7 - ((lead + days.length) % 7)) % 7 }, (_, i) => (
            <span key={`a${i}`} aria-hidden className="hidden md:block md:border-r md:border-b md:border-rule md:bg-paper/50" />
          ))}
        </div>
      </section>

      </div>

      {/* Lists to send */}
      <section className="mt-8 lg:mt-0">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[22px] font-bold tracking-tight">
            <span className="tabular-nums">{total}</span> lesson{total === 1 ? "" : "s"}
          </h2>
          {withLessons.length > 1 && <CopyButton text={copyAll} label="Copy all" />}
        </div>

        {summaries.length === 0 && (
          <p className="mt-2 px-1 text-[15px] text-pencil">
            No students yet.{" "}
            <Link href="/lessons/students" className="font-semibold text-ink underline underline-offset-2">
              Add a student
            </Link>
          </p>
        )}

        <div className="mt-3 space-y-3">
          {summaries.map(({ st, entries }) => (
            <article key={st.id} className="rounded-2xl bg-surface px-4 pt-3 pb-4 lg:border lg:border-rule">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex min-w-0 items-center gap-2.5 text-[17px] font-semibold">
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: st.color, boxShadow: "inset 0 0 0 1px rgb(22 33 62 / 0.18)" }}
                  />
                  <span className="truncate">{st.name}</span>
                  <span className="font-normal text-pencil tabular-nums">{entries.length}</span>
                </h3>
                {entries.length > 0 && <CopyButton text={whatsappText(st.name, month, entries)} />}
              </div>
              {entries.length > 0 ? (
                <ol className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[15px] leading-relaxed">
                  {entries.map((e, i) => (
                    <li key={e.id} className="flex gap-2">
                      <span className="w-5 text-right text-pencil tabular-nums">{i + 1}.</span>
                      <span>{formatIndo(e.date)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-1 text-[15px] text-pencil">No lessons in {EN_MONTHS[m - 1]}.</p>
              )}
            </article>
          ))}
        </div>
      </section>


    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[15px] font-semibold ${
        active ? "border-ink bg-ink text-paper" : "border-rule bg-surface text-ink"
      }`}
    >
      {color && <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}
