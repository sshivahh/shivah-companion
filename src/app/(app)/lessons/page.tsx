import { AgendaView } from "@/components/agenda-view";
import { getSessionsBetween, getStudents, getToday } from "@/lib/data";
import { addDays } from "@/lib/dates";

export default async function LessonsPage() {
  const today = await getToday();
  const [students, sessions] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(addDays(today, -90), addDays(today, 60)),
  ]);
  return <AgendaView students={students} sessions={sessions} today={today} />;
}
