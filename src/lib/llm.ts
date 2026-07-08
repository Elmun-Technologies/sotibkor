/**
 * Claude (Anthropic) klienti — mijoz personasi va baholovchi uchun.
 *
 * SKELETON: asosiy skelet va streaming helper. Real prompt to'ldirish va
 * to'liq oqim pipeline'i issue #1 (persona) va #4 (baholovchi) da yakunlanadi.
 *
 * Qat'iy qoidalar (CLAUDE.md):
 *  - ANTHROPIC_API_KEY faqat process.env dan (server-only).
 *  - Promptlar FAQAT /prompts papkadan yuklanadi — bu yerda string prompt YO'Q.
 *  - LLM chaqiruvlar STREAMING: birinchi to'liq gap tayyor bo'lishi bilan TTS'ga.
 *  - Latency: first-token ~400ms byudjeti.
 */

import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PERSONALAR, type PersonaKey } from "./content";

/** CLAUDE.md: claude-sonnet. Aniq model IDsi env yoki config orqali sozlanadi. */
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY sozlanmagan (.env.local ni tekshiring).",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Prompt faylini /prompts papkadan yuklaydi va {{o'zgaruvchi}}larni almashtiradi.
 * Masalan: loadPrompt("personas/qimmatchi.md", { soha, mahsulot, level }).
 */
export async function loadPrompt(
  relativePath: string,
  vars: Record<string, string | number> = {},
): Promise<string> {
  const full = path.join(process.cwd(), "prompts", relativePath);
  let text = await fs.readFile(full, "utf8");
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{{${key}}}`, String(value));
  }
  return text;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Persona javobini STREAMING oqim qilib qaytaradi. Chaqiruvchi tomon oqimdan
 * gap-gap (`.`/`?`/`!`) ajratib, birinchi to'liq gapni darrov TTS'ga yuboradi.
 *
 * Foydalanish:
 *   for await (const chunk of streamPersona({ systemPrompt, history })) { ... }
 *
 * TODO(#1): sentence-splitter + TTS orqali oqim; latency o'lchash.
 */
export async function* streamPersona(opts: {
  systemPrompt: string;
  history: ChatTurn[];
  model?: string;
  maxTokens?: number;
}): AsyncGenerator<string, void, unknown> {
  const anthropic = getClient();
  const stream = anthropic.messages.stream({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 512,
    system: opts.systemPrompt,
    messages: opts.history.map((t) => ({ role: t.role, content: t.content })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * MOCK rejim: ANTHROPIC_API_KEY bo'lmasa, persona demo javoblarini (content.ts
 * `mockLines`) so'zma-so'z oqim qilib qaytaradi — real LLM emas, faqat kalitsiz
 * loyihani ishlatib ko'rish uchun. Har chaqiruvda oldingi mijoz replikalari
 * soniga qarab keyingi qatorni tanlaydi.
 */
export async function* mockStreamPersona(opts: {
  personaKey: PersonaKey;
  assistantTurns: number;
}): AsyncGenerator<string, void, unknown> {
  const lines = PERSONALAR[opts.personaKey].mockLines;
  const idx = Math.min(opts.assistantTurns, lines.length - 1);
  const text = lines[idx];
  // So'zma-so'z "oqim" — real streaming his qilinishi uchun.
  for (const word of text.split(" ")) {
    yield word + " ";
  }
}

/**
 * Oddiy retry helper: fn'ni bir marta qayta uradi (jami 2 urinish).
 * Birinchi urinish xato bersa — xato loglanadi va qayta urinadi. Ikkinchi ham
 * xato bersa — xato tashlanadi. Tarmoq/oniy nosozliklar uchun (latency kritik
 * yo'lda EMAS — baholovchi kabi streaming bo'lmagan chaqiruvlar uchun).
 */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(
      `[llm] ${label} birinchi urinish xato, qayta urinilyapti:`,
      err instanceof Error ? err.message : err,
    );
    return await fn();
  }
}

/**
 * Streaming bo'lmagan bir martalik chaqiruv (masalan baholovchi — butun JSON kerak).
 * Tarmoq xatosida bir marta qayta uriladi (withRetry).
 */
export async function completeOnce(opts: {
  systemPrompt: string;
  userContent: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const res = await withRetry(
    () =>
      anthropic.messages.create({
        model: opts.model ?? DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 1024,
        system: opts.systemPrompt,
        messages: [{ role: "user", content: opts.userContent }],
      }),
    "completeOnce",
  );
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
