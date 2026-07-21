"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";
type Size = "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-onink hover:opacity-90 border border-transparent",
  ghost: "border border-border text-foreground hover:bg-foreground/[.04]",
  danger:
    "border border-[color:var(--bad)]/50 text-[color:var(--bad)] hover:bg-[color:var(--bad)]/[.08]",
};

const SIZES: Record<Size, string> = {
  md: "px-6 py-3 text-[15px]",
  sm: "px-4 py-2 text-xs",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Berilsa — <button> emas, Next <Link> sifatida render qilinadi
   *  (yaroqsiz <a><button> ichma-ichligini yo'qotadi). */
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  href,
  children,
  ...props
}: ButtonProps) {
  const cls = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
  if (href) {
    // `props` may still carry button-only attrs (type, disabled) — Link/`<a>`
    // ignore unknown DOM attrs at runtime, but onClick/aria-*/data-* all forward.
    return (
      <Link href={href} className={cls} {...(props as object)}>
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
