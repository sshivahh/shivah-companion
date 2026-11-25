import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/skeleton";
import { getSessionsBetween, getStudents, getToday } from "@/lib/data";
import { addDays } from "@/lib/dates";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense
      fallback={
        <main className="pt-safe mx-auto w-full max-w-md px-4 md:max-w-5xl md:px-8">
          <Skeleton />
        </main>
      }
    >
      <Shell>{children}</Shell>
    </Suspense>
  );
}

/** Loads what the shared lesson dialog needs (students + recent days for calendar marks). */
async function Shell({ children }: { children: React.ReactNode }) {
  const today = await getToday();
  const [students, sessions] = await Promise.all([
    getStudents({ includeArchived: true }),
    getSessionsBetween(addDays(today, -400), addDays(today, 120)),
  ]);
  return (
    <AppShell students={students} sessions={sessions} today={today}>
      {children}
    </AppShell>
  );
}
