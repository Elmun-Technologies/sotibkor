"use client";

import { motion } from "framer-motion";
import { getMessages } from "@/i18n";

const t = getMessages();

export interface InterestMeterProps {
  value: number; // 0..100
  series?: number[];
}

function toneVar(v: number): string {
  if (v >= 66) return "var(--good)";
  if (v >= 40) return "var(--fg)";
  return "var(--warn)";
}

/** Jonli "Qiziqish" (rapport) o'lchagichi — closeme'dagi Интерес'ning kuchliroq varianti. */
export function InterestMeter({ value, series = [] }: InterestMeterProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = toneVar(v);

  // Mini sparkline (SVG, tashqi kutubxonasiz)
  const pts =
    series.length > 1
      ? series
          .map((p, i) => {
            const x = (i / (series.length - 1)) * 100;
            const y = 100 - Math.max(0, Math.min(100, p));
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  return (
    <div className="inset flex items-center gap-4 px-4 py-3">
      <div className="min-w-0">
        <div className="eyebrow">{t.trener.interest}</div>
        <div className="mt-1 flex items-end gap-1.5">
          <span
            className="text-2xl font-semibold tabular-nums leading-none"
            style={{ color: tone }}
          >
            {v}
          </span>
          <span className="mb-0.5 text-xs text-muted">/100</span>
        </div>
      </div>

      <div className="h-8 flex-1">
        {pts && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden
          >
            <polyline
              points={pts}
              fill="none"
              stroke={tone}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>

      <div className="hidden h-2.5 w-24 overflow-hidden rounded-full bg-foreground/[.08] sm:block">
        <motion.div
          className="h-full rounded-full"
          style={{ background: tone }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
