"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface XpRingProps {
  /** 0..1 oralig'ida progress. */
  progress: number;
  /** Diametr (px). */
  size?: number;
  /** Halqa qalinligi (px). */
  stroke?: number;
  /** Markazdagi kontent. */
  children?: ReactNode;
  className?: string;
}

/**
 * Daraja progressini ko'rsatuvchi neon halqa (SVG).
 * Ikkala gradient uchi (--neon -> --neon-2) va yumshoq to'lish animatsiyasi.
 * prefers-reduced-motion hurmat qilinadi.
 */
export function XpRing({
  progress,
  size = 168,
  stroke = 12,
  children,
  className = "",
}: XpRingProps) {
  const reduce = useReducedMotion();
  const clamped = Math.min(
    1,
    Math.max(0, Number.isFinite(progress) ? progress : 0),
  );
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradId = `xpring-${size}-${stroke}`;

  return (
    <div
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--neon)" />
            <stop offset="100%" stopColor="var(--neon-2)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--fg) 12%, transparent)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={
            reduce ? { duration: 0 } : { duration: 1.1, ease: "easeOut" }
          }
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  );
}
