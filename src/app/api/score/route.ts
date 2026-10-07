/**
 * POST /api/score — tugagan suhbat transkriptini rubrika bo'yicha baholaydi.
 * Kirish: { soha, persona, level, transcript:[{role,content}] }.
 *
 * OPENAI_API_KEY bo'lsa — real baholovchi (prompts/scoring/baholovchi.md).
 * Bo'lmasa — mock baho (kalitsiz demo).
 */

import { NextRequest } from "next/server";
import { scoreSession, mockScore } from "@/lib/scoring";
import type { ChatTurn } from "@/lib/llm";
import { hasOpenAI } from "@/lib/config";
import { rateLimitResponse, rejectCrossOrigin, requireAuthenticatedUser } from "@/lib/apiSecurity";
import { isPersonaKey, isSohaKey } from "@/lib/content";
import { parseTurns, readJsonBody } from "@/lib/http";

export const runtime = "nodejs";

interface ScoreBody {
  soha: string;
  persona: string;
  level: number;
  transcript: ChatTurn[];
}

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const live = hasOpenAI();
  const auth = live ? await requireAuthenticatedUser() : { userId: null, response: null };
  if (auth.response) return auth.response;
  const limited = rateLimitResponse(
    req,
    "score",
    { limit: live ? 5 : 60, windowMs: 60_000 },
    auth.userId,
  );
  if (limited) return limited;

  const parsedBody = await readJsonBody<ScoreBody>(req, 256 * 1024);
  if (!parsedBody.ok) {
    return Response.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const body = parsedBody.data;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "So'rov shakli noto'g'ri." }, { status: 400 });
  }
  if (!isSohaKey(body.soha) || !isPersonaKey(body.persona)) {
    return Response.json(
      { error: "Noma'lum soha yoki persona." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(body.level) || body.level < 1 || body.level > 6) {
    return Response.json({ error: "level 1..6 oralig'ida bo'lishi kerak." }, { status: 400 });
  }

  const parsed = parseTurns(body.transcript);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  const transcript = parsed.turns;
  if (transcript.length === 0) {
    return Response.json({ error: "Bo'sh transkript." }, { status: 400 });
  }

  if (!live) {
    return Response.json({ ...mockScore(transcript), provider: "mock" });
  }

  try {
    const result = await scoreSession({
      soha: body.soha,
      persona: body.persona,
      level: body.level,
      transcript,
    });
    return Response.json({ ...result, provider: "openai" });
  } catch (err) {
    // Xom xato matnini klientga chiqarmaymiz (info-leak) — faqat serverda loglaymiz.
    console.error(
      "[api/score] xato:",
      err instanceof Error ? err.message : err,
    );
    return Response.json({ error: "score_failed" }, { status: 502 });
  }
}
