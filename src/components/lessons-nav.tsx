"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevron } from "./icons";

const sections = [
  { href: "/lessons", label: "Log" },
  { href: "/lessons/calendar", label: "Calendar" },
  { href: "/lessons/students", label: "Students" },
];

export function LessonsNav() {
  const pathname = usePathname();
  return (
    <header className="pt-1 lg:hidden">
      <Link href="/" className="-ml-1 inline-flex items-center gap-0.5 py-1 text-[17px] text-pencil hover:text-ink">
        <IconChevron className="h-5 w-5 rotate-180" />
        Home
      </Link>
      <div className="md:flex md:items-end md:justify-between md:gap-6">
      <h1 className="mt-1 text-[34px] leading-tight font-bold tracking-tight md:text-[40px]">Lessons</h1>
      <nav className="mt-4 grid grid-cols-3 rounded-xl bg-rule/70 p-0.5 md:mt-0 md:w-96" aria-label="Lessons sections">
        {sections.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-[10px] py-1.5 text-center text-[15px] font-semibold ${
                active ? "bg-surface text-ink shadow-sm" : "text-pencil"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      </div>
    </header>
  );
}
