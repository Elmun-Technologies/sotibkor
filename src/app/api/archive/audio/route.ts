/**
 * POST /api/archive/audio — bitta audio klipni (mijoz TTS yoki sotuvchi
 * mikrofon yozuvi) Supabase Storage'ga yozadi.
 *
 * Klient FIRE-AND-FORGET chaqiradi (`void fetch(...)`, javobni kutmaydi) —
 * ovoz aylanasining (STT→LLM→TTS) kritik yo'liga hech qanday kechikish
 * qo'shmaydi (CLAUDE.md §4). Supabase yo'q bo'lsa — jimgina no-op.
 */

import { NextRequest } from "next/server";
import { hasSupabase } from "@/lib/config";
import { uploadTurnAudio, type Speaker } from "@/lib/audioStorage";

export const runtime = "nodejs";

function isSpeaker(v: FormDataEntryValue | null): v is Speaker {
  return v === "sotuvchi" || v === "mijoz";
}

export async function POST(req: NextRequest) {
  if (!hasSupabase()) {
    return Response.json({ persisted: false });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov." }, { status: 400 });
  }

  const sessionId = form.get("sessionId");
  const speaker = form.get("speaker");
  const clipIndex = Number(form.get("clipIndex"));
  const audio = form.get("audio");

  if (typeof sessionId !== "string" || !sessionId) {
    return Response.json({ error: "sessionId majburiy." }, { status: 400 });
  }
  if (!isSpeaker(speaker)) {
    return Response.json({ error: "speaker noto'g'ri." }, { status: 400 });
  }
  if (!Number.isFinite(clipIndex) || clipIndex < 0) {
    return Response.json({ error: "clipIndex noto'g'ri." }, { status: 400 });
  }
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "audio fayli yo'q." }, { status: 400 });
  }

  const buf = Buffer.from(await audio.arrayBuffer());
  const persisted = await uploadTurnAudio({
    sessionId,
    speaker,
    clipIndex,
    audio: buf,
    mimeType: audio.type || "application/octet-stream",
  });

  return Response.json({ persisted });
}
