/**
 * Tezkor mashq (drill) yadrosi — SOF, TESTLANADIGAN.
 *
 * /drill sahifasi uchun: navbat qurish, qiyinlik, spaced-repetition tavsiyasi
 * (eng zaif e'tiroz turini avtomatik tanlash) va tarix/progress (localStorage).
 */

import { OBJECTION_LIBRARY, type ObjectionEntry } from "./objections";
import type { ObjectionType } from "./coach";

export type DrillDifficulty = "past" | "orta" | "yuqori";
export const DRILL_DIFFICULTIES: DrillDifficulty[] = ["past", "orta", "yuqori"];

/** Qiyinlik ballga qanchalik qattiq ta'sir qiladi (yuqori — qat'iyroq baholash). */
export const DIFFICULTY_STRICTNESS: Record<DrillDifficulty, number> = {
  past: -8,
  orta: 0,
  yuqori: 8,
};

export function isDrillDifficulty(v: string): v is DrillDifficulty {
  return v === "past" || v === "orta" || v === "yuqori";
}

export interface DrillRep {
  key: string;
  obj: ObjectionEntry;
}

/**
 * E'tiroz statistikasidan (uchragan/yopilgan) eng zaif turni topadi —
 * /analitika bilan bir xil mantiq (resolved/met eng past). Bo'sh bo'lsa null.
 */
export function weakestObjectionType(
  stats: Record<ObjectionType, { met: number; resolved: number }>,
): ObjectionType | null {
  let weakest: ObjectionType | null = null;
  let worst = Infinity;
  for (const type of Object.keys(stats) as ObjectionType[]) {
    const s = stats[type];
    if (s.met <= 0) continue;
    const rate = s.resolved / s.met;
    if (rate < worst) {
      worst = rate;
      weakest = type;
    }
  }
  return weakest;
}

/**
 * Spaced-repetition tavsiyasi: berilgan (eng zaif) e'tiroz turidagi
 * e'tirozlarni oldindan tanlaydi (har biriga `perObjection` takror).
 * Tur bo'lmasa — bo'sh tanlov.
 */
export function recommendDrillCounts(
  weakType: ObjectionType | null,
  perObjection = 2,
): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!weakType) return counts;
  for (const o of OBJECTION_LIBRARY) {
    if (o.type === weakType) counts[o.id] = perObjection;
  }
  return counts;
}

/** Tanlangan takror-sonlaridan drill navbatini quradi. */
export function buildQueue(counts: Record<string, number>): DrillRep[] {
  const reps: DrillRep[] = [];
  for (const o of OBJECTION_LIBRARY) {
    const n = counts[o.id] ?? 0;
    for (let i = 0; i < n; i++) reps.push({ key: `${o.id}-${i}`, obj: o });
  }
  return reps;
}

/* ─────────────────────────── Tarix (localStorage) ─────────────────────── */

const HISTORY_KEY = "sotibkor_drill_history";
const HISTORY_CAP = 20;

export interface DrillHistoryEntry {
  at: string; // ISO sana
  avg: number; // o'rtacha ball
  rounds: number; // jami savol
  difficulty: DrillDifficulty;
  strongest: ObjectionType | null;
  weakest: ObjectionType | null;
}

export function getDrillHistory(): DrillHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as DrillHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Yangi mashq natijasini tarix boshiga qo'shadi (eng ko'pi bilan 20 ta). */
export function saveDrillResult(entry: DrillHistoryEntry): DrillHistoryEntry[] {
  const next = [entry, ...getDrillHistory()].slice(0, HISTORY_CAP);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* e'tiborsiz */
    }
  }
  return next;
}
