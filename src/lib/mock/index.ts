/**
 * Kalitsiz (mock) rejim uchun deterministik demo ma'lumot.
 * Supabase sozlanmagan bo'lsa FE/BE shu qiymatlarni fallback sifatida ishlatadi.
 * Ko'rinadigan matnlar (achievement nomi/tavsifi) i18n'da; bu yerda faqat kodlar/raqamlar.
 */

import type {
  AchievementDef,
  AchievementState,
  Assignment,
  LeaderboardEntry,
  TeamRow,
  UserStats,
} from "../types";

/**
 * Achievement ta'riflari (single source of truth) — closeme'ning 25 ta
 * kategoriyalangan yutug'idan ilhomlangan, bizning voronka/muzokara
 * tushunchalariga moslashtirilgan. i18n: achievements.<code>.title/.desc
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  // --- Sovuq qo'ng'iroqlar ---
  { code: "birinchi_qongiroq", xp: 30, category: "sovuq_qongiroq" },
  { code: "on_qongiroq", xp: 60, category: "sovuq_qongiroq" },
  { code: "ellik_qongiroq", xp: 160, category: "sovuq_qongiroq" },
  { code: "yuz_qongiroq", xp: 320, category: "sovuq_qongiroq" },
  { code: "besh_yuz_qongiroq", xp: 970, category: "sovuq_qongiroq" },

  // --- Qo'ng'iroq sifati ---
  { code: "ball_70", xp: 100, category: "sifat" },
  { code: "ball_85", xp: 160, category: "sifat" },
  { code: "ball_100", xp: 320, category: "sifat" },
  { code: "barqaror_sifat", xp: 640, category: "sifat" },

  // --- Progress ---
  { code: "osish_boshlandi", xp: 80, category: "progress" },
  { code: "ishonchli_osish", xp: 180, category: "progress" },
  { code: "uch_qadam_yuqoriga", xp: 140, category: "progress" },

  // --- Intizom ---
  { code: "uch_kun_ketma_ket", xp: 60, category: "intizom" },
  { code: "yetti_kun_ketma_ket", xp: 160, category: "intizom" },
  { code: "ottiz_kun_ketma_ket", xp: 960, category: "intizom" },
  { code: "toqson_kun_ketma_ket", xp: 3200, category: "intizom" },

  // --- Muzokaralar ---
  { code: "birinchi_muzokara", xp: 60, category: "muzokaralar" },
  { code: "birinchi_chegirma", xp: 100, category: "muzokaralar" },
  { code: "birinchi_otsrochka", xp: 100, category: "muzokaralar" },
  { code: "shartlar_ustasi", xp: 1600, category: "muzokaralar" },

  // --- Afsonaviy ---
  { code: "million_argument", xp: 6400, category: "afsonaviy" },
  { code: "toliq_kolleksiya", xp: 4600, category: "afsonaviy" },
];

export const MOCK_USER: UserStats = {
  xp: 1250,
  level: "katta_sotuvchi",
  sessionsCount: 18,
  streakDays: 4,
  lastActive: "2026-07-08",
  xpThisWeek: 540,
};

// "Siz" qatori MOCK_USER.xpThisWeek'dan olinadi — Profil/Reyting/Analitika
// bitta XP manbasidan (MOCK_USER) o'qiydi, ikkinchi mustaqil raqam bo'lmasin.
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Dilshod A.", xpWeek: 820 },
  { rank: 2, name: "Nigora K.", xpWeek: 760 },
  { rank: 3, name: "Sardor M.", xpWeek: 690 },
  { rank: 4, name: "Kamola R.", xpWeek: 610 },
  { rank: 5, name: "Siz", xpWeek: MOCK_USER.xpThisWeek, isMe: true },
  { rank: 6, name: "Jasur T.", xpWeek: 500 },
  { rank: 7, name: "Malika S.", xpWeek: 430 },
  { rank: 8, name: "Bekzod X.", xpWeek: 380 },
  { rank: 9, name: "Feruza N.", xpWeek: 320 },
  { rank: 10, name: "Otabek D.", xpWeek: 260 },
];

/** Oxirgi suhbatlar ballari (progress trend grafigi uchun). */
export const MOCK_SCORE_HISTORY: number[] = [
  38, 45, 52, 49, 61, 58, 67, 72, 78,
];

/**
 * Ko'nikma profili — 5 baholash o'lchovi bo'yicha o'rtacha foiz (0..100),
 * radar diagramma uchun (Analitika). Kalitlar scoring.ts ScoreBreakdown bilan
 * bir xil; qiymatlar normallashtirilgan (har o'lchov o'z maksimumidan foiz).
 */
export const MOCK_SKILLS: Record<
  | "salomlashish"
  | "ehtiyoj_aniqlash"
  | "otkazlarga_ishlov"
  | "closing"
  | "ohang",
  number
> = {
  salomlashish: 82,
  ehtiyoj_aniqlash: 64,
  otkazlarga_ishlov: 48,
  closing: 55,
  ohang: 74,
};

/** Faollik kalendari uchun — shu oyda mashq qilingan kunlar (1-based). */
export const MOCK_ACTIVE_DAYS: number[] = [1, 2, 3, 5, 6, 8];

/** Kunlik maqsad (typing.com uslubida). */
export const MOCK_DAILY = { doneMin: 8, goalMin: 15 };

/** Eng uzun streak. */
export const MOCK_LONGEST = { days: 6, weeks: 2 };

/** Suhbat voronkasi — bosqichdan bosqichga o'tgan suhbatlar foizi (Analitika). */
export const MOCK_FUNNEL: Record<
  "kontakt" | "ehtiyoj" | "prezentatsiya" | "etiroz" | "yopish",
  number
> = {
  kontakt: 100,
  ehtiyoj: 86,
  prezentatsiya: 71,
  etiroz: 58,
  yopish: 34,
};

/** E'tiroz turi bo'yicha: nechta suhbatda uchragan va nechtasi muvaffaqiyatli yopilgan. */
export const MOCK_OBJECTION_STATS: Record<
  "narx" | "ishonch" | "vaqt" | "ehtiyoj" | "qaror" | "raqobat",
  { met: number; resolved: number }
> = {
  narx: { met: 14, resolved: 9 },
  ishonch: { met: 8, resolved: 6 },
  vaqt: { met: 11, resolved: 8 },
  ehtiyoj: { met: 6, resolved: 3 },
  qaror: { met: 9, resolved: 4 },
  raqobat: { met: 5, resolved: 3 },
};

export const MOCK_ACHIEVEMENTS: AchievementState[] = [
  { code: "birinchi_qongiroq", earned: true, earnedAt: "2026-06-20" },
  { code: "on_qongiroq", earned: true, earnedAt: "2026-06-27" },
  { code: "ellik_qongiroq", earned: false, earnedAt: null },
  { code: "yuz_qongiroq", earned: false, earnedAt: null },
  { code: "besh_yuz_qongiroq", earned: false, earnedAt: null },

  { code: "ball_70", earned: true, earnedAt: "2026-07-02" },
  { code: "ball_85", earned: false, earnedAt: null },
  { code: "ball_100", earned: false, earnedAt: null },
  { code: "barqaror_sifat", earned: false, earnedAt: null },

  { code: "osish_boshlandi", earned: true, earnedAt: "2026-06-30" },
  { code: "ishonchli_osish", earned: false, earnedAt: null },
  { code: "uch_qadam_yuqoriga", earned: true, earnedAt: "2026-07-05" },

  { code: "uch_kun_ketma_ket", earned: true, earnedAt: "2026-06-23" },
  { code: "yetti_kun_ketma_ket", earned: false, earnedAt: null },
  { code: "ottiz_kun_ketma_ket", earned: false, earnedAt: null },
  { code: "toqson_kun_ketma_ket", earned: false, earnedAt: null },

  { code: "birinchi_muzokara", earned: false, earnedAt: null },
  { code: "birinchi_chegirma", earned: false, earnedAt: null },
  { code: "birinchi_otsrochka", earned: false, earnedAt: null },
  { code: "shartlar_ustasi", earned: false, earnedAt: null },

  { code: "million_argument", earned: false, earnedAt: null },
  { code: "toliq_kolleksiya", earned: false, earnedAt: null },
];

/** Menejer demo topshiriqlari (ROP biriktirgan). Real: Supabase (#8). */
export const MOCK_ASSIGNMENTS_ACTIVE: Assignment[] = [
  {
    id: "a1",
    title: "Narx e'tirozini yopish",
    by: "ROP Jasur",
    target: 10,
    done: 6,
    dueDays: 3,
    status: "progress",
    focus: "narx",
  },
  {
    id: "a2",
    title: "Sovuq qo'ng'iroq: birinchi 30 soniya",
    by: "ROP Jasur",
    target: 8,
    done: 0,
    dueDays: 5,
    status: "new",
    focus: "vaqt",
  },
];

export const MOCK_ASSIGNMENTS_DONE: Assignment[] = [
  {
    id: "d1",
    title: "Ishonch e'tirozi bilan ishlash",
    by: "ROP Jasur",
    target: 6,
    done: 6,
    dueDays: 0,
    status: "done",
    focus: "ishonch",
  },
];

export const MOCK_TEAM: TeamRow[] = [
  {
    name: "Aziz",
    done: 8,
    target: 10,
    avg: 74,
    streakDays: 5,
    lastActiveHours: 2,
    funnel: {
      kontakt: 95,
      ehtiyoj: 80,
      prezentatsiya: 72,
      etiroz: 55,
      yopish: 40,
    },
    weakObjection: "narx",
  },
  {
    name: "Dilnoza",
    done: 10,
    target: 10,
    avg: 81,
    streakDays: 9,
    lastActiveHours: 1,
    funnel: {
      kontakt: 98,
      ehtiyoj: 90,
      prezentatsiya: 85,
      etiroz: 74,
      yopish: 60,
    },
    weakObjection: "qaror",
  },
  {
    name: "Sardor",
    done: 4,
    target: 10,
    avg: 63,
    streakDays: 2,
    lastActiveHours: 27,
    funnel: {
      kontakt: 88,
      ehtiyoj: 62,
      prezentatsiya: 50,
      etiroz: 38,
      yopish: 22,
    },
    weakObjection: "ishonch",
  },
  {
    name: "Nodira",
    done: 6,
    target: 10,
    avg: 69,
    streakDays: 4,
    lastActiveHours: 6,
    funnel: {
      kontakt: 92,
      ehtiyoj: 70,
      prezentatsiya: 58,
      etiroz: 45,
      yopish: 30,
    },
    weakObjection: "vaqt",
  },
];
