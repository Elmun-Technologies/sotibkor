"use client";

import type { ReactNode } from "react";

export interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Chip({ active = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-[color:var(--neon)]/60 bg-[color:var(--neon)]/15 text-foreground"
          : "border-border text-muted hover:border-foreground/25"
      }`}
    >
      {children}
    </button>
  );
}
