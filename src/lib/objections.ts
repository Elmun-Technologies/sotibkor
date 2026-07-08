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

  // --- Qo'shimcha (30+ kutubxona) ---
  {
    type: "narx",
    text: "Naq pulga chegirma qancha?",
    counter: "Chegirmani shartga bog'la (hajm, muddat) — bepul berma.",
  },
  {
    type: "narx",
    text: "Keyingi oy maoshdan keyin olaman.",
    counter: "Bugungi qaror uchun sabab yarat; bo'lib to'lashni eslat.",
  },
  {
    type: "narx",
    text: "Do'stimga arzonroq bergansizlar-ku.",
    counter: "Adolatli narx siyosatini tushuntir, qiymatga qaytar.",
  },
  {
    type: "ishonch",
    text: "Onlayn to'lasam pulim yo'qolmaydimi?",
    counter: "Xavfsiz to'lov va qaytarish kafolatini konkret ko'rsat.",
  },
  {
    type: "ishonch",
    text: "Sizni birinchi marta ko'ryapman.",
    counter: "Ijtimoiy isbot, portfolio, kichik sinov taklif qil.",
  },
  {
    type: "ishonch",
    text: "Reklama-ku bularning hammasi.",
    counter: "Da'vo emas — o'lchanadigan natija va mijoz misolini ber.",
  },
  {
    type: "vaqt",
    text: "Yig'ilishdaman, keyin yozing.",
    counter: "Aniq vaqt kelish; bir jumlali qiymatni qoldir.",
  },
  {
    type: "vaqt",
    text: "Telegramga tashlang, ko'raman.",
    counter: "Kanalga o'tishga rozi bo'l, lekin keyingi qadamni belgila.",
  },
  {
    type: "ehtiyoj",
    text: "Bizda hammasi joyida, kerak emas.",
    counter: "Joriy holatdagi yashirin xarajat/og'riqni savol bilan och.",
  },
  {
    type: "ehtiyoj",
    text: "Bu biznesimizga to'g'ri kelmaydi.",
    counter: "Segmentiga mos konkret foydani ko'rsat, umumiy gapirma.",
  },
  {
    type: "qaror",
    text: "Sherigim bilan gaplashib olay.",
    counter: "Qaror qabul qiluvchini birga suhbatga chaqirishni taklif qil.",
  },
  {
    type: "qaror",
    text: "Hozircha shoshilmayapmiz.",
    counter: "Kechikish narxini (yo'qotilgan foyda) ko'rsat, yumshoq deadline.",
  },
  {
    type: "qaror",
    text: "Materiallaringizni yuboring, o'qiб chiqamiz.",
    counter: "Yuborishga rozi bo'l + aniq follow-up sana kelish.",
  },
  {
    type: "raqobat",
    text: "Bizda allaqachon yetkazib beruvchi bor.",
    counter: "Almashtirishga emas, qo'shimcha qiymatga fokusla.",
  },
  {
    type: "raqobat",
    text: "Uzum'da o'zim sotaman, vositachi kerakmas.",
    counter: "Vaqt/logistika tejamini raqam bilan ko'rsat.",
  },
  {
    type: "narx",
    text: "Bozorda bundan arzon full bor.",
    counter: "Sifat/kafolat farqini aniq ajratib, qiymatni qayta ramkala.",
  },
];

export function objectionsByType(type: ObjectionType): ObjectionEntry[] {
  return OBJECTION_LIBRARY.filter((o) => o.type === type);
}
