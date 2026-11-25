import { HomeView } from "@/components/home-view";
import { getSessionsBetween, getStudents, getToday } from "@/lib/data";
import { addDays, addMonths, monthKey } from "@/lib/dates";

export default async function HomePage() {
  const today = await getToday();
  const start = `${addMonths(monthKey(today), -1)}-01`;
  const [students, sessions] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(start, addDays(today, 60)),
  ]);
  return <HomeView students={students} sessions={sessions} today={today} />;
}
