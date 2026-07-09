/**
 * E'tiroz kutubxonasi — tur bo'yicha teglangan, jaydari o'zbek + aralash (rus)
 * misollar bilan. Har e'tirozga bir nechta uslub bilan teglangan javob
 * (closeme'ning "Возражения" playbook'iga o'xshash — lekin O'zbekiston
 * bozori uchun aralash tilda).
 */

import type { ObjectionType } from "./coach";

export type AnswerStyle =
  "logika" | "ekspertlik" | "intriga" | "dojim" | "bosim" | "yumor";

export interface Answer {
  text: string;
  style: AnswerStyle;
}

export interface ObjectionEntry {
  id: string;
  type: ObjectionType;
  text: string;
  answers: Answer[];
}

export const OBJECTION_LIBRARY: ObjectionEntry[] = [
  {
    id: "narx-qimmat",
    type: "narx",
    text: "Qimmat-ku, boshqa joyda arzonroq.",
    answers: [
      {
        text: "Narxni emas, qiymatni solishtiraylik — u yerda kafolat va xizmat bormi?",
        style: "logika",
      },
      {
        text: "Arzon narsa ko'pincha qimmatga tushadi — 2 marta sotib olishga to'g'ri kelmasin.",
        style: "yumor",
      },
      {
        text: "Bizning mijozlarimizning 80%i aynan shu farqni ko'rib qaytib kelgan.",
        style: "ekspertlik",
      },
    ],
  },
  {
    id: "narx-chegirma",
    type: "narx",
    text: "Chegirma yo'qmi? Davay dogovorimsya.",
    answers: [
      {
        text: "Chegirmani hajm yoki muddatga bog'lab beramiz — qancha olishni rejalashtiryapsiz?",
        style: "dojim",
      },
      {
        text: "Narxni tushirsak, sifatdan kamayamiz — buni xohlamaysiz-ku?",
        style: "logika",
      },
      {
        text: "Kelib bir gaplashamiz — yuzma-yuz osonroq kelishamiz.",
        style: "intriga",
      },
    ],
  },
  {
    id: "narx-byudjet",
    type: "narx",
    text: "Byudjetim yo'q hozir.",
    answers: [
      {
        text: "Bo'lib to'lash bor — kuniga qancha chiqishini birga hisoblaymizmi?",
        style: "logika",
      },
      {
        text: "Byudjet bo'lmasa, aynan shuning uchun hoziroq boshlash foydali — kechikish qimmatga tushadi.",
        style: "dojim",
      },
      { text: "Qachon byudjet ochilishi rejalashtirilgan?", style: "intriga" },
    ],
  },
  {
    id: "narx-arziydi",
    type: "narx",
    text: "Shuncha pulga arziydimi o'zi?",
    answers: [
      {
        text: "Aniq foyda va natijani raqamda ko'rsataylik — o'zingiz baholaysiz.",
        style: "ekspertlik",
      },
      {
        text: "Arzimasa, pulingizni qaytarib beramiz — shunchalik ishonamiz.",
        style: "bosim",
      },
    ],
  },
  {
    id: "ishonch-original",
    type: "ishonch",
    text: "Original o'zimi? Kafolat bormi?",
    answers: [
      {
        text: "Hujjat va kafolat qog'ozini ko'rsataman — bemalol tekshirib ko'rasiz.",
        style: "ekspertlik",
      },
      {
        text: "Yoqmasa 7 kun ichida qaytarib olamiz — risk sizda emas.",
        style: "logika",
      },
      {
        text: "1000dan ortiq mijoz allaqachon ishonib sotib olgan.",
        style: "dojim",
      },
    ],
  },
  {
    id: "ishonch-aldangan",
    type: "ishonch",
    text: "Tanishim shunaqasini olib aldangan.",
    answers: [
      {
        text: "Tushunaman, achinarli holat. Bizda qanday kafolat borligini ko'rsatsam maylimi?",
        style: "logika",
      },
      {
        text: "Har doim shunday odam bo'ladi — biz sizga real dalil ko'rsatamiz.",
        style: "ekspertlik",
      },
    ],
  },
  {
    id: "ishonch-sifat",
    type: "ishonch",
    text: "Sifati yaxshimi ishqilib?",
    answers: [
      {
        text: "Sertifikat va reyting shu yerda — o'zingiz ko'rib qaror qilasiz.",
        style: "ekspertlik",
      },
      {
        text: "Sifatli bo'lmasa, bugun bu yerda sizga taklif ham qilmasdim.",
        style: "bosim",
      },
    ],
  },
  {
    id: "vaqt-yoq",
    type: "vaqt",
    text: "Vaqtim yo'q, keyin qo'ng'iroq qiling.",
    answers: [
      {
        text: "Tushunaman, 30 soniya — asosiy foydani aytaman, keyin qaror sizga.",
        style: "intriga",
      },
      {
        text: "Qachon qo'ng'iroq qilsam qulay bo'ladi — ertaga shu vaqtdami?",
        style: "dojim",
      },
      {
        text: "Vaqtingizni hurmat qilaman — bitta gap: qancha tejaysiz bilasizmi?",
        style: "logika",
      },
    ],
  },
  {
    id: "vaqt-bandman",
    type: "vaqt",
    text: "Hozir bandman, koroche nima gap?",
    answers: [
      {
        text: "Zich aytaman: [mahsulot] + asosiy foyda — 15 soniya.",
        style: "logika",
      },
      {
        text: "Aynan shuning uchun band odamlar bizni tanlaydi — vaqt tejaydi.",
        style: "ekspertlik",
      },
    ],
  },
  {
    id: "ehtiyoj-bor",
    type: "ehtiyoj",
    text: "Menga kerak emas, bor allaqachon.",
    answers: [
      {
        text: "Zo'r, hozirgisidan qoniqasizmi to'liq, yoki bitta narsa yetishmaydimi?",
        style: "logika",
      },
      {
        text: "Ko'pchilik shunday deb boshlagan, keyin farqni ko'rib almashgan.",
        style: "dojim",
      },
    ],
  },
  {
    id: "ehtiyoj-qiziqmayman",
    type: "ehtiyoj",
    text: "Qiziqmayman.",
    answers: [
      {
        text: "Bir og'iz savol: hozirgi holatingizda eng katta og'riq nima?",
        style: "intriga",
      },
      {
        text: "Xo'p, bosim qilmayman — faqat bir daqiqa vaqtingizni olsam maylimi?",
        style: "yumor",
      },
    ],
  },
  {
    id: "qaror-oylab",
    type: "qaror",
    text: "O'ylab ko'ramiz, keyinroq.",
    answers: [
      {
        text: "Albatta. Aniq nima sizni to'xtatib turibdi — narximi, muddatmi?",
        style: "logika",
      },
      {
        text: "Yaxshi qaror uchun vaqt kerak — qachon qayta bog'lanay?",
        style: "dojim",
      },
      {
        text: "O'ylab ko'rish — bu odatda «yo'q» degani, to'g'rimi ayting-chi?",
        style: "bosim",
      },
    ],
  },
  {
    id: "qaror-uyda",
    type: "qaror",
    text: "Uyda maslahatlashib olay.",
    answers: [
      {
        text: "Albatta to'g'ri qaror. Kim bilan gaplashasiz — birga ulanamizmi?",
        style: "logika",
      },
      {
        text: "Ularga aytadigan 3 asosiy foydani birga tayyorlab beray.",
        style: "ekspertlik",
      },
    ],
  },
  {
    id: "raqobat-arzon",
    type: "raqobat",
    text: "Falon kompaniyada arzonroq va yaxshiroq.",
    answers: [
      {
        text: "Bahslashmayman — farqimizni ko'rsataman, o'zingiz solishtirasiz.",
        style: "logika",
      },
      {
        text: "Ular haqida bilaman. Bizda ular bermaydigan narsa bor.",
        style: "ekspertlik",
      },
      {
        text: "Odamlar tez-tez ulardan bizga o'tadi — sababini aytaymi?",
        style: "intriga",
      },
    ],
  },
  {
    id: "raqobat-bepul",
    type: "raqobat",
    text: "Ular bepul yetkazadi-ku.",
    answers: [
      {
        text: "To'liq qiymatni solishtirsak — kafolat, xizmat, muddat — qaysi biri arzon?",
        style: "logika",
      },
      {
        text: "Bepul hech narsa yo'q — narx boshqa joyga yashiringan bo'ladi.",
        style: "yumor",
      },
    ],
  },

  // --- Qo'shimcha (kengaytirilgan kutubxona, 2 javob) ---
  {
    id: "narx-chegirma2",
    type: "narx",
    text: "Naq pulga chegirma qancha?",
    answers: [
      {
        text: "Naq pulga alohida shart bor — hajmga qarab aytaman.",
        style: "logika",
      },
      {
        text: "Chegirmani bepul bermayman, lekin bonusni qo'shib beraman.",
        style: "dojim",
      },
    ],
  },
  {
    id: "narx-keyingi-oy",
    type: "narx",
    text: "Keyingi oy maoshdan keyin olaman.",
    answers: [
      {
        text: "Bugun bron qilib, to'lovni keyingi oyga qoldirsak bo'ladi.",
        style: "bosim",
      },
      {
        text: "Bo'lib to'lash bilan bugundan foydalanishni boshlaysiz.",
        style: "logika",
      },
    ],
  },
  {
    id: "narx-dostimga",
    type: "narx",
    text: "Do'stimga arzonroq bergansizlar-ku.",
    answers: [
      {
        text: "Har mijozga shart individual — sizga ham eng yaxshisini taklif qilaman.",
        style: "ekspertlik",
      },
      {
        text: "Adolatli narx siyosatimiz bor, lekin qiymatga qaytaylik.",
        style: "logika",
      },
    ],
  },
  {
    id: "ishonch-onlayn",
    type: "ishonch",
    text: "Onlayn to'lasam pulim yo'qolmaydimi?",
    answers: [
      {
        text: "Xavfsiz to'lov tizimi + qaytarish kafolati — risk yo'q.",
        style: "logika",
      },
      {
        text: "Naqd to'lov ham mumkin, agar shunday qulay bo'lsa.",
        style: "yumor",
      },
    ],
  },
  {
    id: "ishonch-birinchi",
    type: "ishonch",
    text: "Sizni birinchi marta ko'ryapman.",
    answers: [
      {
        text: "Portfolio va mijozlar fikrini ko'rsataman — o'zingiz baholaysiz.",
        style: "ekspertlik",
      },
      {
        text: "Kichik sinov buyurtma bilan boshlaylik — ishonch keyin keladi.",
        style: "intriga",
      },
    ],
  },
  {
    id: "ishonch-reklama",
    type: "ishonch",
    text: "Reklama-ku bularning hammasi.",
    answers: [
      {
        text: "Da'vo emas — o'lchanadigan natija va real mijoz misolini ko'rsataman.",
        style: "ekspertlik",
      },
      {
        text: "To'g'ri, reklama ko'p — shuning uchun dalil bilan gapiraman.",
        style: "logika",
      },
    ],
  },
  {
    id: "vaqt-yigilish",
    type: "vaqt",
    text: "Yig'ilishdaman, keyin yozing.",
    answers: [
      {
        text: "Albatta. Bitta jumlada qiymatni qoldiray — qolganini yozib yuboraman.",
        style: "logika",
      },
      { text: "Qaysi vaqt qulay — kechqurunmi?", style: "dojim" },
    ],
  },
  {
    id: "vaqt-telegram",
    type: "vaqt",
    text: "Telegramga tashlang, ko'raman.",
    answers: [
      {
        text: "Tashlayman, lekin ertaga qisqa qo'ng'iroq qilib tasdiqlab olsam maylimi?",
        style: "dojim",
      },
      {
        text: "Yaxshi, materialni yuboraman — savol chiqsa yozing.",
        style: "yumor",
      },
    ],
  },
  {
    id: "ehtiyoj-joyida",
    type: "ehtiyoj",
    text: "Bizda hammasi joyida, kerak emas.",
    answers: [
      {
        text: "Zo'r. Faqat bitta narsa so'rasam — hozirgi jarayonda nima ko'proq vaqt oladi?",
        style: "intriga",
      },
      {
        text: "Yashirin xarajatlar ko'pincha ko'zga tashlanmaydi — birga tekshirib ko'raylik.",
        style: "logika",
      },
    ],
  },
  {
    id: "ehtiyoj-tugri-kelmaydi",
    type: "ehtiyoj",
    text: "Bu biznesimizga to'g'ri kelmaydi.",
    answers: [
      {
        text: "Sizning segmentga mos konkret misolni ko'rsataman.",
        style: "ekspertlik",
      },
      {
        text: "Qaysi jihati mos kelmayapti — shuni birga ko'rib chiqamiz.",
        style: "logika",
      },
    ],
  },
  {
    id: "qaror-sherik",
    type: "qaror",
    text: "Sherigim bilan gaplashib olay.",
    answers: [
      {
        text: "To'g'ri. Uni ham suhbatga taklif qilsak, tezroq qaror bo'ladi.",
        style: "logika",
      },
      { text: "Qachon ikkalangiz bilan gaplasha olaman?", style: "dojim" },
    ],
  },
  {
    id: "qaror-shoshilmayapmiz",
    type: "qaror",
    text: "Hozircha shoshilmayapmiz.",
    answers: [
      {
        text: "Tushunarli. Lekin kechikish qancha xarajat qilishi mumkinligini hisoblab ko'raylikmi?",
        style: "dojim",
      },
      {
        text: "Shoshilmang, faqat muddatni birga belgilab qo'yaylik.",
        style: "yumor",
      },
    ],
  },
  {
    id: "qaror-material",
    type: "qaror",
    text: "Materiallaringizni yuboring, o'qib chiqamiz.",
    answers: [
      {
        text: "Yuboraman. Qachon qayta bog'lanishim mumkin — sana belgilaymizmi?",
        style: "logika",
      },
      {
        text: "Yuboraman + eng muhim 3 nuqtani belgilab beraman, tez o'qiysiz.",
        style: "ekspertlik",
      },
    ],
  },
  {
    id: "raqobat-yetkazib-beruvchi",
    type: "raqobat",
    text: "Bizda allaqachon yetkazib beruvchi bor.",
    answers: [
      {
        text: "Almashtirishga chaqirmayapman — qo'shimcha zaxira sifatida sinab ko'ring.",
        style: "yumor",
      },
      {
        text: "Ularni almashtirish shart emas — biz bilan qo'shimcha qiymat qo'shasiz.",
        style: "logika",
      },
    ],
  },
  {
    id: "raqobat-uzum",
    type: "raqobat",
    text: "Uzum'da o'zim sotaman, vositachi kerakmas.",
    answers: [
      {
        text: "To'g'ri, lekin vaqt va logistikangizni qancha tejashimizni hisoblaymizmi?",
        style: "logika",
      },
      {
        text: "Ko'pchilik ham shunday deb boshlagan, keyin vaqti yetmay bizga o'tgan.",
        style: "dojim",
      },
    ],
  },
  {
    id: "narx-bozor",
    type: "narx",
    text: "Bozorda bundan arzon full bor.",
    answers: [
      {
        text: "Sifat va kafolat farqini aniq ajratib ko'rsataman.",
        style: "ekspertlik",
      },
      {
        text: "Arzonining narxi qayerdan kelishini so'rab ko'rdingizmi?",
        style: "intriga",
      },
    ],
  },
];

export function objectionsByType(type: ObjectionType): ObjectionEntry[] {
  return OBJECTION_LIBRARY.filter((o) => o.type === type);
}
