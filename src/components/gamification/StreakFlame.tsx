"use client";

import { getMessages } from "@/i18n";
import { motion, useReducedMotion } from "framer-motion";

const t = getMessages();

export interface StreakFlameProps {
  days: number;
  className?: string;
}

/**
 * Ketma-ket kunlar (streak) alangasi. Faol streakda yumshoq miltillash;
 * 0 bo'lsa so'nik ko'rinish. prefers-reduced-motion hurmat qilinadi.
 */
export function StreakFlame({ days, className = "" }: StreakFlameProps) {
  const reduce = useReducedMotion();
  const active = days > 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.span
        aria-hidden
        className="text-3xl leading-none"
        style={{
          filter: active ? undefined : "grayscale(1)",
          opacity: active ? 1 : 0.5,
        }}
        animate={
          reduce || !active
            ? undefined
            : { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }
        }
        transition={
          reduce || !active
            ? undefined
            : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        🔥
      </motion.span>
      <div>
        <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
          {days}
        </div>
        <div className="text-xs text-muted">
          {active ? t.profil.streakDays : t.profil.streakZero}
        </div>
      </div>
    </div>
  );
}
