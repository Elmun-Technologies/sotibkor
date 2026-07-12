/**
 * Sessiya persistensiyasi — Supabase'ga suhbat, transkript va baho yozish.
 *
 * MUHIM (CLAUDE.md §3, §4):
 *  - Supabase kalitlari bo'lmasa (mock rejim) — barcha funksiyalar JIMGINA no-op.
 *    Hech qanday xato tashlanmaydi; mock rejim buzilmaydi.
 *  - DB yozish LATENCY kritik yo'lni (STT→LLM→TTS) bloklamasligi kerak.
 *    Bu funksiyalar fon uchun mo'ljallangan: xato bo'lsa loglaydi, tashlamaydi
 *    (chaqiruvchi await qilsa ham voice loop'ni to'xtatib qo'ymaydi).
 */

import { getSupabase } from "./client";
import type { ChatTurn } from "@/lib/llm";
import type { ScoreResult } from "@/lib/scoring";

/** Suhbat boshlanishi uchun kirish. */
export interface SaveSessionInput {
  /** Foydalanuvchi id (auth). Anonim/demo bo'lsa null. */
  userId?: string | null;
  soha: string;
  persona: string;
  /** Qiyinlik darajasi 1..N. */
  level: number;
}

/** Suhbat yakunlanishi uchun kirish. */
export interface FinishSessionInput {
  sessionId: string;
  status?: "finished" | "abandoned";
  durationMs?: number | null;
}

/**
 * Yangi suhbat qatorini yaratadi va uning id'sini qaytaradi.
 * Supabase yo'q bo'lsa — no-op, `null` qaytadi (chaqiruvchi buni demo id sifatida qabul qiladi).
 */
export async function saveSession(
  input: SaveSessionInput,
): Promise<string | null> {
  const db = getSupabase();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from("sessions")
      .insert({
        user_id: input.userId ?? null,
        soha: input.soha,
        persona: input.persona,
        level: Math.max(1, Math.floor(input.level) || 1),
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[db] saveSession xato:", error.message);
      return null;
    }
    return (data?.id as string) ?? null;
  } catch (err) {
    console.error(
      "[db] saveSession istisno:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Suhbat holatini yakuniy qilib belgilaydi (finished/abandoned) va davomiylikni yozadi.
 * Supabase yo'q bo'lsa — no-op.
 */
export async function finishSession(input: FinishSessionInput): Promise<void> {
  const db = getSupabase();
  if (!db) return;

  try {
    const { error } = await db
      .from("sessions")
      .update({
        status: input.status ?? "finished",
        duration_ms: input.durationMs ?? null,
        ended_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);

    if (error) console.error("[db] finishSession xato:", error.message);
  } catch (err) {
    console.error(
      "[db] finishSession istisno:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Butun transkriptni (har replika alohida qator) yozadi.
 * `speaker`: llm.ts ChatTurn.role → 'sotuvchi' (user) | 'mijoz' (assistant).
 * Supabase yo'q bo'lsa — no-op.
 */
export async function saveTranscript(
  sessionId: string,
  transcript: ChatTurn[],
): Promise<void> {
  const db = getSupabase();
  if (!db) return;
  if (transcript.length === 0) return;

  const rows = transcript.map((turn, index) => ({
    session_id: sessionId,
    turn_index: index,
    speaker: turn.role === "user" ? "sotuvchi" : "mijoz",
    text: turn.content,
  }));

  try {
    const { error } = await db.from("transcripts").insert(rows);
    if (error) console.error("[db] saveTranscript xato:", error.message);
  } catch (err) {
    console.error(
      "[db] saveTranscript istisno:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Baho natijasini (scores jadvali, session_id UNIQUE) yozadi.
 * Qayta yakunlashda konfliktni oldini olish uchun upsert ishlatiladi.
 * Supabase yo'q bo'lsa — no-op.
 */
export async function saveScore(
  sessionId: string,
  score: ScoreResult,
): Promise<void> {
  const db = getSupabase();
  if (!db) return;

  try {
    const { error } = await db.from("scores").upsert(
      {
        session_id: sessionId,
        total: score.total,
        breakdown: score.breakdown,
        mistakes: score.mistakes,
        strengths: score.strengths,
        xp_awarded: score.xp_awarded,
      },
      { onConflict: "session_id" },
    );

    if (error) console.error("[db] saveScore xato:", error.message);
  } catch (err) {
    console.error(
      "[db] saveScore istisno:",
      err instanceof Error ? err.message : err,
    );
  }
}
