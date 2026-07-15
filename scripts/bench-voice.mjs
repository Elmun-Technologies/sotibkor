#!/usr/bin/env node
/**
 * Latency benchmark — ovoz aylanasi (issue #5).
 *
 * Aylananing har bosqichini o'lchaydi va byudjetga solishtiradi:
 *   STT ~500ms, LLM first-token ~400ms, TTS (birinchi chunk) ~500ms,
 *   jami (perceived) < 2000ms.  (docs/ARCHITECTURE.md §5)
 *
 * Ishga tushirish:  node scripts/bench-voice.mjs   (yoki: npm run bench:voice)
 *
 * Kalitlar bo'lsa real chaqiruv qilinadi; bo'lmasa MOCK rejimda pipeline
 * mexanikasi (streaming, gap ajratish, birinchi audiogacha vaqt) o'lchanadi.
 * API kalitlar HECH QAChON logga chiqarilmaydi.
 */

const BUDGET = { stt: 500, llmFirst: 400, ttsFirst: 500, total: 2000 };
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasAisha = !!process.env.AISHA_API_KEY;
const BASE = process.env.BENCH_BASE_URL ?? "http://localhost:3000";

const now = () => performance.now();
const ms = (n) => `${Math.round(n)}ms`;

function line(label, value, budget) {
  const over = value != null && value > budget;
  const mark = value == null ? "·" : over ? "❌" : "✅";
  const shown = value == null ? "—" : ms(value);
  console.log(
    `  ${mark} ${label.padEnd(22)} ${shown.padStart(8)}   (byudjet ≤ ${ms(budget)})`,
  );
}

async function benchLlmStreaming() {
  // Chat route'dan streaming: birinchi token va birinchi to'liq gapgacha vaqt.
  const body = {
    soha: "mebel",
    persona: "qimmatchi",
    level: 2,
    history: [
      { role: "user", content: "Assalomu alaykum, bu divan sizga yoqdimi?" },
    ],
  };
  const start = now();
  let firstToken = null;
  let firstClause = null; // earlyFirst: birinchi ergash-gap (vergul/tire) chegarasi ≥14 belgi
  let firstSentence = null;
  let acc = "";
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      if (firstToken == null) firstToken = now() - start;
      acc += chunk;
      // earlyFirst optimizatsiyasi (src/lib/sentence.ts): birinchi tovush uchun
      // to'liq gap emas, ergash-gap chegarasi ham yetarli.
      if (firstClause == null) {
        const cb = acc.match(/[,—:;]/);
        if (cb && cb.index >= 14) firstClause = now() - start;
      }
      if (firstSentence == null && /[.!?…]/.test(acc))
        firstSentence = now() - start;
    }
  } catch (err) {
    console.error(
      `  (chat route ishlamadi: ${err.message}. Dev server ishga tushiring: npm run dev)`,
    );
    return { firstToken: null, firstClause: null, firstSentence: null };
  }
  return { firstToken, firstClause, firstSentence };
}

async function main() {
  console.log("\n🎙  Sotuvchi Trainer — ovoz aylanasi latency benchmark\n");
  console.log(
    `  Rejim: LLM=${hasOpenAI ? "real" : "mock"}  STT/TTS=${hasAisha ? "real" : "mock/web-speech"}`,
  );
  console.log(`  Base:  ${BASE}\n`);

  const { firstToken, firstClause, firstSentence } = await benchLlmStreaming();

  console.log("  Natijalar:");
  line("STT", null, BUDGET.stt);
  console.log(
    "     (STT brauzer/Aisha tomonda o'lchanadi — voice-test skiliga qarang)",
  );
  line("LLM first-token", firstToken, BUDGET.llmFirst);
  // TTFB'ni belgilaydigan bo'lak: earlyFirst (birinchi ergash-gap) yoki to'liq gap.
  const firstAudioTrigger = firstClause ?? firstSentence;
  line("Birinchi bo'lak (earlyFirst)", firstClause, BUDGET.ttsFirst);
  line("To'liq gap (zaxira)", firstSentence, BUDGET.ttsFirst);

  const perceived =
    firstAudioTrigger != null ? firstAudioTrigger + BUDGET.ttsFirst : null;
  line("TTFB (taxminiy, birinchi tovush)", perceived, BUDGET.total);

  console.log("");
  console.log(
    "  Deadline'lar (osilishga qarshi): STT 8s · TTS 3.5s · LLM 1-token 4.5s —",
  );
  console.log(
    "  oshsa klient zaxira (Web Speech / matn) rejimiga o'tadi, dialog muzlamaydi.",
  );
  if (perceived != null && perceived > BUDGET.total) {
    console.log(
      "\n  ⚠️  Aylana byudjetdan oshdi — sekin bosqichni optimallashtiring.\n",
    );
    process.exit(1);
  }
  console.log(
    "\n  Eslatma: real latency uchun kalitlarni sozlab, dev serverga qarshi ishga tushiring.\n",
  );
}

main();
