import type { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return <div className={`card p-6 sm:p-7 ${className}`}>{children}</div>;
}
