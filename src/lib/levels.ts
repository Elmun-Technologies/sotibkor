/**
 * Daraja jadvali va XP -> daraja hisoblash mantig'i (sof funksiyalar).
 * Chegaralar single source of truth — boshqa joyda takrorlanmaydi.
 */

import type { LevelInfo, LevelKey } from "./types";

export const LEVELS: LevelInfo[] = [
  { key: "stajyor", minXp: 0 },
  { key: "sotuvchi", minXp: 300 },
  { key: "katta_sotuvchi", minXp: 900 },
  { key: "menejer", minXp: 2000 },
  { key: "sales_master", minXp: 4000 },
];

export interface LevelProgress {
  current: LevelInfo;
  next: LevelInfo | null;
  /** Joriy daraja boshidan hisoblangan XP (xp - current.minXp). */
  intoLevel: number;
  /** Keyingi darajagacha qolgan XP; oxirgi darajada 0. */
  toNext: number;
  /** 0..1 oralig'ida joriy daraja ichidagi progress; oxirgi darajada 1. */
  progress: number;
}

/**
 * Berilgan XP uchun joriy daraja, keyingi daraja va progress'ni qaytaradi.
 * XP manfiy bo'lsa ham xavfsiz (0 ga qisiladi).
 */
export function levelForXp(xp: number): LevelProgress {
  const safeXp = Number.isFinite(xp) && xp > 0 ? xp : 0;

  let currentIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (safeXp >= LEVELS[i].minXp) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const current = LEVELS[currentIndex];
  const next =
    currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  const intoLevel = safeXp - current.minXp;

  if (!next) {
    return { current, next: null, intoLevel, toNext: 0, progress: 1 };
  }

  const span = next.minXp - current.minXp;
  const toNext = next.minXp - safeXp;
  const progress = span > 0 ? Math.min(1, Math.max(0, intoLevel / span)) : 1;

  return { current, next, intoLevel, toNext, progress };
}

export function levelInfoFor(key: LevelKey): LevelInfo {
  return LEVELS.find((l) => l.key === key) ?? LEVELS[0];
}
