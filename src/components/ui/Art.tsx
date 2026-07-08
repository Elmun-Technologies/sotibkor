import type { ReactNode } from "react";

export type ArtVariant = "coral" | "mint" | "azure" | "violet" | "amber";

export interface ArtProps {
  variant?: ArtVariant;
  className?: string;
  children?: ReactNode;
}

/** Dekorativ gradient "art" panel (3D render o'rnida, CSP-safe). */
export function Art({ variant = "coral", className = "", children }: ArtProps) {
  return <div className={`art art-${variant} ${className}`}>{children}</div>;
}
