"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { deleteLesson, logLesson, updateLesson } from "@/app/actions";
import type { StudentDTO } from "@/lib/data";
import { EN_DAYS, EN_MONTHS, parseYmd, weekday } from "@/lib/dates";
import type { Lesson } from "@/lib/lessons";
import { DatePicker } from "./date-picker";
import { Modal } from "./modal";
import { Register } from "./register";
import { TimeWheel } from "./time-wheel";

/** `siblings` are the other lessons on the same day, so the dialog can switch between them. */
type DialogState =
  | { mode: "new"; date: string; siblings: Lesson[] }
  | { mode: "edit"; lesson: Lesson; siblings: Lesson[] }
  | null;
type Ctx = {
  openNew: (date?: string) => void;
  openEdit: (lesson: Lesson) => void;
  /** Edit the day's lesson if there is one, otherwise log a new one on that day. */
  openDay: (date: string, lessonsOnDay: Lesson[]) => void;
};

const LessonDialogContext = createContext<Ctx | null>(null);

/** Open the log/edit lesson dialog from anywhere inside the app shell. */
export function useLessonDialog() {
  const ctx = useContext(LessonDialogContext);
  if (!ctx) throw new Error("useLessonDialog must be used inside LessonDialogProvider");
  return ctx;
}

export function LessonDialogProvider({
  students,
  today,
  marks,
  children,
}: {
  students: StudentDTO[];
  today: string;
  marks: Map<string, string[]>;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DialogState>(null);
  const ctx: Ctx = {
    openNew: (date) => setState({ mode: "new", date: date ?? today, siblings: [] }),
    openEdit: (lesson) => setState({ mode: "edit", lesson, siblings: [] }),
    openDay: (date, lessons) =>
      setState(lessons.length ? { mode: "edit", lesson: lessons[0], siblings: lessons } : { mode: "new", date, siblings: [] }),
  };
  const close = () => setState(null);

  return (
    <LessonDialogContext.Provider value={ctx}>
      {children}
      <Modal open={state !== null} onClose={close} closeLabel="Cancel" wide title={state?.mode === "edit" ? "Edit lesson" : "Log a lesson"}>
        {state && (
          <LessonForm
            key={state.mode === "edit" ? state.lesson.key : `new-${state.date}-${state.siblings.length}`}
            state={state}
            students={students}
            today={today}
            marks={marks}
            onDone={close}
            onSwitch={setState}
          />
        )}
      </Modal>
    </LessonDialogContext.Provider>
  );
}

function roundedNow() {
  const now = new Date();
  const mins = Math.min(Math.round((now.getHours() * 60 + now.getMinutes()) / 30) * 30, 23 * 60 + 30);
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function longDate(ymd: string) {
  const { d, m } = parseYmd(ymd);
  return `${EN_DAYS[weekday(ymd)]} ${d} ${EN_MONTHS[m - 1]}`;
}

function LessonForm({
  state,
  students,
  today,
  marks,
  onDone,
  onSwitch,
}: {
  state: NonNullable<DialogState>;
  students: StudentDTO[];
  today: string;
  marks: Map<string, string[]>;
  onDone: () => void;
  onSwitch: (next: DialogState) => void;
}) {
  const editing = state.mode === "edit" ? state.lesson : null;
  const [date, setDate] = useState(editing?.date ?? (state.mode === "new" ? state.date : today));
  const [time, setTime] = useState(editing ? (editing.time ?? "") : roundedNow());
  const [picked, setPicked] = useState<string[]>(editing?.studentIds ?? []);
  const [note, setNote] = useState(editing?.note ?? "");
  const [timeOpen, setTimeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Archived students stay visible when they're already part of this lesson.
  const choices = students.filter((s) => !s.archived || picked.includes(s.id));
  const canSave = Boolean(date) && picked.length > 0 && !pending;

  function save() {
    setError(null);
    start(async () => {
      try {
        const input = { date, time: time || null, studentIds: picked, note };
        if (editing) await updateLesson({ date: editing.date, time: editing.time }, input);
        else await logLesson(input);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save the lesson. Try again.");
      }
    });
  }

  function remove() {
    if (!editing || !confirm("Delete this lesson?")) return;
    start(async () => {
      await deleteLesson({ date: editing.date, time: editing.time });
      onDone();
    });
  }

  const siblings = state.siblings;
  const dayOf = editing?.date ?? (state.mode === "new" ? state.date : "");
  const nameOf = (id: string) => students.find((s) => s.id === id)?.name ?? "";

  return (
    <>
    {siblings.length > 0 && (
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Lessons on this day">
        {siblings.map((l) => {
          const active = editing?.key === l.key;
          return (
            <button
              key={l.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSwitch({ mode: "edit", lesson: l, siblings })}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[15px] font-semibold ${
                active ? "border-ink bg-ink text-paper" : "border-rule bg-surface hover:bg-paper"
              }`}
            >
              <span className="tabular-nums">{l.time ?? "No time"}</span>
              <span className={`ml-1.5 font-normal ${active ? "text-paper/70" : "text-pencil"}`}>
                {l.studentIds.map(nameOf).filter(Boolean).join(", ")}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          role="tab"
          aria-selected={!editing}
          onClick={() => onSwitch({ mode: "new", date: dayOf, siblings })}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[15px] font-semibold ${
            !editing ? "border-ink bg-ink text-paper" : "border-dashed border-pencil/50 text-ink hover:bg-paper"
          }`}
        >
          + New lesson
        </button>
      </div>
    )}
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      {/* Date — calendar always visible */}
      <div className="overflow-hidden rounded-2xl bg-surface">
        <div className="flex min-h-13 items-center justify-between gap-3 border-b border-rule px-4 text-[17px]">
          <span>Date</span>
          <span className="font-semibold">{longDate(date)}</span>
        </div>
        <DatePicker value={date} today={today} onChange={setDate} marks={marks} />
      </div>

      <div className="mt-5 space-y-5 lg:mt-0">
        {/* Time — wheel always open on desktop, tap to open on phones */}
        <div className="overflow-hidden rounded-2xl bg-surface">
          <button
            type="button"
            aria-expanded={timeOpen}
            onClick={() => {
              if (!time) {
                setTime(roundedNow());
                setTimeOpen(true);
              } else setTimeOpen(!timeOpen);
            }}
            className="flex min-h-13 w-full items-center justify-between gap-3 px-4 text-left text-[17px] lg:cursor-default"
          >
            <span>Time</span>
            <span className={`font-semibold tabular-nums ${time ? "" : "text-pencil"}`}>{time || "Add time"}</span>
          </button>
          {time && (
            <div className={`border-t border-rule ${timeOpen ? "block" : "hidden"} lg:block`}>
              <TimeWheel value={time} onChange={setTime} />
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 px-1 text-[15px] font-semibold text-pencil">Students</h3>
          <Register
            students={choices}
            isLogged={(id) => picked.includes(id)}
            onToggle={(id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
          />
        </div>

        <div>
          <label htmlFor="lesson-note" className="mb-2 block px-1 text-[15px] font-semibold text-pencil">
            Notes
          </label>
          <textarea
            id="lesson-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What you covered, homework, anything to remember"
            className="block w-full resize-y rounded-2xl border border-rule bg-surface px-4 py-3 text-[17px] leading-snug outline-none placeholder:text-pencil/70 focus:border-ink"
          />
        </div>

        {error &&<p className="px-1 text-[15px] text-red-600 dark:text-red-400">{error}</p>}

        <div className="space-y-2">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="w-full rounded-xl bg-ink py-3.5 text-[17px] font-semibold text-paper hover:opacity-90 disabled:opacity-30"
          >
            {pending
              ? "Saving…"
              : editing
                ? "Save changes"
                : picked.length > 1
                  ? `Log lesson for ${picked.length} students`
                  : "Log lesson"}
          </button>
          {!editing && picked.length === 0 && choices.length > 0 && (
            <p className="text-center text-[13px] text-pencil">Pick at least one student.</p>
          )}
          {editing && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="w-full rounded-xl py-3 text-[17px] font-semibold text-red-600 hover:bg-red-500/5 dark:text-red-400"
            >
              Delete lesson
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
