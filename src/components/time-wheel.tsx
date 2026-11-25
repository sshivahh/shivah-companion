"use client";

import { useRef } from "react";

const ROW = 40; // px per row
const VISIBLE = 5; // rows shown; the middle one is selected

function Wheel({ values, value, onChange, label }: { values: string[]; value: string; onChange: (v: string) => void; label: string }) {
  const el = useRef<HTMLDivElement | null>(null);
  const settle = useRef<number | undefined>(undefined);

  function onScroll() {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      if (!el.current) return;
      const i = Math.max(0, Math.min(values.length - 1, Math.round(el.current.scrollTop / ROW)));
      if (values[i] !== value) onChange(values[i]);
    }, 90);
  }

  return (
    <div
      ref={(node) => {
        el.current = node;
        // Start scrolled to the current value (once per mount).
        if (node && !node.dataset.ready) {
          node.scrollTop = Math.max(0, values.indexOf(value)) * ROW;
          node.dataset.ready = "1";
        }
      }}
      role="listbox"
      aria-label={label}
      onScroll={onScroll}
      className="no-scrollbar relative z-10 w-16 snap-y snap-mandatory overflow-y-scroll overscroll-contain [mask-image:linear-gradient(transparent,black_35%,black_65%,transparent)]"
      style={{ height: ROW * VISIBLE, paddingBlock: ROW * Math.floor(VISIBLE / 2) }}
    >
      {values.map((v, i) => (
        <button
          key={v}
          type="button"
          role="option"
          aria-selected={v === value}
          onClick={() => el.current?.scrollTo({ top: i * ROW, behavior: "smooth" })}
          className={`flex w-full snap-center items-center justify-center text-[22px] tabular-nums ${
            v === value ? "font-semibold text-ink" : "text-pencil"
          }`}
          style={{ height: ROW }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));

/** iPhone-style hour/minute wheels. Value is "HH:MM". */
export function TimeWheel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hh, mm] = value.split(":");
  const steps = Array.from({ length: 12 }, (_, i) => pad(i * 5));
  // Keep an off-step minute (e.g. 16:07) selectable if a lesson already has one.
  const minutes = steps.includes(mm) ? steps : [...steps, mm].sort();

  return (
    <div className="relative flex items-center justify-center gap-1 py-2">
      <div aria-hidden className="absolute inset-x-4 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-rule/60" />
      <Wheel label="Hour" values={HOURS} value={hh} onChange={(h) => onChange(`${h}:${mm}`)} />
      <span className="relative z-10 text-[22px] font-semibold">:</span>
      <Wheel label="Minute" values={minutes} value={mm} onChange={(m) => onChange(`${hh}:${m}`)} />
    </div>
  );
}
