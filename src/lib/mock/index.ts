/**
 * Kalitsiz (mock) rejim uchun deterministik demo ma'lumot.
 * Supabase sozlanmagan bo'lsa FE/BE shu qiymatlarni fallback sifatida ishlatadi.
 * Ko'rinadigan matnlar (achievement nomi/tavsifi) i18n'da; bu yerda faqat kodlar/raqamlar.
 */

import type {
  AchievementDef,
  AchievementState,
  LeaderboardEntry,
  UserStats,
} from "../types";

/** Achievement ta'riflari (single source of truth). i18n: achievements.<code>.title/.desc */
export const ACHIEVEMENTS: AchievementDef[] = [
  { code: "birinchi_suhbat", xp: 50 },
  { code: "ketma_ket_3", xp: 75 },
  { code: "ketma_ket_7", xp: 150 },
  { code: "yuqori_ball", xp: 100 },
  { code: "birinchi_yopish", xp: 80 },
  { code: "qiyin_persona", xp: 120 },
];

export const MOCK_USER: UserStats = {
  xp: 1250,
  level: "katta_sotuvchi",
  sessionsCount: 18,
  streakDays: 4,
  lastActive: "2026-07-08",
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Dilshod A.", xpWeek: 820 },
  { rank: 2, name: "Nigora K.", xpWeek: 760 },
  { rank: 3, name: "Sardor M.", xpWeek: 690 },
  { rank: 4, name: "Kamola R.", xpWeek: 610 },
  { rank: 5, name: "Siz", xpWeek: 540, isMe: true },
  { rank: 6, name: "Jasur T.", xpWeek: 500 },
  { rank: 7, name: "Malika S.", xpWeek: 430 },
  { rank: 8, name: "Bekzod X.", xpWeek: 380 },
  { rank: 9, name: "Feruza N.", xpWeek: 320 },
  { rank: 10, name: "Otabek D.", xpWeek: 260 },
];

export const MOCK_ACHIEVEMENTS: AchievementState[] = [
  { code: "birinchi_suhbat", earned: true, earnedAt: "2026-06-20" },
  { code: "ketma_ket_3", earned: true, earnedAt: "2026-06-24" },
  { code: "ketma_ket_7", earned: false, earnedAt: null },
  { code: "yuqori_ball", earned: true, earnedAt: "2026-07-02" },
  { code: "birinchi_yopish", earned: true, earnedAt: "2026-06-28" },
  { code: "qiyin_persona", earned: false, earnedAt: null },
];
