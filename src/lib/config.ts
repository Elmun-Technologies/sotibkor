/**
 * Muhit konfiguratsiyasi va provider tanlovi.
 * Kalitlar bo'lmasa — mock rejim (kalitsiz demo). Kalit bo'lsa — real provider.
 * Barcha maxfiy kalitlar server-only (NEXT_PUBLIC_ EMAS).
 */

const readPositiveNumber = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const hasOpenAI = (): boolean => !!process.env.OPENAI_API_KEY;
export const hasAisha = (): boolean => !!process.env.AISHA_API_KEY;
export const hasSupabase = (): boolean =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

/**
 * Brauzer/klient tomonidagi Supabase Auth (Google sign-in) sozlanganmi.
 * Faqat NEXT_PUBLIC_ o'zgaruvchilarga qaraydi — shuning uchun "use client"
 * komponentlarda ham xavfsiz chaqiriladi (Next.js build vaqtida inline qiladi).
 */
export const hasSupabaseAuth = (): boolean =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Ovoz faolligi (VAD) chegaralari — env orqali sozlanadi (issue #7: haqiqiy
 * mikrofonda kalibrlash uchun). Faqat NEXT_PUBLIC_ (brauzerga chiqadi, xavfsiz).
 * Kalibrlangan qiymatlar `.env.local` ga yoziladi; sozlanmasa sensible default.
 */
export const vadConfig = (): { thresholdRms: number; sustainMs: number } => ({
  thresholdRms: readPositiveNumber(process.env.NEXT_PUBLIC_VAD_THRESHOLD_RMS, 30),
  sustainMs: readPositiveNumber(process.env.NEXT_PUBLIC_VAD_SUSTAIN_MS, 220),
});

/** Asosiy til (hozircha faqat uz; ru keyingi bosqichda). */
export const defaultLocale = (): "uz" | "ru" =>
  process.env.NEXT_PUBLIC_LOCALE === "ru" ? "ru" : "uz";

export type VendorMode = "mock" | "voice" | "db" | "auth" | "payment";

/**
 * Har bir rejim uchun kerakli env mavjudligini qaytaradi (scripts/check-env.mjs
 * va kelajakdagi /api/health kengaytmasi ishlatadi). Hech qanday kalit qiymatini
 * qaytarmaydi — faqat "sozlangan/yo'q" bayonoti.
 */
export function vendorReadiness(): Record<VendorMode, boolean> {
  return {
    mock: true, // kalitsiz demo har doim ishlaydi
    voice: hasOpenAI() && hasAisha(),
    db: hasSupabase(),
    auth: hasSupabaseAuth(),
    payment:
      !!process.env.PAYME_MERCHANT_ID ||
      (!!process.env.CLICK_MERCHANT_ID && !!process.env.CLICK_SERVICE_ID),
  };
}
