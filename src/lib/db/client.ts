/**
 * Supabase server klienti (server-only).
 *
 * Qat'iy qoidalar (CLAUDE.md):
 *  - SUPABASE_SERVICE_KEY faqat process.env dan (server-only, hech qachon brauzerga chiqmaydi).
 *  - Kalit bo'lmasa (mock rejim) — HECH QAChON tashlab yuborilmaydi, `null` qaytadi.
 *    Chaqiruvchi kod `null` ni jimgina no-op sifatida qayta ishlaydi.
 *
 * Service key RLS'ni chetlab o'tadi — shuning uchun faqat server route'larida ishlatiladi.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/config";

let cached: SupabaseClient | null = null;

/**
 * Supabase server klientini qaytaradi. Kalitlar sozlanmagan bo'lsa `null`.
 * `null` — bu xato emas: kalitsiz (mock) rejim, persistensiya jimgina o'chirilgan.
 */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase()) return null;

  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY as string;
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cached;
}
