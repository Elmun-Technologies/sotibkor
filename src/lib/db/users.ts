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
          .select("status, expires_at")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle(),
      ]);

    if (userErr) console.error("[db] getTrialStatus xato:", userErr.message);
    if (subErr)
      console.error("[db] getTrialStatus (sub) xato:", subErr.message);

    const hasActiveSubscription =
      !!sub && (!sub.expires_at || new Date(sub.expires_at) > new Date());

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

/**
 * Sinov hisoblagichini birga oshiradi (best-effort — moliyaviy emas, shuning
 * uchun o'qi-yoz oralig'idagi kamdan-kam poyga sharti muammo emas).
 * Supabase yo'q yoki userId bo'lmasa — no-op.
 */
export async function incrementTrialUsed(userId: string | null): Promise<void> {
  const db = getSupabase();
  if (!db || !userId) return;

  try {
    const { data, error: readErr } = await db
      .from("users")
      .select("trial_used")
      .eq("id", userId)
      .maybeSingle();
    if (readErr) {
      console.error("[db] incrementTrialUsed o'qish xato:", readErr.message);
      return;
    }
    const next =
      (typeof data?.trial_used === "number" ? data.trial_used : 0) + 1;
    const { error } = await db
      .from("users")
      .update({ trial_used: next })
      .eq("id", userId);
    if (error) console.error("[db] incrementTrialUsed xato:", error.message);
  } catch (err) {
    console.error(
      "[db] incrementTrialUsed istisno:",
      err instanceof Error ? err.message : err,
    );
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
