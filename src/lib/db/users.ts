/**
 * Foydalanuvchi darajasidagi persistensiya — kartasiz sinov hisoblagichi
 * (trial_used) va spaced-repetition uchun eng zaif e'tiroz turi.
 *
 * MUHIM (CLAUDE.md §3, §4): Supabase kalitlari bo'lmasa (mock rejim) — barcha
 * funksiyalar JIMGINA no-op/neytral qiymat qaytaradi. DB yozish latency
 * kritik yo'lni bloklamaydi — bu funksiyalar fon uchun mo'ljallangan.
 */

import { getSupabase } from "./client";
import type { ObjectionType } from "@/lib/coach";
import { TRIAL_LIMIT } from "@/lib/trial";

export interface TrialStatus {
  trialUsed: number;
  trialLimit: number;
  hasActiveSubscription: boolean;
}

/**
 * Foydalanuvchining sinov holatini o'qiydi. Supabase yo'q yoki userId
 * bo'lmasa — "cheklovsiz" (mock/anonim) holatni qaytaradi, hech narsani
 * bloklamaydi.
 */
export async function getTrialStatus(
  userId: string | null,
): Promise<TrialStatus> {
  const neutral: TrialStatus = {
    trialUsed: 0,
    trialLimit: TRIAL_LIMIT,
    hasActiveSubscription: true, // noma'lum/anonim holatda bloklamaymiz
  };
  const db = getSupabase();
  if (!db || !userId) return neutral;

  try {
    const [{ data: user, error: userErr }, { data: sub, error: subErr }] =
      await Promise.all([
        db.from("users").select("trial_used").eq("id", userId).maybeSingle(),
        db
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .limit(1)
          .maybeSingle(),
      ]);

    if (userErr) console.error("[db] getTrialStatus xato:", userErr.message);
    if (subErr)
      console.error("[db] getTrialStatus (sub) xato:", subErr.message);

    const hasActiveSubscription = !!sub;

    return {
      trialUsed: typeof user?.trial_used === "number" ? user.trial_used : 0,
      trialLimit: TRIAL_LIMIT,
      hasActiveSubscription,
    };
  } catch (err) {
    console.error(
      "[db] getTrialStatus istisno:",
      err instanceof Error ? err.message : err,
    );
    return neutral;
  }
}

/** Foydalanuvchining oxirgi tavsiya qilingan zaif e'tiroz turini o'qiydi. */
export async function getWeakObjection(
  userId: string | null,
): Promise<ObjectionType | null> {
  const db = getSupabase();
  if (!db || !userId) return null;

  try {
    const { data, error } = await db
      .from("users")
      .select("weak_objection_type")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error("[db] getWeakObjection xato:", error.message);
      return null;
    }
    return (data?.weak_objection_type as ObjectionType | null) ?? null;
  } catch (err) {
    console.error(
      "[db] getWeakObjection istisno:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Suhbat tugagach hisoblangan eng zaif e'tiroz turini saqlaydi (spaced-repetition). */
export async function saveWeakObjection(
  userId: string | null,
  type: ObjectionType | null,
): Promise<void> {
  const db = getSupabase();
  if (!db || !userId || !type) return;

  try {
    const { error } = await db
      .from("users")
      .update({
        weak_objection_type: type,
        weak_objection_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) console.error("[db] saveWeakObjection xato:", error.message);
  } catch (err) {
    console.error(
      "[db] saveWeakObjection istisno:",
      err instanceof Error ? err.message : err,
    );
  }
}
