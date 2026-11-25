import { HomeView } from "@/components/home-view";
import { getSessionsBetween, getStudents, getToday, getTransactionsBetween } from "@/lib/data";
import { addDays, addMonths, monthKey, monthRange } from "@/lib/dates";

export default async function HomePage() {
  const today = await getToday();
  const start = `${addMonths(monthKey(today), -1)}-01`;
  const thisMonth = monthRange(monthKey(today));
  const [students, sessions, transactions] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(start, addDays(today, 60)),
    getTransactionsBetween(thisMonth.start, thisMonth.end),
  ]);
  return <HomeView students={students} sessions={sessions} transactions={transactions} today={today} />;
}
