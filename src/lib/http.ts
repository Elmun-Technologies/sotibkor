/**
 * API route'lar uchun umumiy kirish-tekshirish yordamchilari.
 * /api/chat va /api/score bir xil "tarix/transkript" shaklini qabul qiladi.
 */

import type { ChatTurn } from "./llm";

const MAX_TURNS = 60;
const MAX_TURN_CHARS = 4000;

export type ParsedTurns =
  | { ok: true; turns: ChatTurn[] }
  | { ok: false; status: number; error: string };

/**
 * Xom kirishni ChatTurn[] shakliga keltiradi va hajmini cheklaydi
 * (xarajat/DoS himoyasi) — gap soni ≤ max, har gap ≤ MAX_TURN_CHARS belgi.
 */
export function parseTurns(raw: unknown, max = MAX_TURNS): ParsedTurns {
  const list = Array.isArray(raw) ? raw : [];
  if (list.length > max) {
    return { ok: false, status: 413, error: "Suhbat tarixi juda uzun." };
  }
  const turns: ChatTurn[] = list.map((t) => {
    const item = t as { role?: ChatTurn["role"]; content?: unknown };
    return {
      role: item?.role as ChatTurn["role"],
      content:
        typeof item?.content === "string"
          ? item.content.slice(0, MAX_TURN_CHARS)
          : "",
    };
  });
  return { ok: true, turns };
}
