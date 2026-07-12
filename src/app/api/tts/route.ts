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

export const runtime = "nodejs";

// Bitta gap bunchalik uzun bo'lmaydi (xarajat/DoS himoyasi).
const MAX_TEXT_LEN = 2000;

export async function POST(req: NextRequest) {
  if (!hasAisha()) {
    return Response.json(
      {
        error: "aisha_not_configured",
        message: "Aisha TTS sozlanmagan. Web Speech fallback.",
      },
      { status: 501 },
    );
  }

  let body: { text?: string; voice?: string };
  try {
    body = (await req.json()) as { text?: string; voice?: string };
  } catch {
    return Response.json({ error: "Noto'g'ri JSON." }, { status: 400 });
  }
  if (!body.text?.trim()) {
    return Response.json({ error: "text bo'sh." }, { status: 400 });
  }
  if (body.text.length > MAX_TEXT_LEN) {
    return Response.json({ error: "Matn juda uzun." }, { status: 413 });
  }

  try {
    const result = await textToSpeech({ text: body.text, voice: body.voice });
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
