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
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-transparent bg-ink text-onink"
          : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
