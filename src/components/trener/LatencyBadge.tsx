"use client";

import { getMessages } from "@/i18n";
import { Badge } from "@/components/ui";

const t = getMessages();

export interface LatencyMetrics {
  llmFirst: number | null;
  ttsFirst: number | null;
  total: number | null;
}

export interface LatencyBadgeProps {
  metrics: LatencyMetrics;
}

/** Ovoz aylanasi latency o'lchovlari — kritik metrika (<2s). */
export function LatencyBadge({ metrics }: LatencyBadgeProps) {
  const { total } = metrics;
  const over = total != null && total > 2000;

  const item = (label: string, v: number | null) => (
    <div className="flex flex-col leading-tight">
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular-nums ${
          v != null && v > 2000 ? "text-[color:var(--warn)]" : "text-foreground"
        }`}
      >
        {v != null ? `${v}${t.trener.ms}` : "—"}
      </span>
    </div>
  );

  return (
    <div className="surface flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {t.trener.cycleLabel}
      </span>
      {item(t.trener.llmFirst, metrics.llmFirst)}
      {item(t.trener.ttsFirst, metrics.ttsFirst)}
      {item(t.trener.totalCycle, metrics.total)}
      {total != null && (
        <span className="ml-auto">
          <Badge tone={over ? "warn" : "good"}>
            {over ? t.trener.cycleSlow : t.trener.cycleOk}
          </Badge>
        </span>
      )}
    </div>
  );
}
