"use client";

import { useState, useTransition } from "react";
import { deleteTransaction, saveTransaction } from "@/app/actions";
import type { TransactionDTO } from "@/lib/data";
import { EN_DAYS, EN_MONTHS, parseYmd, relativeLabel, weekday } from "@/lib/dates";
import { CATEGORIES, type MoneyType, formatNumber, parseAmount } from "@/lib/money";
import { DatePicker } from "./date-picker";
import { Modal } from "./modal";

export type TransactionDialogState = { mode: "new"; type: MoneyType } | { mode: "edit"; tx: TransactionDTO } | null;

export function TransactionDialog({
  state,
  today,
  onClose,
}: {
  state: TransactionDialogState;
  today: string;
  onClose: () => void;
}) {
  const title =
    state?.mode === "edit" ? "Edit entry" : state?.type === "income" ? "Money in" : "Money out";
  return (
    <Modal open={state !== null} onClose={onClose} closeLabel="Cancel" title={title}>
      {state && <TransactionForm key={state.mode === "edit" ? state.tx.id : state.type} state={state} today={today} onDone={onClose} />}
    </Modal>
  );
}

const QUICK_ADD = [10_000, 50_000, 100_000];

function TransactionForm({
  state,
  today,
  onDone,
}: {
  state: NonNullable<TransactionDialogState>;
  today: string;
  onDone: () => void;
}) {
  const editing = state.mode === "edit" ? state.tx : null;
  const [type, setType] = useState<MoneyType>(editing?.type ?? (state.mode === "new" ? state.type : "expense"));
  const [amount, setAmount] = useState(editing?.amount ?? 0);
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[type][0].id);
  const [date, setDate] = useState(editing?.date ?? today);
  const [note, setNote] = useState(editing?.note ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function switchType(next: MoneyType) {
    setType(next);
    if (!CATEGORIES[next].some((c) => c.id === category)) setCategory(CATEGORIES[next][0].id);
  }

  function save() {
    setError(null);
    start(async () => {
      try {
        await saveTransaction({ date, type, amount, category, note }, editing?.id);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
      }
    });
  }

  function remove() {
    if (!editing || !confirm("Delete this entry?")) return;
    start(async () => {
      await deleteTransaction(editing.id);
      onDone();
    });
  }

  const { d, m } = parseYmd(date);
  const rel = relativeLabel(date, today);
  const dayName = ["Today", "Yesterday", "Tomorrow"].includes(rel) ? rel : EN_DAYS[weekday(date)];
  const dateLabel = `${dayName}, ${d} ${EN_MONTHS[m - 1]}`;
  const isIn = type === "income";

  return (
    <div className="space-y-5">
      {/* In / out */}
      <div className="grid grid-cols-2 rounded-xl bg-rule/70 p-0.5" role="radiogroup" aria-label="Type">
        {(["income", "expense"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => switchType(t)}
            className={`rounded-[10px] py-2 text-[15px] font-semibold ${type === t ? "bg-surface text-ink shadow-sm" : "text-pencil"}`}
          >
            {t === "income" ? "Money in" : "Money out"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="rounded-2xl bg-surface px-4 pt-3 pb-4">
        <label htmlFor="amount" className="text-[15px] text-pencil">
          Amount
        </label>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-pencil">Rp</span>
          <input
            id="amount"
            inputMode="numeric"
            autoComplete="off"
            autoFocus={!editing}
            value={amount ? formatNumber(amount) : ""}
            onChange={(e) => setAmount(parseAmount(e.target.value))}
            placeholder="0"
            className={`w-full min-w-0 bg-transparent text-[34px] leading-tight font-bold tabular-nums outline-none placeholder:text-pencil/40 ${
              isIn ? "text-emerald-700 dark:text-emerald-400" : ""
            }`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ADD.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount((a) => Math.min(a + q, 2_000_000_000))}
              className="rounded-full border border-rule px-3 py-1.5 text-[15px] font-semibold tabular-nums hover:bg-paper"
            >
              +{formatNumber(q)}
            </button>
          ))}
          {amount > 0 && (
            <button type="button" onClick={() => setAmount(0)} className="rounded-full px-3 py-1.5 text-[15px] text-pencil hover:bg-paper">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-2 px-1 text-[15px] font-semibold text-pencil">Category</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
          {CATEGORIES[type].map((c) => {
            const on = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[15px] font-semibold ${
                  on ? "border-transparent text-mark-ink" : "border-rule bg-surface hover:bg-paper"
                }`}
                style={on ? { background: c.color } : undefined}
              >
                {!on && <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date + note */}
      <div className="overflow-hidden rounded-2xl bg-surface">
        <button
          type="button"
          aria-expanded={dateOpen}
          onClick={() => setDateOpen(!dateOpen)}
          className="flex min-h-13 w-full items-center justify-between gap-3 px-4 text-left text-[17px]"
        >
          <span>Date</span>
          <span className="font-semibold">{dateLabel}</span>
        </button>
        {dateOpen && (
          <div className="border-t border-rule">
            <DatePicker
              value={date}
              today={today}
              onChange={(v) => {
                setDate(v);
                setDateOpen(false);
              }}
            />
          </div>
        )}
        <div className="border-t border-rule">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="Note (optional)"
            aria-label="Note"
            className="w-full bg-transparent px-4 py-3.5 text-[17px] outline-none placeholder:text-pencil/70"
          />
        </div>
      </div>

      {error && <p className="px-1 text-[15px] text-red-600 dark:text-red-400">{error}</p>}

      <div className="space-y-2">
        <button
          type="button"
          onClick={save}
          disabled={pending || amount <= 0}
          className="w-full rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper hover:opacity-90 disabled:opacity-30"
        >
          {pending ? "Saving…" : editing ? "Save changes" : isIn ? "Add money in" : "Add money out"}
        </button>
        {amount <= 0 && <p className="text-center text-[13px] text-pencil">Enter an amount to continue.</p>}
        {editing && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="w-full rounded-xl py-3 text-[17px] font-semibold text-red-600 hover:bg-red-500/5 dark:text-red-400"
          >
            Delete entry
          </button>
        )}
      </div>
    </div>
  );
}
