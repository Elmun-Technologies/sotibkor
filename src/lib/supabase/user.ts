/**
 * Haqiqiy foydalanuvchi id'sini FAQAT server tomonidagi cookie-sessiyadan
 * oladi — hech qachon so'rov tanasidan emas (IDOR: aks holda istalgan
 * chaqiruvchi boshqa foydalanuvchi nomidan yozuv yasashi mumkin edi, chunki
 * yozish service-role klient orqali RLS'ni chetlab o'tadi).
 */

import { hasSupabaseAuth } from "@/lib/config";
import { createClient } from "./server";

export async function currentUserId(): Promise<string | null> {
  if (!hasSupabaseAuth()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
