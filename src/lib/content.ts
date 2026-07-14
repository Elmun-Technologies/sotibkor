/**
 * Kontent registri — sohalar va personalar. UI shu yerdan ro'yxat oladi.
 * Ko'rinadigan nomlar i18n'da (src/i18n/uz.json), bu yerda faqat kalitlar va
 * texnik metama'lumot (prompt yo'li, mock demo javoblar).
 *
 * DIQQAT: `mockLines` — FAQAT kalitsiz demo rejimi uchun oldindan yozilgan
 * javoblar (real LLM prompti EMAS). Real persona prompti prompts/personas/ da.
 */

import type { ObjectionType } from "./coach";

export type SohaKey =
  "bank" | "telekom" | "talim" | "mebel" | "kochmas" | "bozor" | "fmcg";
export type PersonaKey =
  "qimmatchi" | "shubhali" | "bandman" | "bilagon" | "yumshoq-lekin-olmaydi";

/** Suhbat rejimi — O'zbekiston bozori uchun cold-call'dan tashqari yuzma-yuz savdolashuv. */
export type RejimKey = "qongiroq" | "yuzma_yuz";
export const REJIM_KEYS: RejimKey[] = ["qongiroq", "yuzma_yuz"];
export function isRejimKey(v: string): v is RejimKey {
  return v === "qongiroq" || v === "yuzma_yuz";
}

/**
 * Til rejimi — persona qay darajada rus so'z/ibora aralashtirishi (moat: closeme
 * faqat rus tilida, biz O'zbekiston reali — jaydari o'zbek/aralash/rus kod-almashtirish).
 */
export type TilRejimKey = "sof_ozbek" | "aralash" | "rus";
export const TIL_REJIM_KEYS: TilRejimKey[] = ["sof_ozbek", "aralash", "rus"];
export function isTilRejimKey(v: string): v is TilRejimKey {
  return v === "sof_ozbek" || v === "aralash" || v === "rus";
}

export interface Soha {
  key: SohaKey;
  /** Persona promptidagi {{mahsulot}} uchun namunaviy mahsulot konteksti. */
  mahsulot: string;
}

export interface Persona {
  key: PersonaKey;
  /** prompts/personas/<file> — loadPrompt shu yo'lni ishlatadi. */
  promptFile: string;
  /** Demo (kalitsiz) rejim uchun eskalatsiyalanuvchi otkazlar. */
  mockLines: string[];
  /**
   * Bu persona eng ko'p ishlatadigan e'tiroz turi (spaced-repetition uchun,
   * src/lib/coach.ts `recommend()`) — otkaz repertuariga mos (prompts/personas/*.md).
   */
  primaryObjection?: ObjectionType;
  /**
   * Standart ism — aniq ssenariy (nomli mijoz) tanlanmagan bo'lsa shu
   * ishlatiladi (avatar/CallView'da va {{mijoz_ismi}} prompt o'zgaruvchisida),
   * shunday qilib persona doim jonli ism bilan tanishtiradi.
   */
  defaultName: string;
}

export const SOHALAR: Record<SohaKey, Soha> = {
  bank: {
    key: "bank",
    mahsulot:
      "muddatli omonat va kredit karta (yillik 24%, cashback 1%, bepul yetkazib berish)",
  },
  telekom: {
    key: "telekom",
    mahsulot:
      "mobil tarif: oyiga 50 000 so'm, 30GB internet, cheksiz ichki qo'ng'iroq",
  },
  talim: {
    key: "talim",
    mahsulot:
      "3 oylik onlayn IT kurs (2 500 000 so'm, ish bilan ta'minlash kafolati, bo'lib to'lash)",
  },
  mebel: {
    key: "mebel",
    mahsulot:
      "burchak divan (5 900 000 so'm, 2 yil kafolat, bepul yetkazib berish va yig'ish)",
  },
  kochmas: {
    key: "kochmas",
    mahsulot:
      "yangi binoda 2 xonali kvartira (yaxshi joylashuv, 12 oy bo'lib to'lash, hujjatlar tayyor)",
  },
  bozor: {
    key: "bozor",
    mahsulot:
      "marketpleys sotuvchilariga (Uzum kabi) logistika va reklama xizmati (oyiga 300 000 so'm)",
  },
  fmcg: {
    key: "fmcg",
    mahsulot:
      "do'konlar uchun ichimlik/oziq-ovqat distribyutsiyasi (ulgurji narx, haftalik yetkazib berish, konsignatsiya)",
  },
};

export const PERSONALAR: Record<PersonaKey, Persona> = {
  qimmatchi: {
    key: "qimmatchi",
    promptFile: "personas/qimmatchi.md",
    primaryObjection: "narx",
    defaultName: "Aziz aka",
    mockLines: [
      "Obbo, qimmat-ku bu. Boshqa joyda arzonroq beryapti-ku.",
      "Baribir qimmat. Chegirma yo'qmi ishqilib?",
      "Hmm... mayli, agar shunchalik foydali bo'lsa, bir o'ylab ko'ray-chi.",
    ],
  },
  shubhali: {
    key: "shubhali",
    promptFile: "personas/shubhali.md",
    primaryObjection: "ishonch",
    defaultName: "Dilnoza opa",
    mockLines: [
      "Silaniki original o'zimi? Kafolat bormi umuman?",
      "E bilmadim-da, buzilib qolsa nima bo'ladi?",
      "Hujjatini ko'rsata olsangiz, unda ishonsa bo'lar.",
    ],
  },
  bandman: {
    key: "bandman",
    promptFile: "personas/bandman.md",
    primaryObjection: "vaqt",
    defaultName: "Sardor",
    mockLines: [
      "Vaqtim yo'q, qisqa qiling, nima gap?",
      "Tez ayting, ketyapman.",
      "Xo'p, agar shunaqa bo'lsa ayting-chi qanaqa qilamiz.",
    ],
  },
  bilagon: {
    key: "bilagon",
    promptFile: "personas/bilagon.md",
    primaryObjection: "raqobat",
    defaultName: "Jamshid aka",
    mockLines: [
      "Bu eskirgan-ku, yangisi chiqqan. Men bu sohada ishlaganman.",
      "Xarakteristikasini bilasizmi o'zi? Menga o'rgatmang.",
      "Ha, endi to'g'ri gapiryapsiz. Shunaqa desangiz bo'ladi.",
    ],
  },
  "yumshoq-lekin-olmaydi": {
    key: "yumshoq-lekin-olmaydi",
    promptFile: "personas/yumshoq-lekin-olmaydi.md",
    primaryObjection: "qaror",
    defaultName: "Nodira",
    mockLines: [
      "Ha yaxshi ekan, zo'r narsa.",
      "Rahmat, o'ylab ko'ramiz. Keyinroq bir kelaman.",
      "Aslida... nima desam, hozircha byudjet biroz tig'iz-da.",
    ],
  },
};

export const SOHA_KEYS = Object.keys(SOHALAR) as SohaKey[];
export const PERSONA_KEYS = Object.keys(PERSONALAR) as PersonaKey[];

/**
 * Berilgan e'tiroz turini eng ko'p ishlatadigan personani topadi
 * (spaced-repetition tavsiyasi uchun). Mos persona bo'lmasa `undefined`.
 */
export function personaForObjection(
  type: ObjectionType | null,
): PersonaKey | undefined {
  if (!type) return undefined;
  return PERSONA_KEYS.find((k) => PERSONALAR[k].primaryObjection === type);
}

export function isSohaKey(v: string): v is SohaKey {
  return v in SOHALAR;
}
export function isPersonaKey(v: string): v is PersonaKey {
  return v in PERSONALAR;
}
