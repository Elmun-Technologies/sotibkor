/**
 * E'tiroz kutubxonasi — tur bo'yicha teglangan, jaydari o'zbek + aralash (rus)
 * misollar bilan. Coaching tavsiyalari va (kelajakda) persona targetlash uchun.
 *
 * closeme'da 32 e'tiroz bor; bizniki tur (ObjectionType) bo'yicha strukturali
 * va aralash tilni qamraydi — bu O'zbekiston bozori uchun moat.
 */

import type { ObjectionType } from "./coach";

export interface ObjectionEntry {
  type: ObjectionType;
  text: string;
  /** Yaxshi javob yo'nalishi (murabbiy uchun). */
  counter: string;
}

export const OBJECTION_LIBRARY: ObjectionEntry[] = [
  // --- Narx ---
  {
    type: "narx",
    text: "Qimmat-ku, boshqa joyda arzonroq.",
    counter: "Narxni emas, qiymatni asosla; raqobatchidan farqni ko'rsat.",
  },
  {
    type: "narx",
    text: "Chegirma yo'qmi? Davay dogovorimsya.",
    counter: "Darrov chegirmaga yugurma — avval qiymatni himoya qil.",
  },
  {
    type: "narx",
    text: "Byudjetim yo'q hozir.",
    counter: "Bo'lib to'lash yoki ROI'ni kunlik xarajatga bo'lib ko'rsat.",
  },
  {
    type: "narx",
    text: "Shuncha pulga arziydimi o'zi?",
    counter: "Aniq foyda va natijani raqam bilan bog'la.",
  },

  // --- Ishonch ---
  {
    type: "ishonch",
    text: "Original o'zimi? Kafolat bormi?",
    counter: "Hujjat, kafolat, qaytarish siyosati — konkret dalil ber.",
  },
  {
    type: "ishonch",
    text: "Tanishim shunaqasini olib aldangan.",
    counter: "Ijtimoiy isbot va risk kamaytirish (qaytarish) taklif qil.",
  },
  {
    type: "ishonch",
    text: "Sifati yaxshimi ishqilib?",
    counter: "Sertifikat/reyting/namuna bilan tasdiqla, bo'sh va'da berma.",
  },

  // --- Vaqt ---
  {
    type: "vaqt",
    text: "Vaqtim yo'q, keyin qo'ng'iroq qiling.",
    counter: "Bir gapda qiymat + 30 soniya so'ra; vaqtini hurmat qil.",
  },
  {
    type: "vaqt",
    text: "Hozir bandman, koroche nima gap?",
    counter: "Zich pitch: mahsulot + asosiy foyda + aniq keyingi qadam.",
  },

  // --- Ehtiyoj ---
  {
    type: "ehtiyoj",
    text: "Menga kerak emas, bor allaqachon.",
    counter: "Joriy yechimidagi og'riqni ochuvchi savol ber.",
  },
  {
    type: "ehtiyoj",
    text: "Qiziqmayman.",
    counter: "Bir og'riq nuqtasiga tegib qiziqish uyg'ot, bosim qilma.",
  },

  // --- Qaror ---
  {
    type: "qaror",
    text: "O'ylab ko'ramiz, keyinroq.",
    counter: "Yashirin e'tirozni och: aniq nima to'xtatib turibdi?",
  },
  {
    type: "qaror",
    text: "Uyda maslahatlashib olay.",
    counter: "Qaror qabul qiluvchini aniqla, keyingi aniq qadam belgila.",
  },

  // --- Raqobat ---
  {
    type: "raqobat",
    text: "Falon kompaniyada arzonroq va yaxshiroq.",
    counter: "Bahslashma — farqingni aniq ustunlik bilan ko'rsat.",
  },
  {
    type: "raqobat",
    text: "Ular bepul yetkazadi-ku.",
    counter: "To'liq qiymatni (kafolat, xizmat) taqqoslab qayta ramkalash.",
  },
];

export function objectionsByType(type: ObjectionType): ObjectionEntry[] {
  return OBJECTION_LIBRARY.filter((o) => o.type === type);
}
