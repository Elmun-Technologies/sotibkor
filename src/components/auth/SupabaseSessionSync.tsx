"use client";

import { useEffect } from "react";
import { hasSupabaseAuth } from "@/lib/config";
import { syncFromSupabase } from "@/lib/auth";

/**
 * Ilova yuklanganda (agar Supabase Auth sozlangan bo'lsa) live sessiyani
 * localStorage keshiga bir marta ko'chiradi — masalan foydalanuvchi yangi
 * qurilma/brauzerda ochsa yoki keshsiz holatda qaytsa. Hech qanday UI
 * chiqarmaydi, faqat side-effect.
 */
export function SupabaseSessionSync() {
  useEffect(() => {
    if (!hasSupabaseAuth()) return;
    void syncFromSupabase();
  }, []);

  return null;
}
