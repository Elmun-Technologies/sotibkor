/**
 * E'tiroz kutubxonasi — tur bo'yicha teglangan, jaydari o'zbek + aralash (rus)
 * misollar bilan. Har e'tirozga OLTITA uslubda javob (closeme'ning "Возражения"
 * playbook'idan kuchliroq — O'zbekiston bozori uchun aralash tilda):
 * Logika, Ekspertlik, Intriga, Dojim, Bosim, Yumor.
 *
 * DIQQAT: har `answers` massivida 6 uslubning HAR biri aynan bir marta bo'ladi
 * (test bilan tekshiriladi — src/lib/__tests__/objections.test.ts).
 */

import type { ObjectionType } from "./coach";

export type AnswerStyle =
  "logika" | "ekspertlik" | "intriga" | "dojim" | "bosim" | "yumor";

export const ANSWER_STYLES: AnswerStyle[] = [
  "logika",
  "ekspertlik",
  "intriga",
  "dojim",
  "bosim",
  "yumor",
];

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

/** 6 uslubli javob to'plamini tartib bilan tuzadi (logika→ekspertlik→...→yumor). */
function six(
  logika: string,
  ekspertlik: string,
  intriga: string,
  dojim: string,
  bosim: string,
  yumor: string,
): Answer[] {
  return [
    { text: logika, style: "logika" },
    { text: ekspertlik, style: "ekspertlik" },
    { text: intriga, style: "intriga" },
    { text: dojim, style: "dojim" },
    { text: bosim, style: "bosim" },
    { text: yumor, style: "yumor" },
  ];
}

export const OBJECTION_LIBRARY: ObjectionEntry[] = [
  {
    id: "narx-qimmat",
    type: "narx",
    text: "Qimmat-ku, boshqa joyda arzonroq.",
    answers: six(
      "Narxni emas, qiymatni solishtiraylik — u yerda kafolat, xizmat va muddat ham shu narxdami?",
      "Mijozlarimizning 80%i arzoniga aldanib ketib, farqni ko'rgach bizga qaytgan.",
      "Bir savol: o'sha arzonining ichida nima yo'qligini bilib qo'ygansizmi?",
      "Narx bo'yicha kelishamiz — faqat qancha va qachon olishni aniqlab olaylik.",
      "Rostini ayting — masala narxmi, yoki umuman olishni istamayapsizmi?",
      "Arzon narsa ikki marta sotib olinadi — pulingizni ikki marta sanamang-da 😄",
    ),
  },
  {
    id: "narx-chegirma",
    type: "narx",
    text: "Chegirma yo'qmi? Davay dogovorimsya.",
    answers: six(
      "Narxni tushirsak sifatdan kamayadi — buni xohlamaysiz-ku? Keling, qiymatga qaraylik.",
      "Chegirma o'rniga bonus beraman — bu real pulda ko'proq foyda, hisoblab ko'rsataman.",
      "Chegirma bor, lekin bitta shart bilan — eshitasizmi?",
      "Chegirmani hajmga bog'lab beramiz — qancha olishni rejalashtiryapsiz?",
      "Bugun hal qilsangiz — maxsus narx. Ertaga bu taklif yo'q.",
      "Davay dogovorimsya, lekin men ham oilamni boqishim kerak-ku 😄",
    ),
  },
  {
    id: "narx-byudjet",
    type: "narx",
    text: "Byudjetim yo'q hozir.",
    answers: six(
      "Bo'lib to'lash bor — kuniga bir choy puliga chiqadi, birga hisoblaymizmi?",
      "Ko'p mijoz aynan byudjet tor paytida boshlagan — chunki kechikish qimmatroq tushadi.",
      "Byudjet qachon ochilishi rejada bor — shunga qarab bir narsa o'ylab qo'yaymi?",
      "Bugun bron qilib qo'yamiz, to'lovni byudjet ochilganda qilasiz — kelishdikmi?",
      "Byudjet yo'q deysiz-u, aslida bu muammoni hal qilmaslik ko'proq pulingizni yeyapti.",
      "Byudjet hech qachon o'zi 'tayyor' bo'lmaydi — u doim bandlikda yuradi 😄",
    ),
  },
  {
    id: "narx-arziydi",
    type: "narx",
    text: "Shuncha pulga arziydimi o'zi?",
    answers: six(
      "Aniq foyda va natijani raqamda ko'rsataylik — keyin o'zingiz baholaysiz.",
      "Shu narxni to'lagan mijozlar 3 oyda qoplab olgan — misollarini ko'rsataman.",
      "Arziydimi degan savolga eng yaxshi javob — bitta real natijani ko'rsatsam?",
      "Arziydimi-yo'qmi — kichik sinovda tekshiramiz, keyin qaror qilasiz.",
      "Arzimasa pulingizni to'liq qaytaraman — endi risk qayerda qoldi?",
      "Arzimasa, birinchi bo'lib o'zim aytaman — bunaqa savdogar kamdan-kam 😄",
    ),
  },
  {
    id: "ishonch-original",
    type: "ishonch",
    text: "Original o'zimi? Kafolat bormi?",
    answers: six(
      "Yoqmasa 7 kun ichida qaytarib olamiz — demak risk sizda emas, bizda.",
      "Hujjat, sertifikat va kafolat qog'ozini shu yerda ko'rsataman — bemalol tekshiring.",
      "Originalligini 10 soniyada o'zingiz tekshiradigan bir usul bor — ko'rsataymi?",
      "Kafolatni yozma qilib beramiz — qaysi shartlar siz uchun muhim, aniqlab olaylik.",
      "Original bo'lmasa, ikki barobar qaytaraman — bunga tayyorman.",
      "Original bo'lmaganida, o'zim ham shu yerda ishlamas edim-ku 😄",
    ),
  },
  {
    id: "ishonch-aldangan",
    type: "ishonch",
    text: "Tanishim shunaqasini olib aldangan.",
    answers: six(
      "Tushunaman, achinarli. Bizda qaytarish kafolati bor — aldanish imkoni yo'q, ko'rsataymi?",
      "Har sohada firibgar bor. Biz esa har bitimni hujjat bilan rasmiylashtiramiz.",
      "Tanishingiz qayerda xato qilganini bilsak, siz aynan shundan himoyalanasiz — aytaymi?",
      "Ishonchni kichik buyurtmadan boshlaylik — ko'rasiz, keyin kattasiga o'tasiz.",
      "Meni o'sha bilan solishtirmang — men shu yerda, ismim va kafolatim bilan turibman.",
      "Aldaganlar tez yo'qoladi, men esa ertaga ham shu yerdaman — qochadigan joyim yo'q 😄",
    ),
  },
  {
    id: "ishonch-sifat",
    type: "ishonch",
    text: "Sifati yaxshimi ishqilib?",
    answers: six(
      "Sifat past bo'lsa kafolat bermasdik — kafolat muddati o'zi sifatning dalili.",
      "Sertifikat va mijoz reytingi shu yerda — raqamlarning o'zi gapiradi.",
      "Sifatni bir tegib ko'rsangiz, farqni darrov sezasiz — sinab ko'ramizmi?",
      "Ko'nglingiz to'lishi uchun sinov namunasi beraman — keyin qaror qilasiz.",
      "Sifatsiz bo'lsa, bugun bu yerda sizga taklif ham qilmasdim.",
      "Sifati yomon bo'lsa, birinchi shikoyatchi o'zim bo'lardim 😄",
    ),
  },
  {
    id: "vaqt-yoq",
    type: "vaqt",
    text: "Vaqtim yo'q, keyin qo'ng'iroq qiling.",
    answers: six(
      "30 soniya — bitta foydani aytaman, qancha vaqt tejashingizni bilib qolasiz.",
      "Aynan vaqti yo'q rahbarlar bizni tanlaydi — jarayonni tezlashtiramiz, statistikasi bor.",
      "Bitta jumla aytaman, qiziqmasangiz — o'zim qo'ng'iroqni uzaman, kelishdikmi?",
      "Tushunaman. Ertaga soat nechada qo'ng'iroq qilsam qulay bo'ladi?",
      "'Keyin' ko'pincha 'hech qachon' bo'ladi — 30 soniya bering, arziydi.",
      "Vaqtingizni o'g'irlamayman — qarzga 30 soniya olaman, foizsiz 😄",
    ),
  },
  {
    id: "vaqt-bandman",
    type: "vaqt",
    text: "Hozir bandman, koroche nima gap?",
    answers: six(
      "Zich aytaman: mahsulot + asosiy foyda, 15 soniya, keyin qaror sizga.",
      "Band odamlar uchun ishlab chiqilgan — vaqtingizni tejaydi, mijoz misollari bor.",
      "Koroche — sizga oyiga bir kun vaqt qaytarib beradigan narsa. Batafsilmi?",
      "Band ekansiz, qachon 5 daqiqa ajratasiz — bugun kechqurunmi?",
      "Koroche: bu sizga pul va vaqt tejaydi. Sinab ko'rasizmi yoki yo'qmi?",
      "Bandligingizni ham shu hal qiladi — koroche, band bo'lmaslik uchun asbob 😄",
    ),
  },
  {
    id: "ehtiyoj-bor",
    type: "ehtiyoj",
    text: "Menga kerak emas, bor allaqachon.",
    answers: six(
      "Zo'r. Hozirgisidan to'liq qoniqasizmi, yoki bitta narsa yetishmaydimi?",
      "Ko'pchilikda ham bor edi — solishtirgach farqni ko'rib, almashgan.",
      "Boringiz bilan bizniki orasidagi bitta farqni aytsam — qiziqasizmi?",
      "Almashtiring demayman — yonma-yon qo'yamiz, keyin o'zingiz qaror qilasiz.",
      "Bori sizga pul tejayaptimi, yoki shunchaki turibdimi? Rostini aytaylik.",
      "Bori yaxshi, lekin 'yaxshiroq' ham bor-ku — ko'rib qo'ysangiz nima ketadi 😄",
    ),
  },
  {
    id: "ehtiyoj-qiziqmayman",
    type: "ehtiyoj",
    text: "Qiziqmayman.",
    answers: six(
      "Tushunarli. Faqat bitta savol: hozir eng ko'p nima vaqtingizni oladi?",
      "Avval qiziqmagan mijozlar keyin eng sodiqlariga aylangan — bittasini aytsam?",
      "Qiziqmasligingizga sabab — hali eng qiziq qismini eshitmaganingiz. 20 soniya?",
      "Bosim qilmayman. Faqat ruxsat bering, keyinroq bitta natijani ko'rsatay.",
      "Qiziqmaslik — pul yo'qotishning eng oson yo'li. Bir eshiting, keyin o'zingiz.",
      "Qiziqmasangiz ham mayli — men baribir yoqimli odamman, bir daqiqa? 😄",
    ),
  },
  {
    id: "qaror-oylab",
    type: "qaror",
    text: "O'ylab ko'ramiz, keyinroq.",
    answers: six(
      "Albatta. Aniq nima to'xtatib turibdi — narxmi, muddatmi, ishonchmi?",
      "O'ylash to'g'ri. Qaror uchun kerakli 3 faktni tayyorlab beraman.",
      "O'ylashdan oldin bitta narsani bilib qo'ysangiz — qaror osonlashadi, aytaymi?",
      "Yaxshi. Qachon qayta bog'lansam — ertaga shu vaqtdami?",
      "'O'ylab ko'ramiz' ko'pincha yumshoq 'yo'q' bo'ladi — rostini ayting, nima xalaqit qilyapti?",
      "O'ylang, faqat menni ham unutmang — men bu yerda sabr bilan kutaman 😄",
    ),
  },
  {
    id: "qaror-uyda",
    type: "qaror",
    text: "Uyda maslahatlashib olay.",
    answers: six(
      "To'g'ri qaror. Kim bilan gaplashasiz — birga ulanib, savollariga javob beraymi?",
      "Ularga aytadigan 3 asosiy foydani tayyorlab beray — noaniq qolmaydi.",
      "Uydagilarni ishontiradigan bitta kuchli dalil bor — sizga aytib qo'yaymi?",
      "Maslahatdan keyin qachon javob berasiz — ertaga aniqlashamizmi?",
      "Uyda 'yo'q' deyishlari oson — shuning uchun qarorni bugun o'zingiz mustahkamlang.",
      "Uydagilar 'yana nima olib kelding' demasin — men yordam beraman 😄",
    ),
  },
  {
    id: "raqobat-arzon",
    type: "raqobat",
    text: "Falon kompaniyada arzonroq va yaxshiroq.",
    answers: six(
      "Bahslashmayman — farqni yonma-yon qo'yaman, o'zingiz solishtirasiz.",
      "Ularni bilaman. Bizda ular bermaydigan aniq bitta narsa bor — ko'rsataman.",
      "Odamlar tez-tez ulardan bizga o'tadi — sababini bilasizmi?",
      "Solishtirish uchun ikkalasini qog'ozga tushiraylik — keyin qaror qilasiz.",
      "Arzonroq bo'lsa nega hali olmadingiz? Demak bir narsa yetishmayapti.",
      "Arzoni yaxshiroq bo'lsa, men ham o'shandan olardim 😄 lekin sabab bor.",
    ),
  },
  {
    id: "raqobat-bepul",
    type: "raqobat",
    text: "Ular bepul yetkazadi-ku.",
    answers: six(
      "To'liq qiymatni solishtiraylik — kafolat, xizmat, muddat — qaysi biri arzon chiqadi?",
      "Bepul yetkazish narxi mahsulotga yashiringan bo'ladi — hisobini ko'rsataman.",
      "Bepulning puli qayerdan chiqishini bir o'ylab ko'rdingizmi?",
      "Yetkazishni hal qilamiz — asosiysi, qiymatni birga solishtiraylik.",
      "Bepul yetkazish uchun sifatdan voz kechyapsizmi? Rostini aytaylik.",
      "Bepul pishloq faqat sichqon qopqonida bo'ladi 😄",
    ),
  },
  {
    id: "narx-chegirma2",
    type: "narx",
    text: "Naq pulga chegirma qancha?",
    answers: six(
      "Naq pulga alohida shart bor — hajmga qarab aniq aytaman.",
      "Naq to'lovga bonusni qo'shib beraman — bu chegirmadan ko'ra ko'proq foyda.",
      "Naq pulga bitta maxsus taklif bor, lekin bugungina — eshitasizmi?",
      "Chegirmani aniqlash uchun — qancha va qachon olishni belgilaymizmi?",
      "Naq berib, bugun rasmiylashtirsangiz — eng yaxshi narx. Ertaga o'zgaradi.",
      "Chegirmani bepul bermayman, lekin bonus bilan ko'nglingizni olaman 😄",
    ),
  },
  {
    id: "narx-keyingi-oy",
    type: "narx",
    text: "Keyingi oy maoshdan keyin olaman.",
    answers: six(
      "Bo'lib to'lash bilan bugundan foydalanishni boshlaysiz — kutish shart emas.",
      "Kutgan mijozlar ko'pincha imkonni boy bergan — bugun bron qilgani yutgan.",
      "Keyingi oygacha narx o'zgarishi mumkin — bugun qulflab qo'yaymi?",
      "Bugun bron qilamiz, to'lovni maoshdan keyin qilasiz — kelishdikmi?",
      "Keyingi oy yana boshqa xarajat chiqadi — bugun hal qilsangiz, tinch bo'lasiz.",
      "Maosh kelguncha men joyingizni ushlab turaman — navbatga yozib qo'yamiz 😄",
    ),
  },
  {
    id: "narx-dostimga",
    type: "narx",
    text: "Do'stimga arzonroq bergansizlar-ku.",
    answers: six(
      "Har bitim sharti individual — sizga ham eng foydalisini tuzib beraman.",
      "Do'stingiz boshqa hajm yoki paketga olgan bo'lishi mumkin — solishtirib ko'raylik.",
      "Sizga do'stingiznikidan ham qiziqroq variant bor — ko'rsataymi?",
      "Sizga mos shartni tuzamiz — qaysi paket kerakligini aniqlab olaylik.",
      "Do'stingiznikini emas, o'zingizga aynan nima kerakligini gaplashaylik.",
      "Do'stingizga arzon berib, sizni ranjitib qo'yibmizmi — hozir tuzataylik 😄",
    ),
  },
  {
    id: "ishonch-onlayn",
    type: "ishonch",
    text: "Onlayn to'lasam pulim yo'qolmaydimi?",
    answers: six(
      "Xavfsiz to'lov + qaytarish kafolati bor — pul yo'qolishi imkonsiz.",
      "To'lov litsenziyalangan tizim orqali o'tadi — har tranzaksiya hujjatlanadi.",
      "To'lov shunday himoyalanganki, pulingiz mahsulotni olmaguningizcha 'muzlab' turadi — ko'rsataymi?",
      "Qulay bo'lsa naqd ham qabul qilamiz — qaysi biri sizga oson, shuni tanlaymiz.",
      "Pul yo'qolsa, o'zim javob beraman — mana ismim, mana raqamim.",
      "Pulingiz yo'qolsa, meni izlab topasiz — men qochadigan odam emasman 😄",
    ),
  },
  {
    id: "ishonch-birinchi",
    type: "ishonch",
    text: "Sizni birinchi marta ko'ryapman.",
    answers: six(
      "To'g'ri. Shuning uchun kichik sinov buyurtmadan boshlaylik — risk minimal.",
      "Portfolio, mijozlar fikri va hujjatlarni ko'rsataman — o'zingiz baholaysiz.",
      "Birinchi ko'rishuvda ishonch qiyin — lekin bitta narsa buni tezlashtiradi, aytaymi?",
      "Tanishuvni bosqichma-bosqich qilaylik — avval kichik, keyin kattasi.",
      "Birinchi marta ko'rsangiz ham, kafolatim yozma — so'zga emas, qog'ozga ishoning.",
      "Birinchi ko'rishuv-ku, lekin oxirgisi bo'lmasligiga harakat qilaman 😄",
    ),
  },
  {
    id: "ishonch-reklama",
    type: "ishonch",
    text: "Reklama-ku bularning hammasi.",
    answers: six(
      "To'g'ri, reklama ko'p — shuning uchun men da'vo emas, dalil bilan gaplashaman.",
      "Reklama emas — o'lchanadigan natija va real mijoz misolini ko'rsataman.",
      "Reklamadan farqi bitta — buni o'zingiz tekshirib ko'rishingiz mumkin. Qanaqa deb o'ylaysiz?",
      "Reklamaga ishonmang — kichik sinovda o'zingiz tekshiring, keyin gaplashamiz.",
      "Reklama deysiz — unda sinab ko'ring va meni yolg'onchiga chiqaring, jur'atim bor.",
      "Reklama bo'lsa, bunchalik ko'p gapirmasdim — reklamada qisqa bo'ladi 😄",
    ),
  },
  {
    id: "vaqt-yigilish",
    type: "vaqt",
    text: "Yig'ilishdaman, keyin yozing.",
    answers: six(
      "Albatta. Bitta jumlada qiymatni qoldiray, qolganini yozib yuboraman.",
      "Yig'ilishga xalaqit bermayman — materialni tayyor holda yuboraman, 1 daqiqada o'qiysiz.",
      "Yig'ilishingizga ham foydasi bor bir narsa — keyin yozganda e'tibor bering.",
      "Yaxshi, qaysi vaqt qulay — yig'ilishdan keyin soat nechada bog'lanay?",
      "Yozaman, lekin bu masala kutib turmaydi — bugunoq ko'rib chiqing.",
      "Yig'ilishni buzmayman — men sabrli, choy ichib kutaman 😄",
    ),
  },
  {
    id: "vaqt-telegram",
    type: "vaqt",
    text: "Telegramga tashlang, ko'raman.",
    answers: six(
      "Tashlayman. Savol chiqsa darrov javob berishim uchun ertaga qisqa bog'lansam maylimi?",
      "Materialni yuboraman + eng muhim 3 nuqtani belgilab qo'yaman, chalkashmaysiz.",
      "Tashlayman, lekin ichida bitta narsa bor — uni ko'rsangiz albatta o'zingiz yozasiz.",
      "Yuboraman. Ko'rib chiqqach, ertaga javobingizni olsam bo'ladimi?",
      "Telegramga tashlangan narsa ko'pincha ochilmay qoladi — 2 daqiqa hozir gaplashaylik.",
      "Tashlayman, lekin 'ko'rmadim' demang — o'qilgan belgisi meni sotadi 😄",
    ),
  },
  {
    id: "ehtiyoj-joyida",
    type: "ehtiyoj",
    text: "Bizda hammasi joyida, kerak emas.",
    answers: six(
      "Zo'r. Faqat bitta savol — hozirgi jarayonda nima ko'proq vaqt yoki pul oladi?",
      "'Joyida' degan ko'p mijozda yashirin xarajat topganmiz — birga tekshiramizmi?",
      "Hammasi joyida bo'lsa ham, bitta yaxshilash imkoni bor — qiziqasizmi?",
      "Kerak emas bo'lsa ham, 10 daqiqalik tahlil qilib beray — foydasi tegadi.",
      "'Joyida' ko'pincha 'o'zgarishdan qo'rqaman' degani. Rostini aytaylik.",
      "Hammasi joyida bo'lsa zo'r — lekin 'zo'rroq'ni ko'rib qo'yish gunoh emas 😄",
    ),
  },
  {
    id: "ehtiyoj-tugri-kelmaydi",
    type: "ehtiyoj",
    text: "Bu biznesimizga to'g'ri kelmaydi.",
    answers: six(
      "Qaysi jihati mos kelmayapti — shuni aniqlab, birga ko'rib chiqamiz.",
      "Sizning segmentga o'xshash biznes bilan ishlaganmiz — misolini ko'rsataman.",
      "To'g'ri kelmaydi degan bittasi keyin eng katta natijani olgan — aytaymi?",
      "Mos-mosmasligini kichik sinovda tekshiramiz — keyin qaror sizniki.",
      "To'g'ri kelmasligini sinamasdan qayerdan bilasiz? Bir tekshiraylik.",
      "Har biznes 'bizga to'g'ri kelmaydi' deydi — keyin qo'shni olgach, o'zi ham oladi 😄",
    ),
  },
  {
    id: "qaror-sherik",
    type: "qaror",
    text: "Sherigim bilan gaplashib olay.",
    answers: six(
      "To'g'ri. Uni ham suhbatga qo'shsak, savollariga darrov javob beraman, qaror tezlashadi.",
      "Sherigingizga ko'rsatadigan hisob-kitobni tayyorlab beray — raqamga ishonadi.",
      "Sherigingizni ishontiradigan bitta kuchli dalil bor — sizga aytib qo'yaymi?",
      "Qachon ikkalangiz bilan gaplasha olaman — ertagami yoki bugun kechqurun?",
      "Sherik 'shoshilmaylik' desa — imkon qo'ldan ketadi. Qarorni bugun mustahkamlang.",
      "Sherigingiz 'yana nima o'yladi' demasin — men uni ham ko'ndiraman 😄",
    ),
  },
  {
    id: "qaror-shoshilmayapmiz",
    type: "qaror",
    text: "Hozircha shoshilmayapmiz.",
    answers: six(
      "Tushunarli. Lekin kechikish qancha xarajat qilishini birga hisoblab ko'raylikmi?",
      "Shoshilmagan mijozlar ko'pincha narx ko'tarilganda afsuslangan — statistikasi bor.",
      "Shoshilmasangiz ham, bugun bitta narsani bilib qo'yish foydangizga — aytaymi?",
      "Shoshiltirmayman — faqat muddatni birga belgilab qo'yaylik, unutilmaydi.",
      "Shoshilmaslik ham qaror, va u ko'pincha pulga tushadi. Rostini aytaylik.",
      "Shoshilmang, faqat mendan oldin narx shoshilmasin 😄",
    ),
  },
  {
    id: "qaror-material",
    type: "qaror",
    text: "Materiallaringizni yuboring, o'qib chiqamiz.",
    answers: six(
      "Yuboraman. Qachon qayta bog'lanay — sana belgilab qo'yamizmi?",
      "Yuboraman + eng muhim 3 nuqtani ajratib beraman, tez va aniq o'qiysiz.",
      "Materialda bitta raqam bor — uni ko'rsangiz, albatta o'zingiz qo'ng'iroq qilasiz.",
      "Yuboraman. O'qib chiqqach, ertaga fikringizni olsam bo'ladimi?",
      "Material o'qilmay qolib ketmasin — asosiysini hozir 2 daqiqada aytib beray.",
      "Material yuboraman, lekin 'papkaga tushib ketdi' demang 😄",
    ),
  },
  {
    id: "raqobat-yetkazib-beruvchi",
    type: "raqobat",
    text: "Bizda allaqachon yetkazib beruvchi bor.",
    answers: six(
      "Almashtirishga chaqirmayapman — qo'shimcha zaxira sifatida sinab ko'ring, risksiz.",
      "Ko'p mijozda ham bor edi — bizni zaxira qilib, keyin asosiyga aylantirgan.",
      "Hozirgi yetkazib beruvchingiz bermaydigan bitta narsa bizda bor — aytaymi?",
      "Bittagina sinov buyurtma qilib ko'ring — solishtirib, keyin o'zingiz qaror qilasiz.",
      "Bittasiga bog'lanib qolish — xavf. Uzilib qolsa nima qilasiz? Zaxira kerak.",
      "Ikkinchi yetkazib beruvchi — sug'urta kabi: kerak bo'lmasin, lekin bor bo'lsin 😄",
    ),
  },
  {
    id: "raqobat-uzum",
    type: "raqobat",
    text: "Uzum'da o'zim sotaman, vositachi kerakmas.",
    answers: six(
      "To'g'ri. Lekin vaqt va logistikangizni qancha tejashimizni birga hisoblaymizmi?",
      "O'zi sotgan ko'plar keyin vaqti yetmay bizga o'tgan — reklama va logistika og'ir.",
      "O'zingiz sotganda ko'rinmaydigan bitta xarajat bor — aytsam qiziqasiz.",
      "Bitta oy sinab ko'ring — farqni raqamda ko'rib, keyin qaror qilasiz.",
      "O'zingiz sotib, sotuvdan ko'ra logistikaga vaqt sarflayapsizmi? Rostini aytaylik.",
      "O'zingiz sotasiz, yetkazasiz, qadoqlaysiz — uxlashga vaqt qoladimi 😄",
    ),
  },
  {
    id: "narx-bozor",
    type: "narx",
    text: "Bozorda bundan arzon full bor.",
    answers: six(
      "Sifat va kafolat farqini aniq ajratib ko'rsataman — narx yolg'iz o'zi hamma narsa emas.",
      "Bozordagi arzonining aksari kafolatsiz — bir oyda buzilsa, kim javob beradi?",
      "Arzonining narxi qayerdan 'yeb ketilganini' bilasizmi? Aytib beraymi?",
      "Yonma-yon qo'yib solishtiraylik — narx, kafolat, muddat, keyin qaror qilasiz.",
      "Arzoni shunchalik yaxshi bo'lsa — nega hali muammoingiz hal bo'lmagan?",
      "Bozorda arzon full ham bor, do'xtir ham yonida — ikkovi bir joyda-ku 😄",
    ),
  },
];

export function objectionsByType(type: ObjectionType): ObjectionEntry[] {
  return OBJECTION_LIBRARY.filter((o) => o.type === type);
}
