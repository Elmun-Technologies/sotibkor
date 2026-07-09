import type { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
  /** Karta o'zi tanlash/navigatsiya nishoni bo'lsa — hover lift + soya chuqurlashadi. */
  interactive?: boolean;
}

export function Card({
  className = "",
  children,
  interactive = false,
}: CardProps) {
  return (
    <div
      className={`card p-6 sm:p-7 ${
        interactive
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
