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

export async function POST(req: NextRequest) {
  if (!hasAisha()) {
    return Response.json(
      { error: "aisha_not_configured", message: "Aisha TTS sozlanmagan. Web Speech fallback." },
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

  try {
    const result = await textToSpeech({ text: body.text, voice: body.voice });
    return new Response(result.audio, {
      headers: { "Content-Type": result.mimeType, "Cache-Control": "no-store" },
    });
  } catch (err) {
    // TODO(#1) real integratsiyagacha.
    return Response.json({ error: (err as Error).message }, { status: 501 });
  }
}
