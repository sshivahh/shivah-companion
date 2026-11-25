"use client";

import Link from "next/link";
import type { StudentDTO } from "@/lib/data";
import { IconCheck } from "./icons";

/**
 * Students as rows in a register. Marking a lesson sweeps the row
 * with that student's highlighter color.
 */
export function Register({
  students,
  isLogged,
  onToggle,
  meta,
}: {
  students: StudentDTO[];
  isLogged: (studentId: string) => boolean;
  onToggle: (studentId: string) => void;
  meta?: (studentId: string) => string;
}) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl bg-surface px-5 py-6">
        <p className="text-[17px] font-semibold">No students yet</p>
        <p className="mt-1 text-[15px] text-pencil">Add the people you teach, then mark their lessons here.</p>
        <Link
          href="/lessons/students"
          className="mt-4 inline-flex rounded-xl bg-ink px-4 py-2.5 text-[15px] font-semibold text-paper"
        >
          Add a student
        </Link>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl bg-surface">
      {students.map((s, i) => {
        const on = isLogged(s.id);
        return (
          <li key={s.id} className={i > 0 ? "border-t border-rule" : ""}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onToggle(s.id)}
              className="relative flex min-h-15 w-full items-center gap-3.5 px-4 text-left active:opacity-80"
            >
              <span
                aria-hidden
                className={`absolute inset-0 origin-left transition-transform duration-300 ease-out ${
                  on ? "scale-x-100" : "scale-x-0"
                }`}
                style={{ background: s.color }}
              />
              <span
                aria-hidden
                className={`relative h-3 w-3 shrink-0 rounded-full transition-opacity ${on ? "opacity-0" : ""}`}
                style={{ background: s.color, boxShadow: "inset 0 0 0 1px rgb(22 33 62 / 0.18)" }}
              />
              <span className={`relative min-w-0 flex-1 truncate text-[17px] font-semibold ${on ? "text-mark-ink" : ""}`}>
                {s.name}
              </span>
              {meta && (
                <span className={`relative text-[13px] tabular-nums ${on ? "text-mark-ink/70" : "text-pencil"}`}>
                  {meta(s.id)}
                </span>
              )}
              <span
                aria-hidden
                className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors ${
                  on ? "bg-mark-ink text-white" : "border-[1.5px] border-pencil/50 text-transparent"
                }`}
              >
                <IconCheck className="h-3.5 w-3.5" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
