import type { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`surface rounded-2xl p-5 ${className}`}>{children}</div>
  );
}
