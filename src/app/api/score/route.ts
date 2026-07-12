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
import { isPersonaKey, isSohaKey } from "@/lib/content";
import { parseTurns } from "@/lib/http";

export const runtime = "nodejs";

interface ScoreBody {
  soha: string;
  persona: string;
  level: number;
  transcript: ChatTurn[];
}

export async function POST(req: NextRequest) {
  let body: ScoreBody;
  try {
    body = (await req.json()) as ScoreBody;
  } catch {
    return Response.json({ error: "Noto'g'ri JSON." }, { status: 400 });
  }

  const parsed = parseTurns(body.transcript);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  const transcript = parsed.turns;
  if (transcript.length === 0) {
    return Response.json({ error: "Bo'sh transkript." }, { status: 400 });
  }

  if (!hasOpenAI()) {
    return Response.json({ ...mockScore(transcript), provider: "mock" });
  }

  if (!isSohaKey(body.soha) || !isPersonaKey(body.persona)) {
    return Response.json(
      { error: "Noma'lum soha yoki persona." },
      { status: 400 },
    );
  }

  try {
    const result = await scoreSession({
      soha: body.soha,
      persona: body.persona,
      level: Math.max(1, Math.floor(body.level) || 1),
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
