/**
 * Muhit konfiguratsiyasi va provider tanlovi.
 * Kalitlar bo'lmasa — mock rejim (kalitsiz demo). Kalit bo'lsa — real provider.
 * Barcha maxfiy kalitlar server-only (NEXT_PUBLIC_ EMAS).
 */

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
