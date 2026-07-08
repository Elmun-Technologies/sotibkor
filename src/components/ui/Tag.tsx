import type { ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  /** Tag-cloud uchun kichik burilish (daraja). */
  rotate?: number;
  solid?: boolean;
  className?: string;
}

/** Pill-shaklidagi teg (reference "capabilities" buluti uslubida). */
export function Tag({
  children,
  rotate = 0,
  solid = false,
  className = "",
}: TagProps) {
  return (
    <span
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${
        solid
          ? "border-transparent bg-ink text-onink"
          : "border-border bg-surface text-foreground"
      } ${className}`}
    >
      {children}
    </span>
  );
}
