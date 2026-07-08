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

  const started = Date.now();
  try {
    const result = await speechToText({
      audio: await file.arrayBuffer(),
      mimeType: file.type || "audio/webm",
      language: "uz",
    });
    return Response.json({ ...result, latencyMs: result.latencyMs ?? Date.now() - started });
  } catch (err) {
    // TODO(#1) real integratsiyagacha bu yerga tushadi.
    return Response.json({ error: (err as Error).message }, { status: 501 });
  }
}
