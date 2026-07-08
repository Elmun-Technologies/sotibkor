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
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.35, delay: Math.min(index * 0.04, 0.4) }
      }
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        entry.isMe
          ? "border-[color:var(--neon)]/50 bg-[color:var(--neon)]/10"
          : "border-border bg-surface"
      } ${className}`}
    >
      <div className="grid w-8 shrink-0 place-items-center font-mono text-sm font-bold tabular-nums text-muted">
        {medal ?? entry.rank}
      </div>
      <div className="min-w-0 flex-1 truncate text-sm text-foreground">
        {entry.isMe ? (
          <span className="font-semibold text-neon">{t.reyting.you}</span>
        ) : (
          entry.name
        )}
      </div>
      <div className="shrink-0 font-mono text-sm tabular-nums text-foreground">
        {entry.xpWeek.toLocaleString("ru-RU")}
        <span className="ml-1 text-xs text-muted">{t.common.xp}</span>
      </div>
    </motion.div>
  );
}
