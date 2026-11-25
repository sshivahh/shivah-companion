"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionDTO, StudentDTO } from "@/lib/data";
import { EN_DAYS, EN_MONTHS, parseYmd, weekday } from "@/lib/dates";
import { logout } from "@/app/actions";
import { IconBook, IconCalendar, IconGrid, IconList, IconLogout, IconSettings, IconUsers } from "./icons";
import { LessonDialogProvider } from "./lesson-dialog";
import { ThemeToggle } from "./theme-toggle";

type Crumb = { label: string; href?: string };
const PAGES: Record<string, { title: string; crumbs: Crumb[] }> = {
  "/": { title: "Dashboard", crumbs: [{ label: "Home" }] },
  "/lessons": { title: "Lesson log", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons" }, { label: "Log" }] },
  "/lessons/calendar": { title: "Calendar", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons", href: "/lessons" }, { label: "Calendar" }] },
  "/lessons/students": { title: "Students", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons", href: "/lessons" }, { label: "Students" }] },
  "/settings": { title: "Settings", crumbs: [{ label: "Home", href: "/" }, { label: "Settings" }] },
};

/**
 * Phones: content only (each page brings its own header).
 * Desktop (lg+): admin layout with a sidebar, a top bar and a page header.
 */
export function AppShell({
  students,
  sessions,
  today,
  children,
}: {
  students: StudentDTO[];
  sessions: SessionDTO[];
  today: string;
  children: React.ReactNode;
}) {
  const colorOf = new Map(students.map((s) => [s.id, s.color]));
  const marks = new Map<string, string[]>();
  for (const s of sessions) {
    const c = colorOf.get(s.studentId);
    if (!c) continue;
    const list = marks.get(s.date) ?? [];
    if (!list.includes(c)) marks.set(s.date, [...list, c]);
  }

  return (
    <LessonDialogProvider students={students} today={today} marks={marks}>
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar today={today} />
        <main className="pt-safe pb-safe mx-auto w-full max-w-md px-4 pb-12 md:max-w-5xl md:px-8 md:pt-10 lg:max-w-[1400px] lg:pt-8">
          <PageHeader />
          {children}
        </main>
      </div>
    </LessonDialogProvider>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-rule bg-surface lg:flex">
      <Link href="/" className="flex h-16 shrink-0 items-center gap-3 border-b border-rule px-6">
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
          <span className="h-2.5 w-5 rounded-sm bg-[#ffe04d]" />
        </span>
        <span className="text-[19px] font-bold tracking-tight">sshivahh</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main">
        <p className="px-3 pb-2 text-[13px] font-semibold text-pencil">Menu</p>
        <ul className="space-y-1">
          <li>
            <NavLink href="/" active={pathname === "/"} icon={<IconGrid className="h-5 w-5" />}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold ${pathname.startsWith("/lessons") ? "text-ink" : "text-pencil"}`}>
              <IconBook className="h-5 w-5" />
              Lessons
            </div>
            <ul className="ml-[22px] space-y-0.5 border-l border-rule pl-3">
              <li>
                <NavLink href="/lessons" active={pathname === "/lessons"} icon={<IconList className="h-4 w-4" />} small>
                  Log
                </NavLink>
              </li>
              <li>
                <NavLink href="/lessons/calendar" active={pathname === "/lessons/calendar"} icon={<IconCalendar className="h-4 w-4" />} small>
                  Calendar
                </NavLink>
              </li>
              <li>
                <NavLink href="/lessons/students" active={pathname === "/lessons/students"} icon={<IconUsers className="h-4 w-4" />} small>
                  Students
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="space-y-1 border-t border-rule px-4 py-4">
        <NavLink href="/settings" active={pathname === "/settings"} icon={<IconSettings className="h-5 w-5" />}>
          Settings
        </NavLink>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-pencil transition-colors hover:bg-paper hover:text-ink">
            <IconLogout className="h-5 w-5" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon,
  small,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 ${small ? "py-2 text-[15px]" : "py-2.5 text-[15px]"} font-semibold transition-colors ${
        active ? "bg-paper text-ink" : "text-pencil hover:bg-paper hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function TopBar({ today }: { today: string }) {
  const { d, m, y } = parseYmd(today);
  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-rule bg-surface/90 px-8 backdrop-blur-xl lg:flex">
      <p className="text-[15px] text-pencil">
        {EN_DAYS[weekday(today)]}, {d} {EN_MONTHS[m - 1]} {y}
      </p>
      <ThemeToggle />
    </header>
  );
}

function PageHeader() {
  const page = PAGES[usePathname()];
  if (!page) return null;
  return (
    <div className="mb-6 hidden items-end justify-between gap-4 lg:flex">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">{page.title}</h1>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-[15px] text-pencil">
          {page.crumbs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className={i === page.crumbs.length - 1 ? "text-ink" : ""}>{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
