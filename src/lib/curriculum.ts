/**
 * O'quv dasturi (curriculum) — typing.com uslubidagi strukturali ta'lim yo'li.
 * Unit'lar → ketma-ket darslar; har dars sotuv ko'nikmasiga qaratilgan
 * (soha/persona/level/rejim + fokus e'tiroz turi). Progress mock (kalitsiz),
 * real rejimda Supabase'dan keladi (issue).
 */

import type { PersonaKey, RejimKey, SohaKey } from "./content";
import type { ObjectionType } from "./coach";

export interface Lesson {
  id: string;
  soha: SohaKey;
  persona: PersonaKey;
  level: number;
  rejim: RejimKey;
  /** Fokus e'tiroz turi (targetlangan mashq). */
  focus?: ObjectionType;
}

export interface Unit {
  id: string;
  lessons: Lesson[];
}

export interface LessonProgress {
  completion: number; // 0..100
  stars: number;
  maxStars: number;
  score: number | null; // oxirgi ball 0..100
  timeSec: number;
}

/** 3 unit × 3 dars — asoslardan ustalikkacha. */
export const CURRICULUM: Unit[] = [
  {
    id: "asoslar",
    lessons: [
      {
        id: "ochilish",
        soha: "mebel",
        persona: "yumshoq-lekin-olmaydi",
        level: 1,
        rejim: "qongiroq",
      },
      {
        id: "ehtiyoj",
        soha: "telekom",
        persona: "bandman",
        level: 2,
        rejim: "qongiroq",
      },
      {
        id: "birinchi_otkaz",
        soha: "mebel",
        persona: "qimmatchi",
        level: 2,
        rejim: "qongiroq",
        focus: "narx",
      },
    ],
  },
  {
    id: "etirozlar",
    lessons: [
      {
        id: "narx_etirozi",
        soha: "bozor",
        persona: "qimmatchi",
        level: 3,
        rejim: "yuzma_yuz",
        focus: "narx",
      },
      {
        id: "ishonch_etirozi",
        soha: "bank",
        persona: "shubhali",
        level: 3,
        rejim: "qongiroq",
        focus: "ishonch",
      },
      {
        id: "vaqt_etirozi",
        soha: "fmcg",
        persona: "bandman",
        level: 3,
        rejim: "qongiroq",
        focus: "vaqt",
      },
    ],
  },
  {
    id: "ustalik",
    lessons: [
      {
        id: "bilagon_mijoz",
        soha: "talim",
        persona: "bilagon",
        level: 4,
        rejim: "qongiroq",
      },
      {
        id: "aralash_savdo",
        soha: "kochmas",
        persona: "qimmatchi",
        level: 5,
        rejim: "yuzma_yuz",
        focus: "qaror",
      },
      {
        id: "yopish",
        soha: "kochmas",
        persona: "yumshoq-lekin-olmaydi",
        level: 6,
        rejim: "yuzma_yuz",
        focus: "qaror",
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = CURRICULUM.flatMap((u) => u.lessons);

export function findLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/** Mock progress — ba'zi darslar tugagan, biri jarayonda, qolganlari yopiq. */
export const MOCK_LESSON_PROGRESS: Record<string, LessonProgress> = {
  ochilish: { completion: 100, stars: 3, maxStars: 3, score: 82, timeSec: 240 },
  ehtiyoj: { completion: 100, stars: 3, maxStars: 3, score: 78, timeSec: 300 },
  birinchi_otkaz: {
    completion: 100,
    stars: 2,
    maxStars: 3,
    score: 64,
    timeSec: 280,
  },
  narx_etirozi: {
    completion: 60,
    stars: 1,
    maxStars: 3,
    score: 53,
    timeSec: 210,
  },
  ishonch_etirozi: {
    completion: 0,
    stars: 0,
    maxStars: 3,
    score: null,
    timeSec: 0,
  },
  vaqt_etirozi: {
    completion: 0,
    stars: 0,
    maxStars: 3,
    score: null,
    timeSec: 0,
  },
  bilagon_mijoz: {
    completion: 0,
    stars: 0,
    maxStars: 3,
    score: null,
    timeSec: 0,
  },
  aralash_savdo: {
    completion: 0,
    stars: 0,
    maxStars: 3,
    score: null,
    timeSec: 0,
  },
  yopish: { completion: 0, stars: 0, maxStars: 3, score: null, timeSec: 0 },
};

export function lessonProgress(id: string): LessonProgress {
  return (
    MOCK_LESSON_PROGRESS[id] ?? {
      completion: 0,
      stars: 0,
      maxStars: 3,
      score: null,
      timeSec: 0,
    }
  );
}

/** Dars ochiqmi (oldingi dars tugagan bo'lsa) — typing.com ketma-ketligi. */
export function isLessonUnlocked(lessonId: string): boolean {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return true;
  const prev = ALL_LESSONS[idx - 1];
  return lessonProgress(prev.id).completion >= 100;
}

export function curriculumStars(): { earned: number; total: number } {
  let earned = 0;
  let total = 0;
  for (const l of ALL_LESSONS) {
    const p = lessonProgress(l.id);
    earned += p.stars;
    total += p.maxStars;
  }
  return { earned, total };
}
