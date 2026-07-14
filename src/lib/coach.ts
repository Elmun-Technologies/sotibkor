/**
 * Coaching engine — sotibkorning "10x" yadrosi.
 *
 * closeme'dan farqli o'laroq: jonli qiziqish (rapport) o'lchagichi, sotuv
 * voronkasi bosqichlarini aniqlash va zaif nuqtaga qarab spaced-repetition
 * tavsiyasi. Hammasi SOF, DETERMINISTIK funksiyalar (test qilinadi).
 *
 * Kalitsiz (mock) rejimda ham to'liq ishlaydi: transkriptdan evristik bo'yicha
 * hisoblaydi. Real rejimda LLM signal qaytarishi mumkin (kelajak) — interfeys
 * bir xil qoladi.
 */

export type ObjectionType =
  "narx" | "ishonch" | "vaqt" | "ehtiyoj" | "qaror" | "raqobat";

export type FunnelStage =
  "kontakt" | "ehtiyoj" | "prezentatsiya" | "etiroz" | "yopish";

export interface Turn {
  role: "user" | "assistant"; // user = sotuvchi, assistant = mijoz
  content: string;
}

export const OBJECTION_TYPES: ObjectionType[] = [
  "narx",
  "ishonch",
  "vaqt",
  "ehtiyoj",
  "qaror",
  "raqobat",
];

export const FUNNEL_STAGES: FunnelStage[] = [
  "kontakt",
  "ehtiyoj",
  "prezentatsiya",
  "etiroz",
  "yopish",
];

const lc = (s: string) => s.toLowerCase();
const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

/** Mijoz replikasidan qaysi e'tiroz turi yangraganini aniqlaydi. */
export function classifyObjection(text: string): ObjectionType | null {
  const s = lc(text);
  if (
    has(s, ["qimmat", "arzon", "chegirma", "narx", "pul", "byudjet", "qimbat"])
  )
    return "narx";
  if (
    has(s, [
      "original",
      "kafolat",
      "ishon",
      "aldov",
      "sifat",
      "sertifikat",
      "kopiya",
    ])
  )
    return "ishonch";
  if (
    has(s, [
      "o'ylab",
      "maslahat",
      "keyinroq",
      "hozircha",
      "podumayu",
      "o'ylash",
    ])
  )
    return "qaror";
  if (has(s, ["vaqt", "band", "keyin", "shoshil", "tez", "nekogda"]))
    return "vaqt";
  if (has(s, ["kerak emas", "bor", "kerakmas", "qiziqmayman", "ne nujno"]))
    return "ehtiyoj";
  if (has(s, ["boshqa joyda", "raqobat", "konkurent", "falon", "u yerda"]))
    return "raqobat";
  return null;
}

/**
 * Jonli QIZIQISH o'lchagichi (0..100). Sotuvchining har replikasi ta'sir qiladi.
 * Yaxshi texnika ko'taradi, xato tushiradi. Boshlang'ich ~48.
 */
export function interestScore(transcript: Turn[]): number {
  let interest = 48;
  const sellerTurns = transcript.filter((t) => t.role === "user");

  sellerTurns.forEach((turn, idx) => {
    const s = lc(turn.content);
    const words = s.split(/\s+/).filter(Boolean).length;

    // Ochiq savol — ehtiyojni ochadi
    if (s.includes("?")) interest += 7;
    // Qiymat/foyda tili
    if (
      has(s, [
        "kafolat",
        "foyda",
        "tejash",
        "sifat",
        "xizmat",
        "qulay",
        "bepul",
      ])
    )
      interest += 6;
    // E'tirozni tan olish (empatiya)
    if (has(s, ["tushunaman", "haqsiz", "to'g'ri", "albatta", "roziman"]))
      interest += 4;
    // Aniq keyingi qadam / closing urinishi
    if (has(s, ["kelishamiz", "rasmiylashtir", "buyurtma", "qachon", "keling"]))
      interest += 5;

    // Darrov chegirma (birinchi 2 qadamda) — qiymatni pasaytiradi
    if (idx < 2 && has(s, ["chegirma", "arzon qilaman", "tushiraman"]))
      interest -= 15;
    // Bosim
    if (has(s, ["hoziroq oling", "darrov", "tez bo'l", "shart"])) interest -= 8;
    // Juda qisqa/bo'sh javob
    if (words <= 2) interest -= 5;
    // Haddan uzun monolog
    if (words > 60) interest -= 4;
  });

  return Math.max(0, Math.min(100, Math.round(interest)));
}

/** Har turn'dan keyingi qiziqishni ketma-ket qaytaradi (jonli grafik uchun). */
export function interestSeries(transcript: Turn[]): number[] {
  const series: number[] = [];
  const acc: Turn[] = [];
  for (const turn of transcript) {
    acc.push(turn);
    if (turn.role === "user") series.push(interestScore(acc));
  }
  return series;
}

/** Voronka bosqichlarining qamrovi (0..1). */
export function stageCoverage(transcript: Turn[]): Record<FunnelStage, number> {
  const seller = transcript.filter((t) => t.role === "user");
  const joined = lc(seller.map((t) => t.content).join(" \n "));
  const first = seller[0] ? lc(seller[0].content) : "";

  const kontakt = has(first, ["assalom", "salom", "xayrli", "men", "kompaniya"])
    ? 1
    : seller.length > 0
      ? 0.4
      : 0;
  const ehtiyoj = Math.min(
    1,
    (joined.match(/\?/g)?.length ?? 0) / 3 +
      (has(joined, ["nima", "qanaqa", "qanday", "qidiryap"]) ? 0.3 : 0),
  );
  const prezentatsiya = has(joined, [
    "kafolat",
    "foyda",
    "sifat",
    "xizmat",
    "afzallik",
    "chunki",
  ])
    ? 1
    : 0.2;
  const etiroz =
    transcript
      .filter((t) => t.role === "assistant")
      .some((t) => classifyObjection(t.content) !== null) &&
    has(joined, ["tushunaman", "lekin", "chunki", "aslida"])
      ? 1
      : 0.3;
  const yopish = has(joined, [
    "kelishamiz",
    "rasmiylashtir",
    "buyurtma",
    "qachon",
    "keling",
    "ertaga",
  ])
    ? 1
    : 0;

  return {
    kontakt,
    ehtiyoj: Math.min(1, ehtiyoj),
    prezentatsiya,
    etiroz,
    yopish,
  };
}

/** Mijoz bergan e'tiroz turlari bo'yicha soni (kutubxonaga bog'lash uchun). */
export function objectionHistogram(
  transcript: Turn[],
): Record<ObjectionType, number> {
  const hist = Object.fromEntries(OBJECTION_TYPES.map((t) => [t, 0])) as Record<
    ObjectionType,
    number
  >;
  for (const turn of transcript) {
    if (turn.role !== "assistant") continue;
    const type = classifyObjection(turn.content);
    if (type) hist[type] += 1;
  }
  return hist;
}

export interface CoachRecommendation {
  weakestStage: FunnelStage;
  focusObjection: ObjectionType | null;
  message: string;
}

/**
 * Spaced-repetition tavsiyasi: eng zaif bosqich + eng ko'p qiynagan e'tiroz turi.
 * `breakdown` — SCORING rubrikasi bo'lim ballari (mavjud bo'lsa aniqroq).
 */
export function recommend(
  transcript: Turn[],
  breakdown?: {
    salomlashish: number;
    ehtiyoj_aniqlash: number;
    otkazlarga_ishlov: number;
    closing: number;
    ohang: number;
  },
): CoachRecommendation {
  // Bosqich foizlari (breakdown bo'lsa undan, bo'lmasa qamrovdan)
  let ratios: Record<FunnelStage, number>;
  if (breakdown) {
    ratios = {
      kontakt: breakdown.salomlashish / 10,
      ehtiyoj: breakdown.ehtiyoj_aniqlash / 20,
      prezentatsiya: breakdown.ohang / 20,
      etiroz: breakdown.otkazlarga_ishlov / 30,
      yopish: breakdown.closing / 20,
    };
  } else {
    ratios = stageCoverage(transcript);
  }

  const weakestStage = FUNNEL_STAGES.reduce((a, b) =>
    ratios[a] <= ratios[b] ? a : b,
  );

  const hist = objectionHistogram(transcript);
  const focusObjection = OBJECTION_TYPES.reduce<{
    type: ObjectionType | null;
    n: number;
  }>((best, type) => (hist[type] > best.n ? { type, n: hist[type] } : best), {
    type: null,
    n: 0,
  }).type;

  const stageLabel: Record<FunnelStage, string> = {
    kontakt: "kontakt o'rnatish",
    ehtiyoj: "ehtiyojni aniqlash",
    prezentatsiya: "qiymatni taqdim etish",
    etiroz: "e'tirozlarga ishlov",
    yopish: "yopish (closing)",
  };
  const objLabel: Record<ObjectionType, string> = {
    narx: "narx e'tirozi",
    ishonch: "ishonch/sifat e'tirozi",
    vaqt: "vaqt e'tirozi",
    ehtiyoj: "ehtiyoj yo'q e'tirozi",
    qaror: "\"o'ylab ko'ramiz\" e'tirozi",
    raqobat: "raqobatchi e'tirozi",
  };

  const msg = focusObjection
    ? `Eng zaif joying — ${stageLabel[weakestStage]}. Keyingi mashqda ${objLabel[focusObjection]} ko'proq chiqadi — aynan shunga tayyorlan.`
    : `Eng zaif joying — ${stageLabel[weakestStage]}. Keyingi mashqni shu bosqichga qarat.`;

  return { weakestStage, focusObjection, message: msg };
}

export type LiveHintKey =
  | "discountTooEarly"
  | "priceTooEarly"
  | "needsOpenQuestion"
  | "tooLongMonologue"
  | "tooShortReply"
  | "goodPace";

export interface LiveHint {
  key: LiveHintKey;
  tone: "good" | "warn" | "bad";
}

/**
 * Suhbat DAVOMIDA jonli maslahat (closeme faqat suhbatdan KEYIN baho beradi —
 * bu bizning farqlovchi xususiyatimiz). Sof evristika — LLM chaqiruvi YO'Q,
 * shuning uchun ovoz aylanasiga (STT→LLM→TTS) hech qanday kechikish
 * qo'shmaydi (CLAUDE.md §4). Har sotuvchi repликasidan keyin chaqiriladi,
 * eng dolzarb signalni qaytaradi (yoki aniq narsa bo'lmasa `null`).
 */
export function liveHint(transcript: Turn[]): LiveHint | null {
  const sellerTurns = transcript.filter((t) => t.role === "user");
  if (sellerTurns.length === 0) return null;

  const idx = sellerTurns.length - 1;
  const last = lc(sellerTurns[idx].content);
  const words = last.split(/\s+/).filter(Boolean).length;
  const askedQuestionBefore = sellerTurns
    .slice(0, idx)
    .some((t) => t.content.includes("?"));

  // Eng dolzarb (bad) — darrov chegirma taklif qilish (qiymatni himoya qilmasdan).
  if (idx < 2 && has(last, ["chegirma", "arzon qilaman", "tushiraman"])) {
    return { key: "discountTooEarly", tone: "bad" };
  }

  // Narxni ehtiyoj aniqlanmasdan juda erta aytish.
  if (
    idx < 2 &&
    !askedQuestionBefore &&
    has(last, ["so'm", "narx", "narxi", "qancha turadi"])
  ) {
    return { key: "priceTooEarly", tone: "warn" };
  }

  // Bir necha repликadan keyin hali ochiq savol yo'q.
  const hasQuestion = sellerTurns.some((t) => t.content.includes("?"));
  if (idx >= 2 && !hasQuestion) {
    return { key: "needsOpenQuestion", tone: "warn" };
  }

  if (words > 60) return { key: "tooLongMonologue", tone: "warn" };
  if (words > 0 && words <= 2 && idx >= 1) {
    return { key: "tooShortReply", tone: "warn" };
  }

  // Yaxshi holat: savol berildi + qiymat tili ishlatildi.
  if (
    last.includes("?") &&
    has(last, ["kafolat", "foyda", "tejash", "sifat", "xizmat", "qulay"])
  ) {
    return { key: "goodPace", tone: "good" };
  }

  return null;
}

/* ─────────────────────────── Nutq tahlili (10x-3) ─────────────────────────
 * closeme faqat bitta umumiy ball beradi; biz sotuvchining NUTQ ODATLARINI
 * ham tahlil qilamiz — parazit so'zlar, gap uzunligi, savol nisbati.
 * Matn asosidagi qism (kalitsiz ham ishlaydi, sof evristika). Ovoz tempi/
 * pauzalar keyingi bosqichda (real STT vaqt belgilaridan) qo'shiladi. */

/**
 * Jaydari o'zbek/aralash nutqda ko'p uchraydigan parazit ("filler") so'zlar.
 * Faqat aniq parazit bo'lgan so'zlar (haqiqiy ma'noli so'z bilan
 * chalkashmasin uchun) — butun so'z sifatida moslashtiriladi.
 */
export const FILLER_WORDS: string[] = [
  "ee",
  "eee",
  "aa",
  "aaa",
  "mm",
  "mmm",
  "yani",
  "yaъni",
  "anaqa",
  "anaqangi",
  "koroche",
  "nu",
  "vot",
  "tipa",
  "voobshe",
  "vabshe",
  "znachit",
];

export interface SpeechAnalysis {
  /** Sotuvchi replikalari soni. */
  replyCount: number;
  /** Jami so'zlar (sotuvchi). */
  totalWords: number;
  /** Har replikadagi o'rtacha so'z soni (yaxlitlangan). */
  avgWordsPerReply: number;
  /** Eng uzun replika (so'z). */
  longestReply: number;
  /** Savol o'z ichiga olgan replikalar ulushi (0..1). */
  questionRatio: number;
  /** Topilgan parazit so'zlar umumiy soni. */
  fillerCount: number;
  /** Qaysi parazit so'zlar ishlatilgani (kamayish tartibida, takrorsiz). */
  fillerWords: string[];
}

/**
 * Sotuvchi transkriptidan nutq odatlarini hisoblaydi — sof funksiya, LLM yo'q.
 * Faqat sotuvchi (role === "user") replikalari tahlil qilinadi.
 */
export function analyzeSpeech(transcript: Turn[]): SpeechAnalysis {
  const seller = transcript.filter((t) => t.role === "user");
  const empty: SpeechAnalysis = {
    replyCount: 0,
    totalWords: 0,
    avgWordsPerReply: 0,
    longestReply: 0,
    questionRatio: 0,
    fillerCount: 0,
    fillerWords: [],
  };
  if (seller.length === 0) return empty;

  const fillerSet = new Set(FILLER_WORDS);
  const fillerHits = new Map<string, number>();
  let totalWords = 0;
  let longestReply = 0;
  let questionReplies = 0;

  for (const turn of seller) {
    if (turn.content.includes("?")) questionReplies++;
    // So'zlarga ajratamiz: bo'shliq bo'yicha, so'ng har token chetidagi
    // tinish belgilarini olib tashlaymiz (unicode-regex bayrog'isiz — ES5).
    const tokens = lc(turn.content)
      .split(/\s+/)
      .map((w) => w.replace(/^[^0-9a-zъ']+|[^0-9a-zъ']+$/g, ""))
      .filter(Boolean);
    totalWords += tokens.length;
    if (tokens.length > longestReply) longestReply = tokens.length;
    for (const tok of tokens) {
      if (fillerSet.has(tok)) {
        fillerHits.set(tok, (fillerHits.get(tok) ?? 0) + 1);
      }
    }
  }

  const fillerCount = Array.from(fillerHits.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const fillerWords = Array.from(fillerHits.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  return {
    replyCount: seller.length,
    totalWords,
    avgWordsPerReply: Math.round(totalWords / seller.length),
    longestReply,
    questionRatio: questionReplies / seller.length,
    fillerCount,
    fillerWords,
  };
}
