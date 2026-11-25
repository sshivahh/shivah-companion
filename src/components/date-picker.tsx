"use client";

import { useState } from "react";
import { EN_MONTHS, addMonths, daysInMonth, monthKey, parseYmd, toYmd, weekday } from "@/lib/dates";
import { IconChevron } from "./icons";

const WEEK_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

/** Month calendar for choosing a single day. */
export function DatePicker({
  value,
  today,
  onChange,
  marks,
}: {
  value: string;
  today: string;
  onChange: (ymd: string) => void;
  /** Student colors already logged on each day. */
  marks?: Map<string, string[]>;
}) {
  const [month, setMonth] = useState(monthKey(value || today));
  const [y, m] = month.split("-").map(Number);
  const days = Array.from({ length: daysInMonth(y, m) }, (_, i) => toYmd(y, m, i + 1));
  const lead = (weekday(days[0]) + 6) % 7;

  return (
    <div className="px-2 pt-1 pb-3">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[17px] font-semibold">
          {EN_MONTHS[m - 1]} <span className="font-normal text-pencil">{y}</span>
        </span>
        <span className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-rule/50">
            <IconChevron className="h-5 w-5 rotate-180" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-rule/50">
            <IconChevron className="h-5 w-5" />
          </button>
        </span>
      </div>
      <div className="grid grid-cols-7 text-center text-[13px] text-pencil">
        {WEEK_LETTERS.map((d, i) => (
          <span key={i} className="py-1.5">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {days.map((d) => {
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={selected}
              aria-label={d}
              className="flex h-11 flex-col items-center justify-start pt-0.5"
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-[17px] tabular-nums ${
                  selected ? "bg-ink font-semibold text-paper" : d === today ? "font-bold ring-[1.5px] ring-ink" : "hover:bg-rule/50"
                }`}
              >
                {parseYmd(d).d}
              </span>
              <span className="mt-0.5 flex h-1 gap-0.5" aria-hidden>
                {(marks?.get(d) ?? []).slice(0, 3).map((c, i) => (
                  <span key={i} className="h-1 w-1.5 rounded-full" style={{ background: c }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
