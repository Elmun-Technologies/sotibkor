"use client";

import { getMessages } from "@/i18n";
import { levelForXp } from "@/lib/levels";
import { XpRing } from "./XpRing";

const t = getMessages();

export interface LevelBadgeProps {
  xp: number;
  size?: number;
  className?: string;
}

/**
 * Daraja nishoni: XP halqasi ichida joriy daraja nomi + keyingi darajagacha XP.
 * Daraja/progress src/lib/levels.levelForXp'dan; nomlar i18n profil.daraja'dan.
 */
export function LevelBadge({
  xp,
  size = 168,
  className = "",
}: LevelBadgeProps) {
  const { current, next, toNext, progress } = levelForXp(xp);
  const currentName = t.profil.daraja[current.key];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <XpRing progress={progress} size={size}>
        <div className="px-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {t.profil.level}
          </div>
          <div className="mt-0.5 text-lg font-bold leading-tight text-foreground sm:text-xl">
            {currentName}
          </div>
          <div className="mt-1 font-mono text-xs tabular-nums text-neon">
            {xp.toLocaleString("ru-RU")} {t.profil.xp}
          </div>
        </div>
      </XpRing>

      {next ? (
        <div className="text-center text-xs text-muted">
          <span className="font-mono tabular-nums text-foreground">
            {toNext.toLocaleString("ru-RU")}
          </span>{" "}
          {t.profil.xp} · {t.profil.daraja[next.key]} {t.profil.toNext}
        </div>
      ) : (
        <div className="text-center text-xs font-semibold text-good">
          {t.profil.maxLevelReached}
        </div>
      )}
    </div>
  );
}
