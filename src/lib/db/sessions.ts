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

/** /arxiv ro'yxati uchun bitta suhbatning qisqacha ma'lumoti. */
export interface SessionSummary {
  id: string;
  soha: string | null;
  persona: string | null;
  level: number | null;
  startedAt: string;
  endedAt: string | null;
  scoreTotal: number | null;
}

/**
 * Foydalanuvchining yakunlangan suhbatlari ro'yxati (eng yangisi birinchi).
 * Supabase yo'q bo'lsa — bo'sh massiv (mock rejimda tarix saqlanmaydi).
 */
export async function listSessions(userId: string): Promise<SessionSummary[]> {
  const db = getSupabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("sessions")
      .select("id, soha, persona, level, started_at, ended_at, scores(total)")
      .eq("user_id", userId)
      .eq("status", "finished")
      .order("started_at", { ascending: false })
      .limit(50);
    if (error || !data) {
      if (error) console.error("[db] listSessions xato:", error.message);
      return [];
    }

    return data.map((row) => {
      const scoresField = (
        row as unknown as {
          scores: { total: number }[] | { total: number } | null;
        }
      ).scores;
      const scoreTotal = Array.isArray(scoresField)
        ? (scoresField[0]?.total ?? null)
        : (scoresField?.total ?? null);
      return {
        id: row.id as string,
        soha: row.soha as string | null,
        persona: row.persona as string | null,
        level: row.level as number | null,
        startedAt: row.started_at as string,
        endedAt: row.ended_at as string | null,
        scoreTotal,
      };
    });
  } catch (err) {
    console.error(
      "[db] listSessions istisno:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

/** Bitta transkript qatori (/arxiv detali uchun). */
export interface TranscriptRow {
  turnIndex: number;
  speaker: string;
  text: string;
}

/**
 * `scores` jadvalida saqlanadigan maydonlar — `ScoreResult.closed` bu yerga
 * kirmaydi (jadval sxemasida yo'q, `saveScore()` ham yozmaydi), shuning
 * uchun to'liq `ScoreResult` emas, shu qism.
 */
export type ArchiveScore = Omit<ScoreResult, "closed">;

/** /arxiv detali — sessiya + to'liq transkript + baho. */
export interface SessionDetail extends SessionSummary {
  transcript: TranscriptRow[];
  score: ArchiveScore | null;
}

/**
 * Bitta suhbatning to'liq tafsilotini qaytaradi — FAQAT shu `userId`ga
 * tegishli bo'lsa (boshqa foydalanuvchi sessiyasini ko'rsatmaydi).
 * Topilmasa yoki Supabase yo'q bo'lsa — `null`.
 */
export async function getSessionDetail(
  sessionId: string,
  userId: string,
): Promise<SessionDetail | null> {
  const db = getSupabase();
  if (!db) return null;

  try {
    const { data: session, error: sErr } = await db
      .from("sessions")
      .select("id, soha, persona, level, started_at, ended_at")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();
    if (sErr || !session) return null;

    const { data: transcriptRows } = await db
      .from("transcripts")
      .select("turn_index, speaker, text")
      .eq("session_id", sessionId)
      .order("turn_index", { ascending: true });

    const { data: scoreRow } = await db
      .from("scores")
      .select("total, breakdown, mistakes, strengths, xp_awarded")
      .eq("session_id", sessionId)
      .maybeSingle();

    return {
      id: session.id as string,
      soha: session.soha as string | null,
      persona: session.persona as string | null,
      level: session.level as number | null,
      startedAt: session.started_at as string,
      endedAt: session.ended_at as string | null,
      scoreTotal: (scoreRow?.total as number | undefined) ?? null,
      transcript: (transcriptRows ?? []).map((t) => ({
        turnIndex: t.turn_index as number,
        speaker: t.speaker as string,
        text: t.text as string,
      })),
      score: scoreRow
        ? {
            total: scoreRow.total as number,
            breakdown: scoreRow.breakdown as ArchiveScore["breakdown"],
            mistakes: scoreRow.mistakes as ArchiveScore["mistakes"],
            strengths: scoreRow.strengths as ArchiveScore["strengths"],
            xp_awarded: scoreRow.xp_awarded as number,
          }
        : null,
    };
  } catch (err) {
    console.error(
      "[db] getSessionDetail istisno:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
