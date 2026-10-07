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

/** Aisha uchun kalit bilan birga tasdiqlangan HTTP(S) endpoint ham shart. */
export const hasAisha = (): boolean => {
  if (!process.env.AISHA_API_KEY || !process.env.AISHA_BASE_URL) return false;
  try {
    const url = new URL(process.env.AISHA_BASE_URL);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && process.env.NODE_ENV !== "production")
    );
  } catch {
    return false;
  }
};

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

// Payme/Click env keys alone are not a readiness signal; checkout/webhook routes
// are not implemented yet, so payment is intentionally excluded from this list.
export type VendorMode = "mock" | "voice" | "db" | "auth";

/**
 * Har bir rejim uchun kerakli env mavjudligini qaytaradi (scripts/check-env.mjs
 * va /api/health ishlatadi). Hech qanday kalit qiymatini qaytarmaydi — faqat
 * "sozlangan/yo'q" bayonoti.
 */
export function vendorReadiness(): Record<VendorMode, boolean> {
  return {
    mock: true, // kalitsiz demo har doim ishlaydi
    voice: hasOpenAI() && hasAisha() && hasSupabaseAuth(),
    db: hasSupabase(),
    auth: hasSupabaseAuth(),
  };
}
