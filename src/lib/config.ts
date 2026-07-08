/**
 * Muhit konfiguratsiyasi va provider tanlovi.
 * Kalitlar bo'lmasa — mock rejim (kalitsiz demo). Kalit bo'lsa — real provider.
 * Barcha maxfiy kalitlar server-only (NEXT_PUBLIC_ EMAS).
 */

export const hasAnthropic = (): boolean => !!process.env.ANTHROPIC_API_KEY;
export const hasAisha = (): boolean => !!process.env.AISHA_API_KEY;
export const hasSupabase = (): boolean =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;
