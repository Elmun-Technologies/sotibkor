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
import { rateLimitResponse, rejectCrossOrigin, requireAuthenticatedUser } from "@/lib/apiSecurity";
import { readBodyWithinLimit } from "@/lib/http";

export const runtime = "nodejs";

// Bitta ovozli xabar bunchalik katta bo'lmaydi (xarajat/DoS himoyasi).
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
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

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const limited = rateLimitResponse(
    req,
    "stt",
    { limit: 20, windowMs: 60_000 },
    auth.userId,
  );
  if (limited) return limited;
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return Response.json({ error: "multipart/form-data talab qilinadi." }, { status: 415 });
  }
  const boundedBody = await readBodyWithinLimit(req, MAX_AUDIO_BYTES + 64 * 1024);
  if (!boundedBody.ok) {
    return Response.json({ error: boundedBody.error }, { status: boundedBody.status });
  }

  let form: FormData;
  try {
    form = await new Response(boundedBody.bytes, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return Response.json({ error: "Audio so'rovi noto'g'ri." }, { status: 400 });
  }
  const file = form.get("audio");
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "audio fayli yo'q." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Audio fayl juda katta." }, { status: 413 });
  }
  if (file.type && !file.type.toLowerCase().startsWith("audio/")) {
    return Response.json({ error: "Audio MIME turi noto'g'ri." }, { status: 415 });
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
    console.error("[api/stt] xato:", err instanceof Error ? err.message : err);
    return Response.json({ error: "stt_failed" }, { status: 502 });
  }
}
