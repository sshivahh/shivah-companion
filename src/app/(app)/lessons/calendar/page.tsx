import { CalendarView } from "@/components/calendar-view";
import { getSessionsBetween, getStudents, getToday } from "@/lib/data";
import { isMonthKey, monthKey, monthRange } from "@/lib/dates";

export default async function CalendarPage({ searchParams }: PageProps<"/lessons/calendar">) {
  const { m, s } = await searchParams;
  const today = await getToday();
  const month = isMonthKey(m) ? m : monthKey(today);
  const { start, end } = monthRange(month);
  const [students, sessions] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(start, end),
  ]);
  return (
    <CalendarView
      key={month}
      month={month}
      today={today}
      students={students}
      sessions={sessions}
      initialFilter={typeof s === "string" ? s : null}
    />
  );
}
