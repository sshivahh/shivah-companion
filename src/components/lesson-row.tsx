import type { StudentDTO } from "@/lib/data";
import type { Lesson } from "@/lib/lessons";
import { IconChevron } from "./icons";

export function LessonRow({
  lesson,
  studentById,
  onOpen,
}: {
  lesson: Lesson;
  studentById: Map<string, StudentDTO>;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className="flex min-h-15 w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-rule/25 active:opacity-70">
      <span className={`w-12 shrink-0 text-[17px] font-semibold tabular-nums ${lesson.time ? "" : "text-pencil"}`}>
        {lesson.time ?? "–"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex flex-wrap gap-1.5">
        {lesson.studentIds.map((id) => {
          const st = studentById.get(id);
          if (!st) return null;
          return (
            <span key={id} className="rounded-md px-2 py-0.5 text-[15px] font-semibold text-mark-ink" style={{ background: st.color }}>
              {st.name}
            </span>
          );
        })}
      </span>
      {lesson.note && <span className="truncate text-[15px] text-pencil">{lesson.note}</span>}
      </span>
      <IconChevron className="h-4 w-4 shrink-0 text-pencil" />
    </button>
  );
}
