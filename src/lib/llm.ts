/**
 * OpenAI klienti — mijoz personasi va baholovchi uchun.
 *
 * SKELETON: asosiy skelet va streaming helper. Real prompt to'ldirish va
 * to'liq oqim pipeline'i issue #1 (persona) va #4 (baholovchi) da yakunlanadi.
 *
 * Qat'iy qoidalar (CLAUDE.md):
 *  - OPENAI_API_KEY faqat process.env dan (server-only).
 *  - Promptlar FAQAT /prompts papkadan yuklanadi — bu yerda string prompt YO'Q.
 *  - LLM chaqiruvlar STREAMING: birinchi to'liq gap tayyor bo'lishi bilan TTS'ga.
 *  - Latency: first-token ~400ms byudjeti.
 */

import OpenAI from "openai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PERSONALAR, type PersonaKey } from "./content";

/** Latency byudjeti uchun kichik/tez model; sifat kerak bo'lsa OPENAI_MODEL=gpt-4o. */
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY sozlanmagan (.env.local ni tekshiring).");
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Osilgan ulanish (VPN) kritik yo'lni ushlab qolmasin: butun so'rovga
      // qat'iy deadline. Streaming persona chaqiruvida qayta-urinishlar (retry)
      // latency qo'shadi — u yerda alohida maxRetries:0 beriladi.
      timeout: Number(process.env.OPENAI_TIMEOUT_MS) || 15000,
    });
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
  const openai = getClient();
  const stream = await openai.chat.completions.create(
    {
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 512,
      stream: true,
      messages: [
        { role: "system", content: opts.systemPrompt },
        ...opts.history.map((t) => ({ role: t.role, content: t.content })),
      ],
    },
    // Kritik yo'l: qayta-urinish latency qo'shadi — birinchi tokenni tez
    // olishimiz kerak. Xato bo'lsa klient darrov fallback'ga o'tadi.
    { maxRetries: 0 },
  );

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/**
 * MOCK rejim: OPENAI_API_KEY bo'lmasa, persona demo javoblarini (content.ts
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
  const openai = getClient();
  const res = await withRetry(
    () =>
      openai.chat.completions.create({
        model: opts.model ?? DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 1024,
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "user", content: opts.userContent },
        ],
      }),
    "completeOnce",
  );
  return res.choices[0]?.message?.content ?? "";
}
