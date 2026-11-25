"use client";

import { IconMoon, IconSun } from "./icons";

function currentTheme(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Switches between light and dark and remembers the choice on this device. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode etc. — the switch still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`grid h-10 w-10 place-items-center rounded-full border border-rule bg-surface text-ink hover:bg-paper ${className}`}
    >
      {/* CSS picks the icon, so it's right on first paint: sun in dark mode, moon in light mode. */}
      <IconSun className="hidden h-5 w-5 dark:block" />
      <IconMoon className="h-5 w-5 dark:hidden" />
    </button>
  );
}
