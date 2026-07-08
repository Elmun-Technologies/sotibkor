import type { ReactNode } from "react";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="inset p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      {hint != null && <div className="mt-1 text-sm text-muted">{hint}</div>}
    </div>
  );
}
