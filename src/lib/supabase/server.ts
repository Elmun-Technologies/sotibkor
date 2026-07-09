/**
 * Supabase server (auth) klienti — Route Handler'larda (masalan
 * /auth/callback) foydalanuvchi sessiyasini cookie orqali o'qish/yozish uchun.
 *
 * Anon key + foydalanuvchi cookie'si ishlatiladi — RLS orqali faqat o'z
 * qatoriga kirish huquqi bo'ladi (service-role EMAS).
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* Server Component ichidan chaqirilsa — middleware yangilaydi. */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* Server Component ichidan chaqirilsa — middleware yangilaydi. */
          }
        },
      },
    },
  );
}
