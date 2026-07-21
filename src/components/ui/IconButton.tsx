"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Nozik border chizig'i (masalan tema/hamburger tugmasi). Standart yo'q. */
  bordered?: boolean;
  /** "muted" — text-faint, hover'da text-foreground'ga o'tadi (chiqish/yopish tugmalari). */
  tone?: "default" | "muted";
}

const TONE: Record<"default" | "muted", string> = {
  default: "text-foreground/80",
  muted: "text-faint hover:text-foreground",
};

/** 44px (a11y tap-target minimumi) doiraviy ikon tugma — nav/tema/yopish/chiqish uchun bitta manba. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      bordered = false,
      tone = "default",
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-150 hover:bg-foreground/[.05] active:scale-[0.93] disabled:pointer-events-none disabled:opacity-40 ${
          bordered ? "border border-border" : ""
        } ${TONE[tone]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
