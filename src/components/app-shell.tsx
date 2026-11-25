"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionDTO, StudentDTO } from "@/lib/data";
import { EN_DAYS, EN_MONTHS, parseYmd, weekday } from "@/lib/dates";
import { logout } from "@/app/actions";
import {
  IconBook,
  IconCalendar,
  IconGrid,
  IconList,
  IconLogout,
  IconMenu,
  IconSettings,
  IconUsers,
  IconWallet,
  IconX,
} from "./icons";
import { LessonDialogProvider } from "./lesson-dialog";
import { ThemeToggle } from "./theme-toggle";

type Crumb = { label: string; href?: string };
const PAGES: Record<string, { title: string; crumbs: Crumb[] }> = {
  "/": { title: "Dashboard", crumbs: [{ label: "Home" }] },
  "/lessons": { title: "Lesson log", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons" }, { label: "Log" }] },
  "/lessons/calendar": { title: "Calendar", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons", href: "/lessons" }, { label: "Calendar" }] },
  "/lessons/students": { title: "Students", crumbs: [{ label: "Home", href: "/" }, { label: "Lessons", href: "/lessons" }, { label: "Students" }] },
  "/settings": { title: "Settings", crumbs: [{ label: "Home", href: "/" }, { label: "Settings" }] },
  "/money": { title: "Money", crumbs: [{ label: "Home", href: "/" }, { label: "Money" }] },
};

/**
 * Admin layout on every screen size:
 * desktop (lg+) has a fixed sidebar; phones get the same sidebar as a slide-in drawer.
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-rule bg-surface lg:flex">
        <SidebarContent />
      </aside>

      {/* Phone drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="lg:pl-64">
        <TopBar today={today} onMenu={() => setDrawerOpen(true)} />
        <main className="pb-safe mx-auto w-full max-w-md px-4 pt-5 pb-12 md:max-w-5xl md:px-8 md:pt-8 lg:max-w-[1400px]">
          <PageHeader />
          {children}
        </main>
      </div>
    </LessonDialogProvider>
  );
}

function SidebarContent({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname();
  const link = (href: string) => ({ href, active: pathname === href, onNavigate });
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-rule px-6">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
            <span className="h-2.5 w-5 rounded-sm bg-[#ffe04d]" />
          </span>
          <span className="text-[19px] font-bold tracking-tight">sshivahh</span>
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-paper">
            <IconX className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main">
        <p className="px-3 pb-2 text-[13px] font-semibold text-pencil">Menu</p>
        <ul className="space-y-1">
          <li>
            <NavLink {...link("/")} icon={<IconGrid className="h-5 w-5" />}>
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
                <NavLink {...link("/lessons")} icon={<IconList className="h-4 w-4" />} small>
                  Log
                </NavLink>
              </li>
              <li>
                <NavLink {...link("/lessons/calendar")} icon={<IconCalendar className="h-4 w-4" />} small>
                  Calendar
                </NavLink>
              </li>
              <li>
                <NavLink {...link("/lessons/students")} icon={<IconUsers className="h-4 w-4" />} small>
                  Students
                </NavLink>
              </li>
            </ul>
          </li>
          <li>
            <NavLink {...link("/money")} icon={<IconWallet className="h-5 w-5" />}>
              Money
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="pb-safe space-y-1 border-t border-rule px-4 pt-4 lg:pb-4">
        <NavLink {...link("/settings")} icon={<IconSettings className="h-5 w-5" />}>
          Settings
        </NavLink>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-pencil transition-colors hover:bg-paper hover:text-ink">
            <IconLogout className="h-5 w-5" />
            Log out
          </button>
        </form>
      </div>
    </>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button aria-label="Close menu" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/40 animate-fade-in" />
      <aside className="pt-safe absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-2xl animate-drawer-in">
        <SidebarContent onNavigate={onClose} onClose={onClose} />
      </aside>
    </div>
  );
}

function NavLink({
  href,
  active,
  icon,
  small,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  small?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 ${small ? "py-2.5 text-[15px] lg:py-2" : "py-3 text-[15px] lg:py-2.5"} font-semibold transition-colors ${
        active ? "bg-paper text-ink" : "text-pencil hover:bg-paper hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function TopBar({ today, onMenu }: { today: string; onMenu: () => void }) {
  const { d, m, y } = parseYmd(today);
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:pt-0">
      <div className="flex h-14 items-center justify-between gap-3 px-2 md:px-6 lg:h-16 lg:px-8">
        {/* Phones: menu + name */}
        <div className="flex items-center gap-1 lg:hidden">
          <button type="button" onClick={onMenu} aria-label="Open menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper">
            <IconMenu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-ink">
              <span className="h-2 w-4 rounded-sm bg-[#ffe04d]" />
            </span>
            <span className="text-[17px] font-bold tracking-tight">sshivahh</span>
          </Link>
        </div>
        {/* Desktop: today's date */}
        <p className="hidden text-[15px] text-pencil lg:block">
          {EN_DAYS[weekday(today)]}, {d} {EN_MONTHS[m - 1]} {y}
        </p>
        <ThemeToggle className="mr-1 lg:mr-0" />
      </div>
    </header>
  );
}

function PageHeader() {
  const page = PAGES[usePathname()];
  if (!page) return null;
  return (
    <div className="mb-5 flex items-end justify-between gap-4 lg:mb-6">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">{page.title}</h1>
      <nav aria-label="Breadcrumb" className="hidden sm:block">
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
