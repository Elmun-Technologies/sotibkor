"use client";

/**
 * Lokal foydalanuvchi progressi — onboarding checklist uchun HAQIQIY signallar
 * (hardcode emas). Real Supabase ulanmaganida ham jonli ishlaydi: birinchi
 * yakunlangan suhbat localStorage'ga belgilanadi (auth keshi bilan bir xil
 * yondashuv). Supabase ulangach sessiyalar soni serverdan olinishi mumkin.
 */

const FIRST_SESSION_KEY = "sotibkor_first_session_done";

/** Birinchi suhbat yakunlanganini belgilaydi (trener finish oqimidan chaqiriladi). */
export function markFirstSessionDone(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRST_SESSION_KEY, "1");
  } catch {
    /* localStorage yo'q — e'tiborsiz */
  }
}

/** Foydalanuvchi kamida bitta suhbatni yakunlaganmi. */
export function hasFinishedSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(FIRST_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/* ───────────────── Haftalik reja progressi (10x-4) ─────────────────
 * Bajarilgan kunlar joriy hafta bo'yicha saqlanadi va yangi haftada
 * avtomatik nolga tushadi (kalit hafta identifikatoriga bog'langan). */

const PLAN_KEY = "sotibkor_plan_week";

/** Dushanba-asosli hafta identifikatori (yil + hafta raqami). */
export function currentWeekId(now: Date = new Date()): string {
  const d = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  // ISO hafta: payshanbaga siljitib yil-hafta hisoblanadi.
  const day = (d.getUTCDay() + 6) % 7; // dushanba=0
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-W${week}`;
}

interface PlanProgress {
  week: string;
  done: number[];
}

function readPlan(): PlanProgress {
  const week = currentWeekId();
  if (typeof window === "undefined") return { week, done: [] };
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (raw) {
      const p = JSON.parse(raw) as PlanProgress;
      if (p.week === week && Array.isArray(p.done)) return p;
    }
  } catch {
    /* e'tiborsiz */
  }
  return { week, done: [] };
}

/** Joriy haftada bajarilgan reja kunlari (dayIndex to'plami). */
export function getCompletedPlanDays(): Set<number> {
  return new Set(readPlan().done);
}

/** Bitta reja kunini bajarildi deb belgilaydi (joriy hafta). */
export function markPlanDayDone(dayIndex: number): Set<number> {
  const p = readPlan();
  if (!p.done.includes(dayIndex)) p.done.push(dayIndex);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(p));
    } catch {
      /* e'tiborsiz */
    }
  }
  return new Set(p.done);
}
