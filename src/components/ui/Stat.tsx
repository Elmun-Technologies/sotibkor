import type { ReactNode } from "react";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {hint != null && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
