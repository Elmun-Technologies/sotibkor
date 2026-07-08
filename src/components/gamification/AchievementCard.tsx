"use client";

import { getMessages } from "@/i18n";
import { motion, useReducedMotion } from "framer-motion";

const t = getMessages();

/** achievements.json'dagi kod bo'yicha matn (flat obyektdan xavfsiz lookup). */
type AchievementText = { title: string; desc: string };
const TEXTS = t.achievements as unknown as Record<string, AchievementText>;

/** ISO 'YYYY-MM-DD' -> 'DD.MM.YYYY' (matnsiz, sof format). */
function formatDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export interface AchievementCardProps {
  code: string;
  earned: boolean;
  xp: number;
  earnedAt?: string | null;
  /** Ro'yxatda kirish animatsiyasi uchun (stagger). */
  index?: number;
  className?: string;
}

/** Yutuq kartasi: ochilgan bo'lsa neon, qulflangan bo'lsa so'nik. */
export function AchievementCard({
  code,
  earned,
  xp,
  earnedAt,
  index = 0,
  className = "",
}: AchievementCardProps) {
  const reduce = useReducedMotion();
  const meta = TEXTS[code];
  const title = meta?.title ?? code;
  const desc = meta?.desc ?? "";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.4, delay: Math.min(index * 0.05, 0.4) }
      }
      className={`card p-5 ${earned ? "" : "opacity-55"} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-xl ${
            earned
              ? "border-transparent bg-[color:var(--accent)]/15"
              : "inset border-transparent grayscale"
          }`}
          aria-hidden
        >
          {earned ? "🏆" : "🔒"}
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] tabular-nums ${
            earned
              ? "border-[color:var(--good)]/40 bg-[color:var(--good)]/10 text-good"
              : "border-border text-muted"
          }`}
        >
          +{xp} {t.common.xp}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>

      <div className="mt-3 text-[11px] text-muted">
        {earned ? (
          <span className="text-good">
            {t.achievements.earned}
            {earnedAt ? ` · ${formatDate(earnedAt)}` : ""}
          </span>
        ) : (
          <span>{t.achievements.locked}</span>
        )}
      </div>
    </motion.div>
  );
}
