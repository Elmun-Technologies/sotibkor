"use client";

/**
 * Markazlashgan auth-gate — barcha himoyalangan (app) sahifalari ishlatadi.
 *
 * Muhim (KRITIK race condition tuzatildi): avval faqat localStorage keshi
 * sinxron o'qilardi va darrov /boshlash'ga uloqtirardi. Google OAuth bilan
 * qaytgan foydalanuvchi yangi brauzerda (kesh bo'sh, lekin real Supabase
 * sessiyasi bor) shu tufayli qamalib qolardi. Endi: kesh bo'sh bo'lsa va
 * Supabase Auth yoqilgan bo'lsa — avval `syncFromSupabase()` KUTILADI, keyin
 * redirect qarori qabul qilinadi.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isOnboarded, syncFromSupabase } from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/config";

export function useAuthGate(
  next?: string,
  opts: { requireOnboarded?: boolean } = {},
): boolean {
  const { requireOnboarded = true } = opts;
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const decide = () => {
      if (!active) return;
      // `next` berilmasa — joriy URL (query bilan) saqlanadi (masalan /trener
      // deep-link preseti yo'qolmasin). Effekt klient tomonda ishlaydi.
      const dest = next ?? window.location.pathname + window.location.search;
      if (!getUser()) {
        router.replace(`/boshlash?next=${encodeURIComponent(dest)}`);
        return;
      }
      if (requireOnboarded && !isOnboarded()) {
        router.replace(`/onboarding?next=${encodeURIComponent(dest)}`);
        return;
      }
      setReady(true);
    };

    // Tez yo'l: kesh allaqachon to'la yoki Supabase Auth yo'q (mock rejim).
    if (getUser() || !hasSupabaseAuth()) {
      decide();
    } else {
      // Kesh bo'sh + Supabase yoqilgan: real sessiya bo'lishi mumkin — kutamiz.
      void syncFromSupabase().finally(decide);
    }

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return ready;
}
