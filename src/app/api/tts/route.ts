/**
 * POST /api/tts — matn → audio (Aisha.ai TTS).
 * Kirish: { text, voice? }.
 *
 * AISHA_API_KEY bo'lsa — real Aisha (TODO #1), audio qaytaradi.
 * Bo'lmasa — 501, klient brauzer Web Speech API (SpeechSynthesis) fallback'iga o'tadi.
 */

import { NextRequest } from "next/server";
import { textToSpeech } from "@/lib/aisha";
import { hasAisha } from "@/lib/config";
import { rateLimitResponse, rejectCrossOrigin, requireAuthenticatedUser } from "@/lib/apiSecurity";
import { readJsonBody } from "@/lib/http";

export const runtime = "nodejs";

// Bitta gap bunchalik uzun bo'lmaydi (xarajat/DoS himoyasi).
const MAX_TEXT_LEN = 2000;

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  if (!hasAisha()) {
    return Response.json(
      {
        error: "aisha_not_configured",
        message: "Aisha TTS sozlanmagan. Web Speech fallback.",
      },
      { status: 501 },
    );
  }

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const limited = rateLimitResponse(
    req,
    "tts",
    { limit: 30, windowMs: 60_000 },
    auth.userId,
  );
  if (limited) return limited;

  const parsed = await readJsonBody<{ text?: unknown; voice?: unknown }>(req, 16 * 1024);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.data;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "So'rov shakli noto'g'ri." }, { status: 400 });
  }
  if (typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "text bo'sh." }, { status: 400 });
  }
  if (body.text.length > MAX_TEXT_LEN) {
    return Response.json({ error: "Matn juda uzun." }, { status: 413 });
  }
  if (body.voice !== undefined && (typeof body.voice !== "string" || body.voice.length > 80)) {
    return Response.json({ error: "voice noto'g'ri." }, { status: 400 });
  }

  try {
    const result = await textToSpeech({ text: body.text, voice: body.voice as string | undefined });
    return new Response(result.audio, {
      headers: { "Content-Type": result.mimeType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    // Aisha'dan kelgan xom xato matnini klientga chiqarmaymiz (info-leak) —
    // faqat serverda loglaymiz.
    console.error("[api/tts] xato:", err instanceof Error ? err.message : err);
    return Response.json({ error: "tts_failed" }, { status: 502 });
  }
}
