/**
 * Baholash (scoring) — tugagan suhbat transkriptini baholovchi LLM'ga uzatib,
 * rubrika bo'yicha JSON natijani oladi va validatsiya qiladi.
 *
 * SKELETON: to'liq implementatsiya issue #4 da. Rubrika va JSON formati:
 * docs/SCORING.md, baholovchi prompti: prompts/scoring/baholovchi.md.
 */

import { completeOnce, loadPrompt } from "./llm";
import type { ChatTurn } from "./llm";

/** docs/SCORING.md rubrikasi bo'yicha bo'lim ballari. */
export interface ScoreBreakdown {
  salomlashish: number; // 0..10
  ehtiyoj_aniqlash: number; // 0..20
  otkazlarga_ishlov: number; // 0..30
  closing: number; // 0..20
  ohang: number; // 0..20
}

export interface ScoreMistake {
  quote: string; // transkriptdan aniq iqtibos
  why: string; // nega xato
  better: string; // "bunday desang yaxshi bo'lardi" namunasi
}

export interface ScoreResult {
  total: number; // 0..100
  breakdown: ScoreBreakdown;
  mistakes: ScoreMistake[]; // 2..3
  strengths: string[]; // 1..2
  xp_awarded: number;
}

const BREAKDOWN_KEYS: (keyof ScoreBreakdown)[] = [
  "salomlashish",
  "ehtiyoj_aniqlash",
  "otkazlarga_ishlov",
  "closing",
  "ohang",
];

/** Baholovchi JSON javobini parse va sxema bo'yicha tekshiradi. */
export function parseScore(raw: string): ScoreResult {
  // Ba'zan model ```json ... ``` bilan o'raydi — tozalaymiz.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("Baholovchi noto'g'ri JSON qaytardi.");
  }

  const d = data as Record<string, unknown>;
  const breakdown = d.breakdown as Record<string, unknown> | undefined;
  if (!breakdown) throw new Error("breakdown yo'q.");

  for (const key of BREAKDOWN_KEYS) {
    if (typeof breakdown[key] !== "number") {
      throw new Error(`breakdown.${key} raqam emas.`);
    }
  }

  const total = d.total;
  if (typeof total !== "number") throw new Error("total raqam emas.");

  const sum = BREAKDOWN_KEYS.reduce(
    (acc, k) => acc + (breakdown[k] as number),
    0,
  );
  // ±1 tolerantlik (docs/SCORING.md).
  if (Math.abs(sum - total) > 1) {
    throw new Error(`total (${total}) breakdown yig'indisiga (${sum}) mos emas.`);
  }

  return data as ScoreResult;
}

/**
 * Transkriptni baholaydi. Noto'g'ri JSON qaytsa bir marta qayta so'raydi.
 * TODO(#4): retry logikasi, xatoni loglash, XP formulasini yakunlash.
 */
export async function scoreSession(opts: {
  soha: string;
  persona: string;
  level: number;
  transcript: ChatTurn[];
}): Promise<ScoreResult> {
  const transkript = opts.transcript
    .map((t) => `${t.role === "assistant" ? "MIJOZ" : "SOTUVCHI"}: ${t.content}`)
    .join("\n");

  const systemPrompt = await loadPrompt("scoring/baholovchi.md", {
    soha: opts.soha,
    persona: opts.persona,
    level: opts.level,
    transkript,
  });

  const raw = await completeOnce({
    systemPrompt,
    userContent: "Yuqoridagi transkriptni rubrika bo'yicha bahola va FAQAT JSON qaytar.",
  });

  return parseScore(raw);
}
