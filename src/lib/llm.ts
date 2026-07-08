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

/** CLAUDE.md: claude-sonnet. Aniq model IDsi env yoki config orqali sozlanadi. */
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY sozlanmagan (.env.local ni tekshiring).");
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
 * Streaming bo'lmagan bir martalik chaqiruv (masalan baholovchi — butun JSON kerak).
 * TODO(#4): baholovchi uchun ishlatiladi; JSON parse scoring.ts da.
 */
export async function completeOnce(opts: {
  systemPrompt: string;
  userContent: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const res = await anthropic.messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.systemPrompt,
    messages: [{ role: "user", content: opts.userContent }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
