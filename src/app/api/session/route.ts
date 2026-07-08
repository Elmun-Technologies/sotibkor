/**
 * POST /api/session — suhbat sessiyasini boshlash yoki yakunlash.
 *
 * Kirish (action bo'yicha):
 *   { action: "create", soha, persona, level, userId? }
 *   { action: "finish", sessionId?, soha, persona, level, transcript:[{role,content}],
 *     score?, durationMs?, status? }
 *
 * Persistensiya (CLAUDE.md §3, §4):
 *  - Supabase kalitlari bo'lsa — real yozish (sessions/transcripts/scores).
 *  - Bo'lmasa — jimgina no-op, 200 { persisted: false } qaytadi (mock rejim buzilmaydi).
 *  - "finish" da sessionId bo'lmasa (create qilinmagan demo), yangi session ochib
 *    keyin transkript/baho yoziladi.
 */

import { NextRequest } from "next/server";
import { hasSupabase } from "@/lib/config";
import {
  saveSession,
  finishSession,
  saveTranscript,
  saveScore,
} from "@/lib/db/sessions";
import type { ChatTurn } from "@/lib/llm";
import type { ScoreResult } from "@/lib/scoring";

export const runtime = "nodejs";

interface SessionBody {
  action?: "create" | "finish";
  sessionId?: string | null;
  userId?: string | null;
  soha?: string;
  persona?: string;
  level?: number;
  transcript?: ChatTurn[];
  score?: ScoreResult;
  durationMs?: number | null;
  status?: "finished" | "abandoned";
}

export async function POST(req: NextRequest) {
  let body: SessionBody;
  try {
    body = (await req.json()) as SessionBody;
  } catch {
    return Response.json({ error: "Noto'g'ri JSON." }, { status: 400 });
  }

  const action = body.action ?? "create";

  // Kalitsiz (mock) rejim — hech narsa yozilmaydi, lekin oqim buzilmaydi.
  if (!hasSupabase()) {
    return Response.json({
      persisted: false,
      sessionId: body.sessionId ?? null,
    });
  }

  if (action === "create") {
    if (!body.soha || !body.persona) {
      return Response.json(
        { error: "soha va persona majburiy." },
        { status: 400 },
      );
    }
    const sessionId = await saveSession({
      userId: body.userId ?? null,
      soha: body.soha,
      persona: body.persona,
      level: body.level ?? 1,
    });
    return Response.json({ persisted: sessionId !== null, sessionId });
  }

  // action === "finish"
  const transcript = Array.isArray(body.transcript) ? body.transcript : [];

  // sessionId bo'lmasa — demoda create qilinmagan; endi ochamiz.
  let sessionId = body.sessionId ?? null;
  if (!sessionId && body.soha && body.persona) {
    sessionId = await saveSession({
      userId: body.userId ?? null,
      soha: body.soha,
      persona: body.persona,
      level: body.level ?? 1,
    });
  }

  if (!sessionId) {
    return Response.json(
      { error: "sessionId yo'q va yangi sessiya ochib bo'lmadi." },
      { status: 400 },
    );
  }

  // Transkript va bahoni yozamiz, so'ng sessiyani yakunlaymiz.
  await saveTranscript(sessionId, transcript);
  if (body.score) await saveScore(sessionId, body.score);
  await finishSession({
    sessionId,
    status: body.status ?? "finished",
    durationMs: body.durationMs ?? null,
  });

  return Response.json({ persisted: true, sessionId });
}
