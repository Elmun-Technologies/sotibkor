/**
 * E'tiroz-javob baholovchisi ("O'z javobingni sina") — SOF, TESTLANADIGAN.
 *
 * Foydalanuvchi yozgan javobni:
 *  1. 6 uslubdan qaysi biriga tushishini aniqlaydi (`classifyStyle`),
 *  2. ball + kuchli/zaif tomonini beradi (`evaluateAnswer`).
 *
 * Kalitsiz (mock) rejim uchun evristika — real LLM baholovchi kelajakda ustiga
 * qo'yiladi (interfeys o'zgarmaydi). Til: jaydari o'zbek + aralash.
 */

import { ANSWER_STYLES, type AnswerStyle } from "./objections";

export type StrengthKey =
  "reframe" | "acknowledge" | "nextStep" | "question" | "clear";
export type WeaknessKey =
  "argues" | "tooShort" | "noClose" | "noEmpathy" | "none";

export interface AnswerEval {
  score: number; // 0..100
  style: AnswerStyle; // aniqlangan uslub
  strength: StrengthKey; // eng kuchli jihati
  weakness: WeaknessKey; // yaxshilash mumkin bo'lgan jihati
}

/** Har uslub uchun belgi (signal) so'zlar/iboralar. */
const STYLE_PATTERNS: Record<AnswerStyle, RegExp> = {
  // Yumor — kulgili belgi (emoji yoki hazil so'zlari). Eng aniq signal.
  yumor: /😄|😀|🙂|😂|😉|hazil|kulg/i,
  // Bosim — jur'atli, to'g'ridan-to'g'ri, shoshirish/oqibat/kafolat.
  bosim:
    /rostini|qaytarib beraman|qaytaraman|hoziroq|aks holda|jur'at|javob beraman|kafolatim|nega hali|tayyorman|ikki barobar|bugun hal|bugunoq|kutib turmaydi|kutmaydi|qo'ldan ketadi|mustahkamla|sinamasdan|ochilmay qoladi|o'qilmay qoladi|zaxira kerak|hozir gaplash|yeyapti/i,
  // Ekspertlik — dalil, hujjat, raqam, tajriba, isbot ko'rsatish.
  ekspertlik:
    /sertifikat|hujjat|dalil|mijoz|foiz|%|statistik|tajriba|portfolio|\bmisol|reyting|litsenziya|raqamda|hisob-kitob|ko'rsataman|tayyorlab bera|tayyorlab qo'y|3 fakt|3 asosiy|3 nuqta|3 muhim|\bmaterial|kafolatsiz/i,
  // Intriga — qiziqish uyg'otuvchi ochiq taklif/savol.
  intriga:
    /aytaymi|ko'rsataymi|bilasizmi|sababini|\bsir\b|qiziq|bitta savol|bir savol|eshitasizmi|o'ylab ko'rdingizmi/i,
  // Dojim — yumshoq qat'iylik: kichik qadam/sinov orqali oldinga surish.
  dojim:
    /qachon|muddat|belgila|aniqla|kelishamiz|kelishdik|\bbron\b|sinab|sinov|ertaga|navbat|bog'lanay|bog'lansam|boshlaylik|qilib ko'ring|keyin qaror|keyin o'zingiz|bosqichma|yonma-yon|tanlaymiz|rejalashtir/i,
  // Logika — qiymat/foyda mantiqi, solishtirish, hisob.
  logika:
    /qiymat|foyda|solishtir|hisobla|natija|\bsabab|chunki|narx emas|arzon emas|bo'lib to'lash|tejay/i,
};

// Tenglikda ustunlik: eng o'ziga xos (emoji/jur'at/dalil) belgilar avval,
// so'ng mazmun-mantiq (logika), oxirida umumiyroq savol/qadam signallari
// (intriga/dojim) — chunki ular boshqa uslublarda ham tez-tez uchraydi.
const STYLE_PRIORITY: AnswerStyle[] = [
  "yumor",
  "bosim",
  "ekspertlik",
  "intriga",
  "dojim",
  "logika",
];

/**
 * Javob matni qaysi uslubga ko'proq mos kelishini aniqlaydi.
 * Belgi topilmasa — zaxira sifatida "logika" (eng neytral uslub).
 * `bestCount` 0'dan boshlanadi: nol-belgili uslub hech qachon "yutmaydi",
 * shuning uchun signalsiz javob zaxira logikaga tushadi (birinchi ustuvorlikka emas).
 */
export function classifyStyle(answer: string): AnswerStyle {
  const s = answer.toLowerCase();
  let best: AnswerStyle = "logika";
  let bestCount = 0;
  for (const style of STYLE_PRIORITY) {
    const matches = s.match(new RegExp(STYLE_PATTERNS[style], "gi"));
    const count = matches ? matches.length : 0;
    if (count > bestCount) {
      bestCount = count;
      best = style;
    }
  }
  return best;
}

/** Javobni baholaydi: ball + uslub + kuchli/zaif tomon. */
export function evaluateAnswer(answer: string): AnswerEval {
  const clean = answer.trim();
  const s = clean.toLowerCase();
  const len = clean.length;

  const acknowledges =
    /tushun|to'g'ri|haqli|albatta|zo'r\b|yaxshi|achinarli/.test(s);
  const reframes =
    /qiymat|foyda|natija|solishtir|hisobla|farq|sabab|tejay/.test(s);
  const nextStep =
    /keling|kelishamiz|kelishdik|qachon|ertaga|bugun|\bbron\b|sinab|belgila|aniqla|ulanamiz|bog'lan/.test(
      s,
    );
  const question = clean.includes("?");
  const argues =
    /noto'g'ri|xato qilyapsiz|siz bilmaysiz|unaqa emas|bilmaysiz-ku/.test(s);

  let score = 45;
  if (len > 50) score += 8;
  if (len > 90) score += 4;
  if (acknowledges) score += 14;
  if (reframes) score += 16;
  if (nextStep || question) score += 12;
  if (argues) score -= 22;
  if (len < 20) score -= 15;
  score = Math.max(12, Math.min(97, score));

  const strength: StrengthKey = reframes
    ? "reframe"
    : acknowledges
      ? "acknowledge"
      : nextStep
        ? "nextStep"
        : question
          ? "question"
          : "clear";

  const weakness: WeaknessKey = argues
    ? "argues"
    : len < 25
      ? "tooShort"
      : !nextStep && !question
        ? "noClose"
        : !acknowledges
          ? "noEmpathy"
          : "none";

  return { score, style: classifyStyle(answer), strength, weakness };
}

export { ANSWER_STYLES };
