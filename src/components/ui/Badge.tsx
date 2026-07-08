import type { ReactNode } from "react";

type Tone = "neon" | "muted" | "good" | "warn";

const TONES: Record<Tone, string> = {
  neon: "border-border text-foreground",
  muted: "border-border text-muted",
  good: "border-[color:var(--good)]/40 text-[color:var(--good)]",
  warn: "border-[color:var(--warn)]/40 text-[color:var(--warn)]",
};

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

export function Badge({ children, tone = "neon" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
