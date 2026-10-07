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
import { rateLimitResponse, rejectCrossOrigin, requireAuthenticatedUser } from "@/lib/apiSecurity";
import {
  PERSONALAR,
  SOHALAR,
  isPersonaKey,
  isSohaKey,
  isTilRejimKey,
} from "@/lib/content";
import { parseTurns, readJsonBody } from "@/lib/http";

export const runtime = "nodejs";

interface ChatBody {
  soha: string;
  persona: string;
  level: number;
  rejim?: string;
  tilRejimi?: string;
  mijozIsmi?: string;
  history: ChatTurn[];
}

const REJIM_MATN: Record<string, string> = {
  qongiroq: "sovuq telefon qo'ng'irog'i (sotuvchi qo'ng'iroq qildi)",
  yuzma_yuz: "yuzma-yuz uchrashuv / do'kon-bozorda savdolashuv",
};

// Til rejimi (moat: closeme faqat rus tilida — biz O'zbekiston reali,
// jaydari o'zbek/aralash/rus kod-almashtirishni ushlaymiz).
const TIL_REJIM_MATN: Record<string, string> = {
  sof_ozbek:
    "Sof o'zbekcha gapir — rus so'z-iboralarini deyarli ishlatma (faqat kundalik so'zlashuvga chuqur singib ketgan so'z chiqib qolsa mayli, lekin ataylab qo'shma). Jaydari, lekin toza o'zbek tilida.",
  aralash:
    'Aralash til (O\'zbekiston reali): ba\'zan rus/aralash so\'z ishlatishing tabiiy — "davay", "koroche", "normalno", "ladno", "dogovorimsya", "vsyo ravno". Lekin haddan oshirma, asosan jaydari o\'zbekcha.',
  rus: 'Rus tili ko\'proq aralashgan: ko\'p gaplarda rus so\'z/iboralarini tabiiy ishlat — "davay", "koroche", "normalno", "ladno", "dogovorimsya", "vsyo ravno", "tochno", "konechno", "voobshe". Ba\'zi qisqa jumlalarni ham to\'liq rus tilida aytishing mumkin, lekin asosiy fikrni sotuvchi tushunadigan qilib yetkaz.',
};

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const live = hasOpenAI();
  const auth = live ? await requireAuthenticatedUser() : { userId: null, response: null };
  if (auth.response) return auth.response;
  const limited = rateLimitResponse(
    req,
    "chat",
    { limit: live ? 30 : 120, windowMs: 60_000 },
    auth.userId,
  );
  if (limited) return limited;

  const parsedBody = await readJsonBody<ChatBody>(req, 256 * 1024);
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
  const level = body.level;
  const parsed = parseTurns(body.history);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  const history = parsed.turns;
  if (history.length === 0 || history[history.length - 1]?.role !== "user") {
    return Response.json({ error: "Oxirgi replika sotuvchidan bo'lishi kerak." }, { status: 400 });
  }

  const encoder = new TextEncoder();

  let source: AsyncGenerator<string, void, unknown>;
  try {
    if (hasOpenAI()) {
      const rejim =
        body.rejim && REJIM_MATN[body.rejim] ? body.rejim : "qongiroq";
      const tilRejimi =
        body.tilRejimi && isTilRejimKey(body.tilRejimi)
          ? body.tilRejimi
          : "aralash";
      const mijozIsmi =
        (typeof body.mijozIsmi === "string" ? body.mijozIsmi.trim().slice(0, 80) : "") ||
        PERSONALAR[body.persona].defaultName;
      const systemPrompt = await loadPrompt(
        PERSONALAR[body.persona].promptFile,
        {
          soha: body.soha,
          mahsulot: SOHALAR[body.soha].mahsulot,
          level,
          rejim: REJIM_MATN[rejim],
          til_rejimi: TIL_REJIM_MATN[tilRejimi],
          mijoz_ismi: mijozIsmi,
        },
      );
      source = streamPersona({ systemPrompt, history });
    } else {
      const assistantTurns = history.filter(
        (t) => t.role === "assistant",
      ).length;
      source = mockStreamPersona({ personaKey: body.persona, assistantTurns });
    }
  } catch (err) {
    // Oqim boshlanishidan oldingi xato (masalan prompt fayli topilmadi,
    // kalit rad etildi) — hali header yuborilmagan, toza JSON xato qaytaramiz.
    console.error(
      "[api/chat] source init xato:",
      err instanceof Error ? err.message : err,
    );
    return Response.json({ error: "chat_init_failed" }, { status: 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of source) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        // Oqim BOSHLANGANDAN keyingi xato — endi status kodini o'zgartirib
        // bo'lmaydi. Xom xato matnini "mijoz repликаsi" sifatida yubormaymiz
        // (immersiyani buzadi) — faqat serverda loglaymiz va oqimni yopamiz;
        // klient bo'sh/qisman javobni t.trener.chatError bilan qoplaydi.
        console.error(
          "[api/chat] stream xato:",
          err instanceof Error ? err.message : err,
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
