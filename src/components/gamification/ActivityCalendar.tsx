"use client";

import { useEffect, useState } from "react";
import { getMessages } from "@/i18n";
import { XpRing } from "./XpRing";

const t = getMessages();

export interface ActivityCalendarProps {
  /** Shu oyda mashq qilingan kunlar (1-based). */
  activeDays: number[];
  daily: { doneMin: number; goalMin: number };
}

/**
 * Faollik kalendari + kunlik maqsad (typing.com uslubida). Joriy oy grid,
 * mashq qilingan kunlar to'ldirilgan, bugun halqali. Sana klient tomonda
 * (hydration mos bo'lishi uchun mount'dan keyin render).
 */
export function ActivityCalendar({ activeDays, daily }: ActivityCalendarProps) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const active = new Set(activeDays);
  const goalPct =
    daily.goalMin > 0 ? Math.min(1, daily.doneMin / daily.goalMin) : 0;

  let cells: (number | null)[] = [];
  let todayDate = -1;
  if (now) {
    const y = now.getFullYear();
    const m = now.getMonth();
    todayDate = now.getDate();
    const firstDow = new Date(y, m, 1).getDay(); // 0=Yak
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    cells = [
      ...Array.from({ length: firstDow }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div suppressHydrationWarning>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {t.profil.weekdays.map((d) => (
            <div key={d} className="font-mono text-[10px] uppercase text-faint">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d == null) return <div key={`e${i}`} />;
            const on = active.has(d);
            const today = d === todayDate;
            return (
              <div
                key={d}
                className={`grid aspect-square place-items-center rounded-lg text-xs tabular-nums ${
                  on
                    ? "bg-[color:var(--accent)]/20 font-semibold text-foreground"
                    : "text-muted"
                } ${today ? "ring-2 ring-ink" : ""}`}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <XpRing progress={goalPct} size={120} stroke={10}>
          <div className="text-center">
            <div className="text-lg font-semibold tabular-nums">
              {daily.doneMin}
              <span className="text-muted">/{daily.goalMin}</span>
            </div>
            <div className="text-[10px] text-muted">
              {t.profil.dailyGoalUnit}
            </div>
          </div>
        </XpRing>
        <div className="eyebrow">{t.profil.dailyGoalTitle}</div>
      </div>
    </div>
  );
}
