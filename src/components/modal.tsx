"use client";

import { useEffect } from "react";

/** Centered dialog. Closes on backdrop tap or Escape. */
export function Modal({
  open,
  onClose,
  title,
  closeLabel = "Done",
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel?: string;
  /** Wider on desktop, for two-column content. */
  wide?: boolean;
  children: React.ReactNode;
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/40 animate-fade-in" />
      <div className={`relative flex max-h-[min(88dvh,780px)] w-full max-w-md flex-col ${wide ? "lg:max-w-3xl" : ""} overflow-hidden rounded-3xl bg-paper shadow-2xl shadow-black/30 animate-modal-in`}>
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-3">
          <h2 className="min-w-0 truncate text-[22px] font-bold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-2 py-1 text-[17px] font-semibold">
            {closeLabel}
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-5">{children}</div>
      </div>
    </div>
  );
}
