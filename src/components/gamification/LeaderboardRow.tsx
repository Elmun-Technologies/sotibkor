"use client";

import { getMessages } from "@/i18n";
import type { LeaderboardEntry } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";

const t = getMessages();

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index?: number;
  className?: string;
}

/** Reyting qatori: rank, ism, haftalik XP. isMe bo'lsa neon bilan ajratiladi. */
export function LeaderboardRow({
  entry,
  index = 0,
  className = "",
}: LeaderboardRowProps) {
  const reduce = useReducedMotion();
  const medal = MEDALS[entry.rank];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.35, delay: Math.min(index * 0.04, 0.4) }
      }
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ${
        entry.isMe
          ? "bg-surface shadow-card ring-2 ring-ink"
          : "bg-surface shadow-soft"
      } ${className}`}
    >
      <div className="grid w-8 shrink-0 place-items-center font-mono text-base font-bold tabular-nums text-muted">
        {medal ?? entry.rank}
      </div>
      <div className="min-w-0 flex-1 truncate text-[15px] text-foreground">
        {entry.isMe ? (
          <span className="font-semibold text-foreground">{t.reyting.you}</span>
        ) : (
          entry.name
        )}
      </div>
      <div className="shrink-0 font-mono text-[15px] tabular-nums text-foreground">
        {entry.xpWeek.toLocaleString("ru-RU")}
        <span className="ml-1 text-xs text-muted">{t.common.xp}</span>
      </div>
    </motion.div>
  );
}
