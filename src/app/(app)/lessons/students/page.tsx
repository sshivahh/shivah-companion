import { StudentsManager } from "@/components/students-manager";
import { getSessionsBetween, getStudents, getToday, getTotals } from "@/lib/data";
import { EN_MONTHS, monthKey, monthRange } from "@/lib/dates";

export default async function StudentsPage() {
  const { start, end, m } = monthRange(monthKey(await getToday()));
  const [students, monthSessions, totals] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(start, end),
    getTotals(),
  ]);
  const monthCounts: Record<string, number> = {};
  for (const s of monthSessions) monthCounts[s.studentId] = (monthCounts[s.studentId] ?? 0) + 1;
  return <StudentsManager students={students} monthCounts={monthCounts} totals={totals} monthName={EN_MONTHS[m - 1]} />;
}
