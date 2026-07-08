"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "neon-glow border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 text-foreground hover:bg-[color:var(--neon)]/20",
  ghost: "border border-border text-foreground/80 hover:bg-foreground/5",
  danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
