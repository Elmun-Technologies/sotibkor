/**
 * POST /api/stt — audio → matn (Aisha.ai STT).
 * Kirish: multipart/form-data, "audio" fayli.
 *
 * AISHA_API_KEY bo'lsa — real Aisha (TODO #1). Bo'lmasa — 501, klient text/Web
 * Speech fallback'ga o'tadi.
 */

import { NextRequest } from "next/server";
import { speechToText } from "@/lib/aisha";
import { hasAisha } from "@/lib/config";

export const runtime = "nodejs";

// Bitta ovozli xabar bunchalik katta bo'lmaydi (xarajat/DoS himoyasi).
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!hasAisha()) {
    return Response.json(
      {
        error: "aisha_not_configured",
        message:
          "Aisha STT sozlanmagan. AISHA_API_KEY qo'shing yoki matn kiritish rejimidan foydalaning.",
      },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "audio fayli yo'q." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Audio fayl juda katta." }, { status: 413 });
  }

  const started = Date.now();
  try {
    const result = await speechToText({
      audio: await file.arrayBuffer(),
      mimeType: file.type || "audio/webm",
      language: "uz",
    });
    return Response.json({
      ...result,
      latencyMs: result.latencyMs ?? Date.now() - started,
    });
  } catch (err) {
    // Aisha'dan kelgan xom xato matnini klientga chiqarmaymiz (info-leak) —
    // faqat serverda loglaymiz.
    console.error("[api/stt] xato:", (err as Error).message);
    return Response.json({ error: "stt_failed" }, { status: 502 });
  }
}
