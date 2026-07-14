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
