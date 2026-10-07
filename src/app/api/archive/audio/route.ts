/** Authenticated audio-archive upload; ownership is verified before service-role storage writes. */

import { NextRequest } from "next/server";
import { hasSupabase } from "@/lib/config";
import { requireAuthenticatedUser, rateLimitResponse, rejectCrossOrigin } from "@/lib/apiSecurity";
import { readBodyWithinLimit } from "@/lib/http";
import { uploadTurnAudio, type Speaker } from "@/lib/audioStorage";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_AUDIO_BYTES + 64 * 1024;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSpeaker(v: FormDataEntryValue | null): v is Speaker {
  return v === "sotuvchi" || v === "mijoz";
}

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  if (!hasSupabase()) {
    return Response.json({ persisted: false, demo: true });
  }

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const limited = rateLimitResponse(
    req,
    "archive-audio",
    { limit: 30, windowMs: 60_000 },
    auth.userId,
  );
  if (limited) return limited;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return Response.json({ error: "multipart/form-data talab qilinadi." }, { status: 415 });
  }
  const boundedBody = await readBodyWithinLimit(req, MAX_REQUEST_BYTES);
  if (!boundedBody.ok) {
    return Response.json({ error: boundedBody.error }, { status: boundedBody.status });
  }

  let form: FormData;
  try {
    form = await new Response(boundedBody.bytes, {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov." }, { status: 400 });
  }

  const sessionId = form.get("sessionId");
  const speaker = form.get("speaker");
  const clipIndex = Number(form.get("clipIndex"));
  const audio = form.get("audio");

  if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) {
    return Response.json({ error: "sessionId noto'g'ri." }, { status: 400 });
  }
  if (!isSpeaker(speaker)) {
    return Response.json({ error: "speaker noto'g'ri." }, { status: 400 });
  }
  if (!Number.isSafeInteger(clipIndex) || clipIndex < 0 || clipIndex > 50_000) {
    return Response.json({ error: "clipIndex noto'g'ri." }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "audio fayli yo'q." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Audio fayl juda katta." }, { status: 413 });
  }
  if (audio.type && !audio.type.toLowerCase().startsWith("audio/")) {
    return Response.json({ error: "Audio MIME turi noto'g'ri." }, { status: 415 });
  }

  const persisted = await uploadTurnAudio({
    sessionId,
    userId: auth.userId,
    speaker,
    clipIndex,
    audio: Buffer.from(await audio.arrayBuffer()),
    mimeType: audio.type || "application/octet-stream",
  });

  if (!persisted) {
    return Response.json({ error: "session_not_found_or_audio_save_failed" }, { status: 404 });
  }
  return Response.json({ persisted: true });
}
