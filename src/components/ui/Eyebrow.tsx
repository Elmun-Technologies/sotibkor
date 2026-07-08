import type { ReactNode } from "react";

export interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Kichik mono uppercase label (bo'lim sarlavhasi ustidagi). */
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}
