"use client";

import type { StudentDTO } from "@/lib/data";
import { EN_MONTHS, ID_DAYS, parseYmd, weekday } from "@/lib/dates";
import type { Lesson } from "@/lib/lessons";

/** Desktop table of lessons, newest first. */
export function LessonsTable({
  lessons,
  studentById,
  onEdit,
}: {
  lessons: Lesson[];
  studentById: Map<string, StudentDTO>;
  onEdit: (lesson: Lesson) => void;
}) {
  return (
    <table className="w-full text-left text-[15px]">
      <thead>
        <tr className="border-b border-rule text-[13px] text-pencil">
          <th scope="col" className="px-5 py-3 font-semibold">Date</th>
          <th scope="col" className="px-5 py-3 font-semibold">Day</th>
          <th scope="col" className="px-5 py-3 font-semibold">Time</th>
          <th scope="col" className="px-5 py-3 font-semibold">Students</th>
          <th scope="col" className="w-full px-5 py-3 font-semibold">Notes</th>
          <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {lessons.map((l) => {
          const { d, m, y } = parseYmd(l.date);
          return (
            <tr key={l.key} className="border-b border-rule last:border-0 hover:bg-rule/20">
              <td className="whitespace-nowrap px-5 py-3.5 font-semibold tabular-nums">
                {d} {EN_MONTHS[m - 1].slice(0, 3)} {y}
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-pencil">{ID_DAYS[weekday(l.date)]}</td>
              <td className={`px-5 py-3.5 tabular-nums ${l.time ? "" : "text-pencil"}`}>{l.time ?? "–"}</td>
              <td className="px-5 py-3">
                <span className="flex gap-1.5 whitespace-nowrap">
                  {l.studentIds.map((id) => {
                    const st = studentById.get(id);
                    if (!st) return null;
                    return (
                      <span key={id} className="rounded-md px-2 py-0.5 text-[13px] font-semibold text-mark-ink" style={{ background: st.color }}>
                        {st.name}
                      </span>
                    );
                  })}
                </span>
              </td>
              <td className="max-w-0 px-5 py-3.5">
                {l.note ? (
                  <span className="block truncate" title={l.note}>
                    {l.note}
                  </span>
                ) : (
                  <span className="text-pencil">–</span>
                )}
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(l)}
                  className="rounded-lg border border-rule px-3 py-1.5 text-[13px] font-semibold hover:bg-paper"
                >
                  Edit
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
