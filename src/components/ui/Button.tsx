"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-onink hover:opacity-90 border border-transparent",
  ghost: "border border-border text-foreground hover:bg-foreground/[.04]",
  danger:
    "border border-[color:var(--bad)]/50 text-[color:var(--bad)] hover:bg-[color:var(--bad)]/[.08]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Berilsa — <button> emas, Next <Link> sifatida render qilinadi
   *  (yaroqsiz <a><button> ichma-ichligini yo'qotadi). */
  href?: string;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  href,
  children,
  ...props
}: ButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children as ReactNode}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
