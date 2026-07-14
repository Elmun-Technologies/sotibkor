/**
 * Gamifikatsiya va umumiy UI uchun asosiy tiplar (single source of truth).
 * FE va BE shu tiplardan foydalanadi — o'zgartirilsa hammaga ta'sir qiladi.
 */

import type { FunnelStage, ObjectionType } from "./coach";

export type LevelKey =
  "stajyor" | "sotuvchi" | "katta_sotuvchi" | "menejer" | "sales_master";

export interface LevelInfo {
  key: LevelKey;
  minXp: number;
}

export interface UserStats {
  xp: number;
  level: LevelKey;
  sessionsCount: number;
  streakDays: number;
  /** ISO 'YYYY-MM-DD' yoki hali faol bo'lmagan bo'lsa null. */
  lastActive: string | null;
}

export type AchievementCategory =
  | "sovuq_qongiroq"
  | "sifat"
  | "progress"
  | "intizom"
  | "muzokaralar"
  | "afsonaviy";

export interface AchievementDef {
  code: string;
  xp: number;
  category: AchievementCategory;
}

export interface AchievementState {
  code: string;
  earned: boolean;
  /** ISO 'YYYY-MM-DD' — ochilgan sana; ochilmagan bo'lsa null/undefined. */
  earnedAt?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xpWeek: number;
  isMe?: boolean;
}

export type TaskStatus = "new" | "progress" | "done";

export interface Assignment {
  id: string;
  title: string;
  by: string;
  target: number;
  done: number;
  dueDays: number;
  status: TaskStatus;
  focus: string;
}

export interface TeamRow {
  name: string;
  done: number;
  target: number;
  avg: number;
  /** Voronka bosqichlari bo'yicha o'rtacha qamrov foizi (0-100) — jamoa dashboardi uchun. */
  funnel: Record<FunnelStage, number>;
  /** Eng ko'p qiynalgan e'tiroz turi (bo'sh bo'lsa hozircha aniq zaif nuqta yo'q). */
  weakObjection: ObjectionType | null;
}
