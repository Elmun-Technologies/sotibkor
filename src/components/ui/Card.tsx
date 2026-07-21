import type { ReactNode } from "react";

type Padding = "default" | "sm" | "none";

const PADDING: Record<Padding, string> = {
  default: "p-6 sm:p-7",
  sm: "p-4 sm:p-5",
  none: "p-0",
};

export interface CardProps {
  className?: string;
  children: ReactNode;
  /** Karta o'zi tanlash/navigatsiya nishoni bo'lsa — hover lift + soya chuqurlashadi. */
  interactive?: boolean;
  /** Standart p-6 sm:p-7 o'rniga kichikroq yoki paddingsiz (masalan ichida
   *  o'zining bo'lim padding'i bor xabar/jadval kartalari uchun) — `className`
   *  orqali `p-*` bilan ustma-ust yozishning cascade-buzilishiga barham beradi. */
  padding?: Padding;
}

export function Card({
  className = "",
  children,
  interactive = false,
  padding = "default",
}: CardProps) {
  return (
    <div
      className={`card ${PADDING[padding]} ${
        interactive
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
