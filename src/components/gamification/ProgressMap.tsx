"use client";

import { getMessages } from "@/i18n";
import { LEVELS, levelForXp } from "@/lib/levels";
import { motion, useReducedMotion } from "framer-motion";

const t = getMessages();

export interface ProgressMapProps {
  xp: number;
  className?: string;
}

/**
 * Bosqichma-bosqich daraja xaritasi: barcha 5 daraja tugun sifatida,
 * o'tilganlar yorqin, joriy daraja neon, keluvchilar so'nik.
 * Joriy tugundan keyingi tugungacha ustidagi chiziq progress bo'yicha to'ladi.
 */
export function ProgressMap({ xp, className = "" }: ProgressMapProps) {
  const reduce = useReducedMotion();
  const { current, progress } = levelForXp(xp);
  const currentIndex = LEVELS.findIndex((l) => l.key === current.key);
  const segments = Math.max(1, LEVELS.length - 1);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex min-w-[520px] items-start">
        {LEVELS.map((lvl, i) => {
          const passed = i < currentIndex;
          const isCurrent = i === currentIndex;
          const state = passed ? "passed" : isCurrent ? "current" : "future";

          const dotClass =
            state === "passed"
              ? "border-neon bg-[color:var(--neon)]/25 text-foreground"
              : state === "current"
                ? "neon-glow border-neon bg-[color:var(--neon)]/20 text-foreground"
                : "border-border bg-surface text-muted";

          // Chiziq (bu tugundan keyingisiga): o'tilgan bo'lsa 100%, joriy bo'lsa progress.
          const fill = passed ? 1 : isCurrent ? progress : 0;

          return (
            <div
              key={lvl.key}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                {/* chap yarim chiziq (birinchi tugunda ko'rinmas) */}
                <div className="h-1 flex-1">
                  {i > 0 && (
                    <div className="h-1 rounded-full bg-[color:var(--fg)]/10" />
                  )}
                </div>

                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold tabular-nums transition-colors ${dotClass}`}
                >
                  {i + 1}
                </div>

                {/* o'ng yarim chiziq (oxirgi tugunda ko'rinmas) */}
                <div className="relative h-1 flex-1">
                  {i < segments && (
                    <div className="h-1 overflow-hidden rounded-full bg-[color:var(--fg)]/10">
                      <motion.div
                        className="h-full rounded-full bg-[color:var(--neon)]"
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${fill * 100}%` }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: 0.9, ease: "easeOut" }
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`mt-2 max-w-[92px] text-center text-[11px] leading-tight ${
                  isCurrent ? "font-semibold text-foreground" : "text-muted"
                }`}
              >
                {t.profil.daraja[lvl.key]}
              </div>
              <div className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
                {lvl.minXp.toLocaleString("ru-RU")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
