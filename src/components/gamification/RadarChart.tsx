"use client";

import { useId } from "react";

export interface RadarAxis {
  label: string;
  /** 0..100 (normallashtirilgan foiz). */
  value: number;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  className?: string;
}

/**
 * Ko'nikma profili — 5 baholash o'lchovini radar (spider) diagramma sifatida.
 * Tashqi kutubxonasiz sof SVG (CLAUDE.md — og'ir bog'liqliklarsiz). closeme
 * faqat bitta umumiy ball beradi; biz o'lchovlar bo'yicha ko'p qirrali profil
 * ko'rsatamiz.
 */
export function RadarChart({ axes, className = "" }: RadarChartProps) {
  const gid = useId();
  const n = axes.length;
  if (n < 3) return null;

  const size = 200;
  const c = size / 2;
  const r = size / 2 - 34; // yorliqlar uchun joy

  // Har o'q burchagi — yuqoridan (-90°) boshlab soat yo'nalishida.
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radiusPct: number) => {
    const a = angle(i);
    const rad = r * Math.max(0, Math.min(1, radiusPct));
    return [c + Math.cos(a) * rad, c + Math.sin(a) * rad] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const valuePoints = axes.map((ax, i) => point(i, ax.value / 100));
  const valuePoly = valuePoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-64 w-full max-w-[16rem]"
        role="img"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Halqalar (grid) */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={axes
              .map((_, i) => point(i, ring))
              .map(([x, y]) => `${x},${y}`)
              .join(" ")}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}

        {/* O'qlar */}
        {axes.map((_, i) => {
          const [x, y] = point(i, 1);
          return (
            <line
              key={i}
              x1={c}
              y1={c}
              x2={x}
              y2={y}
              stroke="var(--foreground)"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          );
        })}

        {/* Qiymat ko'pburchagi */}
        <polygon
          points={valuePoly}
          fill={`url(#${gid})`}
          stroke="var(--accent)"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        {valuePoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.4} fill="var(--accent)" />
        ))}

        {/* Yorliqlar */}
        {axes.map((ax, i) => {
          const [x, y] = point(i, 1.18);
          const a = angle(i);
          const anchor =
            Math.abs(Math.cos(a)) < 0.3
              ? "middle"
              : Math.cos(a) > 0
                ? "start"
                : "end";
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-[color:var(--muted)] text-[8px]"
            >
              {ax.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
