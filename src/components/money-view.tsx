"use client";

import Link from "next/link";
import { useState } from "react";
import type { TransactionDTO } from "@/lib/data";
import { addMonths, monthKey, monthLabel, relativeLabel } from "@/lib/dates";
import { CATEGORIES, findCategory, formatRupiah } from "@/lib/money";
import { IconChevron } from "./icons";
import { TransactionDialog, type TransactionDialogState } from "./transaction-dialog";

export function MoneyView({
  month,
  today,
  transactions,
}: {
  month: string;
  today: string;
  /** This month, newest first. */
  transactions: TransactionDTO[];
}) {
  const [dialog, setDialog] = useState<TransactionDialogState>(null);
  const { month: mName, year } = monthLabel(month);

  const moneyIn = sum(transactions.filter((t) => t.type === "income"));
  const moneyOut = sum(transactions.filter((t) => t.type === "expense"));
  const left = moneyIn - moneyOut;

  // Spending per category, biggest first.
  const spending = CATEGORIES.expense
    .map((c) => ({ c, total: sum(transactions.filter((t) => t.type === "expense" && t.category === c.id)) }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  const biggest = Math.max(1, ...spending.map((s) => s.total));

  // Entries grouped by day, newest day first.
  const days = new Map<string, TransactionDTO[]>();
  for (const t of transactions) days.set(t.date, [...(days.get(t.date) ?? []), t]);

  const isCurrent = monthKey(today) === month;

  return (
    <div>
      {/* Month switcher */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-tight">
          {mName} <span className="font-normal text-pencil">{year}</span>
        </h2>
        <div className="flex items-center gap-1">
          {!isCurrent && (
            <Link href={`/money?m=${monthKey(today)}`} className="mr-1 rounded-full border border-rule bg-surface px-3.5 py-1.5 text-[15px] font-semibold">
              This month
            </Link>
          )}
          <Link href={`/money?m=${addMonths(month, -1)}`} aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-rule/40">
            <IconChevron className="h-5 w-5 rotate-180" />
          </Link>
          <Link href={`/money?m=${addMonths(month, 1)}`} aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-rule/40">
            <IconChevron className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-2xl bg-surface p-5 lg:border lg:border-rule" aria-label={`${mName} summary`}>
            <p className="text-[15px] text-pencil">Left over</p>
            <p
              className={`mt-1 text-[40px] leading-tight font-bold tracking-tight tabular-nums ${
                left < 0 ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              {formatRupiah(left)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-paper px-4 py-3">
                <p className="text-[15px] text-pencil">Money in</p>
                <p className="mt-0.5 truncate text-[20px] font-bold text-emerald-700 tabular-nums dark:text-emerald-400">{formatRupiah(moneyIn)}</p>
              </div>
              <div className="rounded-xl bg-paper px-4 py-3">
                <p className="text-[15px] text-pencil">Money out</p>
                <p className="mt-0.5 truncate text-[20px] font-bold tabular-nums">{formatRupiah(moneyOut)}</p>
              </div>
            </div>
          </section>

          {/* Add buttons (phones) */}
          <AddButtons onAdd={(type) => setDialog({ mode: "new", type })} className="lg:hidden" />

          {/* Spending (phones) */}
          <Spending items={spending} biggest={biggest} total={moneyOut} monthName={mName} className="lg:hidden" />

          {/* Entries */}
          <section>
            <h2 className="mb-2 px-1 text-[17px] font-semibold">Entries</h2>
            {transactions.length === 0 ? (
              <p className="rounded-2xl bg-surface px-5 py-6 text-[15px] text-pencil lg:border lg:border-rule">
                Nothing recorded in {mName} yet. Use <strong className="text-ink">Money in</strong> or{" "}
                <strong className="text-ink">Money out</strong> to add your first entry.
              </p>
            ) : (
              <div className="space-y-5">
                {[...days.entries()].map(([date, list]) => (
                  <div key={date}>
                    <h3 className="mb-1.5 px-1 text-[15px] font-semibold text-pencil">{relativeLabel(date, today)}</h3>
                    <ul className="overflow-hidden rounded-2xl bg-surface lg:border lg:border-rule">
                      {list.map((t, i) => {
                        const c = findCategory(t.type, t.category);
                        const isIn = t.type === "income";
                        return (
                          <li key={t.id} className={i > 0 ? "border-t border-rule" : ""}>
                            <button
                              type="button"
                              onClick={() => setDialog({ mode: "edit", tx: t })}
                              className="flex min-h-15 w-full items-center gap-3.5 px-4 py-2.5 text-left hover:bg-rule/25 active:opacity-70"
                            >
                              <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[17px] font-semibold">{c.label}</span>
                                {t.note && <span className="block truncate text-[15px] text-pencil">{t.note}</span>}
                              </span>
                              <span
                                className={`shrink-0 text-[17px] font-semibold tabular-nums ${
                                  isIn ? "text-emerald-700 dark:text-emerald-400" : ""
                                }`}
                              >
                                {isIn ? "+" : "−"}
                                {formatRupiah(t.amount)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Desktop side column */}
        <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block">
          <AddButtons onAdd={(type) => setDialog({ mode: "new", type })} />
          <Spending items={spending} biggest={biggest} total={moneyOut} monthName={mName} />
        </aside>
      </div>

      <TransactionDialog state={dialog} today={today} onClose={() => setDialog(null)} />
    </div>
  );
}

function sum(list: TransactionDTO[]) {
  return list.reduce((a, t) => a + t.amount, 0);
}

function AddButtons({ onAdd, className = "" }: { onAdd: (type: "income" | "expense") => void; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => onAdd("income")}
        className="rounded-xl border border-rule bg-surface py-3.5 text-[17px] font-semibold text-emerald-700 hover:bg-paper dark:text-emerald-400"
      >
        + Money in
      </button>
      <button type="button" onClick={() => onAdd("expense")} className="rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper hover:opacity-90">
        − Money out
      </button>
    </div>
  );
}

function Spending({
  items,
  biggest,
  total,
  monthName,
  className = "",
}: {
  items: { c: { id: string; label: string; color: string }; total: number }[];
  biggest: number;
  total: number;
  monthName: string;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-surface p-5 lg:border lg:border-rule ${className}`}>
      <h2 className="text-[17px] font-semibold">Where the money went</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-[15px] text-pencil">No spending recorded in {monthName}.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map(({ c, total: t }) => (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-3 text-[15px]">
                <span className="font-semibold">{c.label}</span>
                <span className="tabular-nums">
                  {formatRupiah(t)} <span className="text-pencil">{Math.round((t / total) * 100)}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-paper">
                <div className="h-full rounded-full" style={{ width: `${(t / biggest) * 100}%`, background: c.color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
