/**
 * POST /api/chat — persona (mijoz) javobini STREAMING matn oqimi qilib qaytaradi.
 * Kirish: { soha, persona, level, history:[{role,content}] }.
 * role: "user" = sotuvchi, "assistant" = mijoz (persona).
 *
 * OPENAI_API_KEY bo'lsa — real OpenAI (prompts/personas/<...>.md).
 * Bo'lmasa — mock oqim (kalitsiz demo).
 */

import { NextRequest } from "next/server";
import {
  streamPersona,
  mockStreamPersona,
  loadPrompt,
  type ChatTurn,
} from "@/lib/llm";
import { hasOpenAI } from "@/lib/config";
import { PERSONALAR, SOHALAR, isPersonaKey, isSohaKey } from "@/lib/content";

export const runtime = "nodejs";

interface ChatBody {
  soha: string;
  persona: string;
  level: number;
  rejim?: string;
  history: ChatTurn[];
}

const REJIM_MATN: Record<string, string> = {
  qongiroq: "sovuq telefon qo'ng'irog'i (sotuvchi qo'ng'iroq qildi)",
  yuzma_yuz: "yuzma-yuz uchrashuv / do'kon-bozorda savdolashuv",
};

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ error: "Noto'g'ri JSON." }, { status: 400 });
  }

  if (!isSohaKey(body.soha) || !isPersonaKey(body.persona)) {
    return Response.json(
      { error: "Noma'lum soha yoki persona." },
      { status: 400 },
    );
  }
  const level = Number.isFinite(body.level)
    ? Math.max(1, Math.floor(body.level))
    : 1;
  const history = Array.isArray(body.history) ? body.history : [];

  const encoder = new TextEncoder();

  let source: AsyncGenerator<string, void, unknown>;
  if (hasOpenAI()) {
    const rejim =
      body.rejim && REJIM_MATN[body.rejim] ? body.rejim : "qongiroq";
    const systemPrompt = await loadPrompt(PERSONALAR[body.persona].promptFile, {
      soha: body.soha,
      mahsulot: SOHALAR[body.soha].mahsulot,
      level,
      rejim: REJIM_MATN[rejim],
    });
    source = streamPersona({ systemPrompt, history });
  } else {
    const assistantTurns = history.filter((t) => t.role === "assistant").length;
    source = mockStreamPersona({ personaKey: body.persona, assistantTurns });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of source) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n[xato: ${(err as Error).message}]`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": hasOpenAI() ? "openai" : "mock",
    },
  });
}
