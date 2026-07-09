/**
 * Supabase brauzer (auth) klienti — Google OAuth va sessiyani kuzatish uchun.
 *
 * DIQQAT: bu `src/lib/db/client.ts`dagi service-role klientdan FARQLI —
 * bu yerda anon key ishlatiladi (RLS bilan himoyalangan, brauzerda xavfsiz).
 * Faqat `hasSupabaseAuth()` true bo'lganda chaqiriladi (src/lib/config.ts).
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
}
