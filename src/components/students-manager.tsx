"use client";

import { useState, useTransition } from "react";
import { createStudent, deleteStudent, setStudentArchived, updateStudent } from "@/app/actions";
import type { StudentDTO } from "@/lib/data";
import { STUDENT_COLORS, nextColor } from "@/lib/colors";
import { IconCheck, IconChevron } from "./icons";
import { Modal } from "./modal";

const inputClass =
  "w-full rounded-xl border border-rule bg-surface px-4 py-3 text-[17px] text-ink outline-none placeholder:text-pencil/70 focus:border-ink";

export function StudentsManager({
  students,
  monthCounts,
  totals,
  monthName,
}: {
  students: StudentDTO[];
  monthCounts: Record<string, number>;
  totals: Record<string, number>;
  monthName: string;
}) {
  const active = students.filter((s) => !s.archived);
  const archived = students.filter((s) => s.archived);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const pickedColor = color ?? nextColor(active.map((s) => s.color));
  const editing = students.find((s) => s.id === editingId) ?? null;
  const closeEditor = () => setEditingId(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    start(async () => {
      await createStudent(name, pickedColor);
      setName("");
      setColor(null);
    });
  }

  return (
    <div className="md:max-w-2xl lg:max-w-none">
      <form onSubmit={add} className="lg:max-w-xl">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name"
            aria-label="Student name"
            autoCapitalize="words"
            className={inputClass}
          />
          <button
            disabled={pending || !name.trim()}
            className="shrink-0 rounded-xl bg-ink px-5 text-[17px] font-semibold text-paper disabled:opacity-30"
          >
            Add
          </button>
        </div>
        {name.trim() && (
          <div className="mt-3 animate-fade-in">
            <ColorPicker value={pickedColor} onChange={setColor} />
          </div>
        )}
      </form>

      <StudentList students={active} monthCounts={monthCounts} totals={totals} monthName={monthName} onOpen={setEditingId} />

      {archived.length > 0 && (
        <>
          <h2 className="mt-8 mb-2 px-1 text-[15px] font-semibold text-pencil">Archived</h2>
          <StudentList students={archived} monthCounts={monthCounts} totals={totals} monthName={monthName} onOpen={setEditingId} />
        </>
      )}

      <Modal open={editing !== null} onClose={closeEditor} closeLabel="Cancel" title={editing?.name ?? ""}>
        {editing && (
          <Editor key={editing.id} student={editing} total={totals[editing.id] ?? 0} onDone={closeEditor} />
        )}
      </Modal>
    </div>
  );
}

function StudentList({
  students,
  monthCounts,
  totals,
  monthName,
  onOpen,
}: {
  students: StudentDTO[];
  monthCounts: Record<string, number>;
  totals: Record<string, number>;
  monthName: string;
  onOpen: (id: string) => void;
}) {
  if (students.length === 0) {
    return <p className="mt-4 px-1 text-[15px] text-pencil">Add the people you teach to start logging lessons.</p>;
  }
  return (
    <>
      {/* Phones */}
      <ul className="mt-5 overflow-hidden rounded-2xl bg-surface lg:hidden">
        {students.map((s, i) => (
          <li key={s.id} className={i > 0 ? "border-t border-rule" : ""}>
            <button
              type="button"
              onClick={() => onOpen(s.id)}
              className={`flex min-h-15 w-full items-center gap-3.5 px-4 text-left hover:bg-rule/25 active:opacity-70 ${
                s.archived ? "text-pencil" : ""
              }`}
            >
              <Swatch color={s.color} />
              <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">{s.name}</span>
              <span className="text-[13px] text-pencil tabular-nums">
                {monthCounts[s.id] ?? 0} in {monthName.slice(0, 3)}
              </span>
              <IconChevron className="h-4 w-4 text-pencil" />
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-rule bg-surface lg:block">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-rule text-[13px] text-pencil">
              <th scope="col" className="px-5 py-3 font-semibold">Student</th>
              <th scope="col" className="px-5 py-3 font-semibold">In {monthName}</th>
              <th scope="col" className="px-5 py-3 font-semibold">All time</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-rule last:border-0 hover:bg-rule/20">
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-3 font-semibold">
                    <Swatch color={s.color} />
                    {s.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 tabular-nums">{monthCounts[s.id] ?? 0}</td>
                <td className="px-5 py-3.5 tabular-nums">{totals[s.id] ?? 0}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                      s.archived ? "bg-rule/60 text-pencil" : "bg-[#86e3a0]/40 text-ink"
                    }`}
                  >
                    {s.archived ? "Archived" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(s.id)}
                    className="rounded-lg border border-rule px-3 py-1.5 text-[13px] font-semibold hover:bg-paper"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="h-3 w-3 shrink-0 rounded-full"
      style={{ background: color, boxShadow: "inset 0 0 0 1px rgb(22 33 62 / 0.18)" }}
    />
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color">
      {STUDENT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{
            background: c,
            boxShadow:
              value === c ? "0 0 0 2px var(--paper), 0 0 0 4px var(--ink)" : "inset 0 0 0 1px rgb(22 33 62 / 0.15)",
          }}
        >
          {value === c && <IconCheck className="h-4 w-4 text-mark-ink" />}
        </button>
      ))}
    </div>
  );
}

function Editor({ student, total, onDone }: { student: StudentDTO; total: number; onDone: () => void }) {
  const [name, setName] = useState(student.name);
  const [color, setColor] = useState(student.color);
  const [pending, start] = useTransition();
  const dirty = name.trim() !== student.name || color !== student.color;

  return (
    <div className="space-y-5">
      <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" className={inputClass} />
      <ColorPicker value={color} onChange={setColor} />
      <button
        type="button"
        disabled={!dirty || pending || !name.trim()}
        onClick={() =>
          start(async () => {
            await updateStudent(student.id, name, color);
            onDone();
          })
        }
        className="w-full rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper disabled:opacity-30"
      >
        Save changes
      </button>

      <div className="overflow-hidden rounded-2xl bg-surface">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setStudentArchived(student.id, !student.archived);
              onDone();
            })
          }
          className="block w-full px-4 py-3.5 text-left text-[17px]"
        >
          {student.archived ? "Restore student" : "Archive student"}
          <span className="block text-[13px] text-pencil">
            {student.archived
              ? "Show them again when logging lessons."
              : "Hide them when logging lessons. Their past lessons stay in the calendar."}
          </span>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete ${student.name} and all ${total} logged lessons? This can't be undone.`)) {
              start(async () => {
                await deleteStudent(student.id);
                onDone();
              });
            }
          }}
          className="block w-full border-t border-rule px-4 py-3.5 text-left text-[17px] text-red-600 dark:text-red-400"
        >
          Delete student
          <span className="block text-[13px] text-pencil">
            Removes {student.name} and all {total} logged lesson{total === 1 ? "" : "s"}.
          </span>
        </button>
      </div>
    </div>
  );
}
