/**
 * Kontent registri — sohalar va personalar. UI shu yerdan ro'yxat oladi.
 * Ko'rinadigan nomlar i18n'da (src/i18n/uz.json), bu yerda faqat kalitlar va
 * texnik metama'lumot (prompt yo'li, mock demo javoblar).
 *
 * DIQQAT: `mockLines` — FAQAT kalitsiz demo rejimi uchun oldindan yozilgan
 * javoblar (real LLM prompti EMAS). Real persona prompti prompts/personas/ da.
 */

export type SohaKey = "bank" | "telekom" | "talim" | "mebel";
export type PersonaKey =
  | "qimmatchi"
  | "shubhali"
  | "bandman"
  | "bilagon"
  | "yumshoq-lekin-olmaydi";

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
};

export const PERSONALAR: Record<PersonaKey, Persona> = {
  qimmatchi: {
    key: "qimmatchi",
    promptFile: "personas/qimmatchi.md",
    mockLines: [
      "Obbo, qimmat-ku bu. Boshqa joyda arzonroq beryapti-ku.",
      "Baribir qimmat. Chegirma yo'qmi ishqilib?",
      "Hmm... mayli, agar shunchalik foydali bo'lsa, bir o'ylab ko'ray-chi.",
    ],
  },
  shubhali: {
    key: "shubhali",
    promptFile: "personas/shubhali.md",
    mockLines: [
      "Silaniki original o'zimi? Kafolat bormi umuman?",
      "E bilmadim-da, buzilib qolsa nima bo'ladi?",
      "Hujjatini ko'rsata olsangiz, unda ishonsa bo'lar.",
    ],
  },
  bandman: {
    key: "bandman",
    promptFile: "personas/bandman.md",
    mockLines: [
      "Vaqtim yo'q, qisqa qiling, nima gap?",
      "Tez ayting, ketyapman.",
      "Xo'p, agar shunaqa bo'lsa ayting-chi qanaqa qilamiz.",
    ],
  },
  bilagon: {
    key: "bilagon",
    promptFile: "personas/bilagon.md",
    mockLines: [
      "Bu eskirgan-ku, yangisi chiqqan. Men bu sohada ishlaganman.",
      "Xarakteristikasini bilasizmi o'zi? Menga o'rgatmang.",
      "Ha, endi to'g'ri gapiryapsiz. Shunaqa desangiz bo'ladi.",
    ],
  },
  "yumshoq-lekin-olmaydi": {
    key: "yumshoq-lekin-olmaydi",
    promptFile: "personas/yumshoq-lekin-olmaydi.md",
    mockLines: [
      "Ha yaxshi ekan, zo'r narsa.",
      "Rahmat, o'ylab ko'ramiz. Keyinroq bir kelaman.",
      "Aslida... nima desam, hozircha byudjet biroz tig'iz-da.",
    ],
  },
};

export const SOHA_KEYS = Object.keys(SOHALAR) as SohaKey[];
export const PERSONA_KEYS = Object.keys(PERSONALAR) as PersonaKey[];

export function isSohaKey(v: string): v is SohaKey {
  return v in SOHALAR;
}
export function isPersonaKey(v: string): v is PersonaKey {
  return v in PERSONALAR;
}
