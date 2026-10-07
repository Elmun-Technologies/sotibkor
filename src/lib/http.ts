/**
 * API route'lar uchun umumiy kirish-tekshirish yordamchilari.
 * So'rov hajmi va suhbat tarixini LLM'ga yuborishdan OLDIN cheklaydi.
 */

import type { ChatTurn } from "./llm";

const MAX_TURNS = 60;
const MAX_TURN_CHARS = 4_000;
const MAX_TOTAL_CHARS = 40_000;

export type ParsedTurns =
  | { ok: true; turns: ChatTurn[] }
  | { ok: false; status: number; error: string };

export type ParsedJson<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export type ParsedBody =
  | { ok: true; bytes: ArrayBuffer }
  | { ok: false; status: number; error: string };

/** `Content-Length` bo'lmasa yoki yolg'on bo'lsa ham oqimning haqiqiy hajmini cheklaydi. */
export async function readBodyWithinLimit(
  request: Request,
  maxBytes: number,
): Promise<ParsedBody> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { ok: false, status: 413, error: "So'rov juda katta." };
  }
  if (!request.body) {
    return { ok: false, status: 400, error: "So'rov tanasi bo'sh." };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: "So'rov juda katta." };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "So'rov tanasini o'qib bo'lmadi." };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  // This buffer was allocated by Uint8Array here, so it is a regular ArrayBuffer,
  // not a SharedArrayBuffer (which Request/Response BodyInit would reject).
  return { ok: true, bytes: bytes.buffer as ArrayBuffer };
}

/** Request body'ni cheklangan xotiraga o'qib, JSON sifatida parse qiladi. */
export async function readJsonBody<T>(
  request: Request,
  maxBytes = 256 * 1024,
): Promise<ParsedJson<T>> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, status: 415, error: "JSON format talab qilinadi." };
  }

  const bounded = await readBodyWithinLimit(request, maxBytes);
  if (!bounded.ok) return bounded;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bounded.bytes);
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 400, error: "Noto'g'ri JSON." };
  }
}

/**
 * Xom kirishni ChatTurn[] shakliga keltiradi. Faqat `user`/`assistant` rollari
 * qabul qilinadi — browser yuborgan `system`/`developer` ko'rsatmalarini LLM'ga
 * uzatish mumkin emas. Har replika va jami kontekstga alohida limit qo'yiladi.
 */
export function parseTurns(raw: unknown, max = MAX_TURNS): ParsedTurns {
  if (!Array.isArray(raw)) {
    return { ok: false, status: 400, error: "Suhbat tarixi ro'yxat bo'lishi kerak." };
  }
  if (raw.length > max) {
    return { ok: false, status: 413, error: "Suhbat tarixi juda uzun." };
  }

  const turns: ChatTurn[] = [];
  let totalChars = 0;

  for (const value of raw) {
    if (!value || typeof value !== "object") {
      return { ok: false, status: 400, error: "Suhbat replikasi noto'g'ri." };
    }
    const item = value as { role?: unknown; content?: unknown };
    if (item.role !== "user" && item.role !== "assistant") {
      return { ok: false, status: 400, error: "Suhbat roli noto'g'ri." };
    }
    if (typeof item.content !== "string" || !item.content.trim()) {
      return { ok: false, status: 400, error: "Suhbat matni bo'sh yoki noto'g'ri." };
    }
    if (item.content.length > MAX_TURN_CHARS) {
      return { ok: false, status: 413, error: "Bitta replika juda uzun." };
    }

    totalChars += item.content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return { ok: false, status: 413, error: "Suhbat konteksti juda katta." };
    }
    turns.push({ role: item.role, content: item.content.trim() });
  }

  return { ok: true, turns };
}
