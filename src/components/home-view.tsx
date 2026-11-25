"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionDTO, StudentDTO, TransactionDTO } from "@/lib/data";
import { formatRupiah } from "@/lib/money";
import { EN_DAYS, EN_MONTHS, addDays, addMonths, monthKey, parseYmd, relativeLabel, weekStart, weekday } from "@/lib/dates";
import { groupLessons } from "@/lib/lessons";
import { useLessonDialog } from "./lesson-dialog";
import { LessonRow } from "./lesson-row";
import { LessonsTable } from "./lessons-table";
import { TransactionDialog, type TransactionDialogState } from "./transaction-dialog";

/** Dashboard: the same admin layout on phones (stacked) and desktop (grid). */
export function HomeView({
  students,
  sessions,
  transactions,
  today,
}: {
  students: StudentDTO[];
  /** From the start of last month onward. */
  sessions: SessionDTO[];
  /** This month's money entries. */
  transactions: TransactionDTO[];
  today: string;
}) {
  const { openNew, openEdit } = useLessonDialog();
  const [moneyDialog, setMoneyDialog] = useState<TransactionDialogState>(null);
  const moneyIn = transactions.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const moneyOut = transactions.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const left = moneyIn - moneyOut;

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
  const recent = past.slice(0, 8);
  const active = students.filter((s) => !s.archived);
  const diff = thisMonth.length - prevMonth.length;

  const perStudent = students
    .map((st) => ({ st, n: thisMonth.filter((s) => s.studentId === st.id).length }))
    .filter((x) => !x.st.archived || x.n > 0);
  const max = Math.max(1, ...perStudent.map((x) => x.n));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Phones: today's date under the page title */}
      <p className="-mt-3 text-[15px] text-pencil lg:hidden">
        {EN_DAYS[weekday(today)]}, {d} {monthName}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <Stat label={`Lessons in ${monthName}`} value={thisMonth.length} note={`${diff > 0 ? "+" : ""}${diff} vs ${lastMonthName}`} />
        <Stat label="This week" value={thisWeek.length} note="Monday to Sunday" />
        <Stat label="Active students" value={active.length} note={`${students.length - active.length} archived`} />
        <Stat
          label="Last lesson"
          value={past[0] ? relativeLabel(past[0].date, today) : "None yet"}
          note={past[0] ? past[0].studentIds.map((id) => studentById.get(id)?.name).filter(Boolean).join(", ") : "Log your first lesson"}
        />
      </div>

      {/* Phones: quick actions */}
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        <QuickAction onClick={() => openNew()} primary>
          Log a lesson
        </QuickAction>
        <QuickAction onClick={() => setMoneyDialog({ mode: "new", type: "income" })} tone="in">
          + Money in
        </QuickAction>
        <QuickAction onClick={() => setMoneyDialog({ mode: "new", type: "expense" })}>− Money out</QuickAction>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* Right column on desktop; on phones its cards join the main flow (money first, students last) */}
        <div className="contents lg:col-start-2 lg:row-start-1 lg:block lg:space-y-6">
        {/* Money (first on phones, right column on desktop) */}
        <section className="order-1 rounded-2xl border border-rule bg-surface p-5" aria-label={`${monthName} money`}>
          <CardHeader title={`${monthName} money`} href="/money" link="Open" />
          <p className="mt-3 text-[15px] text-pencil">Left over</p>
          <p className={`text-[30px] leading-tight font-bold tracking-tight tabular-nums ${left < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
            {formatRupiah(left)}
          </p>
          <dl className="mt-3 space-y-1.5 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-pencil">Money in</dt>
              <dd className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">{formatRupiah(moneyIn)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-pencil">Money out</dt>
              <dd className="font-semibold tabular-nums">{formatRupiah(moneyOut)}</dd>
            </div>
          </dl>
        </section>


        {/* Lessons by student */}
        <section className="order-3 rounded-2xl border border-rule bg-surface p-5">
          <CardHeader title={`${monthName} by student`} href={`/lessons/calendar?m=${month}`} link="Calendar" />
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

        {/* Recent lessons */}
        <section className="order-2 overflow-hidden rounded-2xl border border-rule bg-surface lg:col-start-1 lg:row-start-1">
          <div className="px-5 py-4">
            <CardHeader title="Recent lessons" href="/lessons" link="View all" />
          </div>
          {recent.length === 0 ? (
            <p className="border-t border-rule px-5 py-6 text-[15px] text-pencil">No lessons yet. Use Log a lesson to add one.</p>
          ) : (
            <>
              <ul className="border-t border-rule lg:hidden">
                {recent.slice(0, 5).map((l, i) => (
                  <li key={l.key} className={i > 0 ? "border-t border-rule" : ""}>
                    <div className="px-1">
                      <p className="px-4 pt-2.5 text-[13px] font-semibold text-pencil">{relativeLabel(l.date, today)}</p>
                      <LessonRow lesson={l} studentById={studentById} onOpen={() => openEdit(l)} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden border-t border-rule lg:block">
                <LessonsTable lessons={recent} studentById={studentById} onEdit={openEdit} />
              </div>
            </>
          )}
        </section>
      </div>

      <TransactionDialog state={moneyDialog} today={today} onClose={() => setMoneyDialog(null)} />
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-rule bg-surface p-4 lg:p-5">
      <p className="truncate text-[13px] text-pencil lg:text-[15px]">{label}</p>
      <p className="mt-1.5 truncate text-[24px] leading-tight font-bold tracking-tight tabular-nums lg:mt-2 lg:text-[30px]">{value}</p>
      <p className="mt-1 truncate text-[13px] text-pencil">{note}</p>
    </div>
  );
}

function CardHeader({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <Link href={href} className="text-[15px] font-semibold text-pencil hover:text-ink">
        {link}
      </Link>
    </div>
  );
}

function QuickAction({
  onClick,
  primary,
  tone,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  tone?: "in";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-3 text-[15px] font-semibold active:opacity-80 ${
        primary
          ? "bg-ink text-paper"
          : `border border-rule bg-surface ${tone === "in" ? "text-emerald-700 dark:text-emerald-400" : "text-ink"}`
      }`}
    >
      {children}
    </button>
  );
}
