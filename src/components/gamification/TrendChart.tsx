"use client";

import { useId } from "react";

export interface TrendChartProps {
  data: number[];
  max?: number;
  className?: string;
}

/**
 * Ball trendi — oxirgi suhbatlar ballari (area + line). Tashqi kutubxonasiz SVG.
 * closeme bir martalik ball beradi; biz o'sishni vaqt bo'yicha ko'rsatamiz.
 */
export function TrendChart({
  data,
  max = 100,
  className = "",
}: TrendChartProps) {
  const gid = useId();
  if (data.length < 2) return null;

  const w = 100;
  const h = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - Math.max(0, Math.min(1, v / max)) * h;
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1];

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${gid})`} />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.5}
          fill="var(--accent)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
