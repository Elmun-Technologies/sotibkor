/**
 * Qo'ng'iroq audio arxivi — Supabase Storage ("call-audio" xususiy bucket).
 * Har ikki tomon audiosi saqlanadi: mijoz (Aisha TTS) va sotuvchi (mikrofon
 * yozuvi) — /arxiv sahifasida qayta eshitish uchun.
 *
 * MUHIM (CLAUDE.md §3, §4): Supabase yo'q bo'lsa — jimgina no-op (xato
 * tashlamaydi). Bu funksiyalar ovoz aylanasining KRITIK yo'lida emas — faqat
 * klientdan fire-and-forget (`void fetch(...)`) chaqiriladi, hech qachon
 * await/bloklanmaydi (STT→LLM→TTS latency'ga ta'sir qilmaydi).
 */

import { getSupabase } from "./db/client";

export type Speaker = "sotuvchi" | "mijoz";

const BUCKET = "call-audio";

/** MIME turidan fayl kengaytmasini chiqaradi (storage yo'li uchun). */
export function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("wav")) return "wav";
  if (m.includes("mp4") || m.includes("m4a")) return "m4a";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  return "bin";
}

export interface UploadTurnAudioInput {
  sessionId: string;
  clipIndex: number;
  speaker: Speaker;
  audio: Buffer;
  mimeType: string;
}

/**
 * Bitta audio klipni Storage'ga yozadi va `session_audio` qatoriga yozuv
 * qo'shadi. Supabase yo'q bo'lsa yoki xato bo'lsa — `false`, hech qachon
 * tashlamaydi.
 */
export async function uploadTurnAudio(
  input: UploadTurnAudioInput,
): Promise<boolean> {
  const db = getSupabase();
  if (!db) return false;

  const path = `${input.sessionId}/${input.speaker}-${input.clipIndex}.${extFromMime(input.mimeType)}`;

  try {
    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(path, input.audio, { contentType: input.mimeType, upsert: true });
    if (upErr) {
      console.error("[audioStorage] upload xato:", upErr.message);
      return false;
    }

    const { error: dbErr } = await db.from("session_audio").upsert(
      {
        session_id: input.sessionId,
        clip_index: input.clipIndex,
        speaker: input.speaker,
        storage_path: path,
        mime_type: input.mimeType,
      },
      { onConflict: "session_id,speaker,clip_index" },
    );
    if (dbErr) {
      console.error("[audioStorage] db yozish xato:", dbErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[audioStorage] istisno:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

export interface SessionAudioClip {
  clipIndex: number;
  speaker: Speaker;
  url: string;
}

/**
 * Sessiyaning barcha audio klip imzolangan URL'larini qaytaradi (1 soat
 * amal qiladi). Supabase yo'q yoki klip topilmasa — bo'sh massiv.
 */
export async function getSessionAudioClips(
  sessionId: string,
): Promise<SessionAudioClip[]> {
  const db = getSupabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("session_audio")
      .select("clip_index, speaker, storage_path")
      .eq("session_id", sessionId)
      .order("clip_index", { ascending: true });
    if (error || !data) return [];

    const clips: SessionAudioClip[] = [];
    for (const row of data as {
      clip_index: number;
      speaker: Speaker;
      storage_path: string;
    }[]) {
      const { data: signed, error: signErr } = await db.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);
      if (signErr || !signed) continue;
      clips.push({
        clipIndex: row.clip_index,
        speaker: row.speaker,
        url: signed.signedUrl,
      });
    }
    return clips;
  } catch (err) {
    console.error(
      "[audioStorage] getSessionAudioClips istisno:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
