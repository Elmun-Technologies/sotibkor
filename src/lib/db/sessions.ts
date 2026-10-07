/**
 * Sessiya persistensiyasi — Supabase'ga suhbat, transkript va baho yozish.
 *
 * Session create/complete API'lari bu helperlarni ataylab await qiladi: trial
 * limiti va yakuniy yozuvlar DB tranzaksiyasida tasdiqlanishi kerak. Ular
 * STT→LLM→TTS per-turn voice loop'ida chaqirilmaydi. Archive query'lari esa
 * Supabase xatosida xavfsiz bo'sh natijaga tushadi.
 */

import { getSupabase } from "./client";
import type { ChatTurn } from "@/lib/llm";
import type { ScoreResult } from "@/lib/scoring";
import { TRIAL_LIMIT } from "@/lib/trial";

/** Suhbat boshlanishi uchun kirish. */
export interface SaveSessionInput {
  /** Haqiqiy Supabase Auth foydalanuvchi id'si. */
  userId: string;
  soha: string;
  persona: string;
  /** Qiyinlik darajasi 1..6. */
  level: number;
}

export class SessionCreateError extends Error {
  constructor(public readonly code: "trial_exhausted" | "profile_missing") {
    super(code);
    this.name = "SessionCreateError";
  }
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
    // RPC trial hisoblagichini va session insert'ini bitta DB tranzaksiyasida
    // bajaradi; parallel so'rovlar free limitni chetlab o'ta olmaydi.
    const { data, error } = await db.rpc("create_training_session", {
      p_user_id: input.userId,
      p_soha: input.soha,
      p_persona: input.persona,
      p_level: Math.max(1, Math.min(6, Math.floor(input.level) || 1)),
      p_trial_limit: TRIAL_LIMIT,
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("trial_exhausted")) {
        throw new SessionCreateError("trial_exhausted");
      }
      if (message.includes("profile_missing")) {
        throw new SessionCreateError("profile_missing");
      }
      console.error("[db] saveSession xato:", error.message);
      return null;
    }

    const row = Array.isArray(data) ? data[0] : data;
    return (row?.session_id as string | undefined) ?? null;
  } catch (err) {
    if (err instanceof SessionCreateError) throw err;
    console.error(
      "[db] saveSession istisno:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** Sessiya joriy foydalanuvchiga tegishli ekanini server/service-role orqali tekshiradi. */
export async function sessionBelongsToUser(
  sessionId: string,
  userId: string,
  activeOnly = false,
): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;

  try {
    let query = db
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId);
    if (activeOnly) query = query.eq("status", "active");
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("[db] session ownership check xato:", error.message);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error(
      "[db] session ownership check istisno:",
      err instanceof Error ? err.message : err,
    );
    return false;
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
export interface CompleteSessionInput {
  sessionId: string;
  userId: string;
  status: "finished" | "abandoned";
  durationMs: number | null;
  transcript: ChatTurn[];
  score: ScoreResult | null;
}

/** Yakuniy yozuvlarni DB tranzaksiyasida va session egasini tekshirgan holda saqlaydi. */
export async function completeSession(
  input: CompleteSessionInput,
): Promise<"ok" | "not_found" | "failed"> {
  const db = getSupabase();
  if (!db) return "failed";

  try {
    const { data, error } = await db.rpc("complete_training_session", {
      p_user_id: input.userId,
      p_session_id: input.sessionId,
      p_status: input.status,
      p_duration_ms: input.durationMs,
      p_transcript: input.status === "finished" ? input.transcript : null,
      p_score: input.status === "finished" ? input.score : null,
    });
    if (error) {
      if (error.message.toLowerCase().includes("session_not_found_or_closed")) {
        return "not_found";
      }
      console.error("[db] completeSession xato:", error.message);
      return "failed";
    }
    return data === true ? "ok" : "failed";
  } catch (err) {
    console.error(
      "[db] completeSession istisno:",
      err instanceof Error ? err.message : err,
    );
    return "failed";
  }
}

export interface TranscriptRow {
  turnIndex: number;
  speaker: string;
  text: string;
}

/**
 * `scores` jadvalida `ScoreResult.closed` ustuni yo'q; arxiv tipi shu sabab
 * to'liq `ScoreResult` emas, faqat jadvalda saqlanadigan maydonlardan iborat.
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
