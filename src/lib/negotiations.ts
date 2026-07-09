/**
 * Muzokaralar ssenariylari — closeme'ning "Переговоры" bo'limiga o'xshash:
 * bitim yakuniy bosqichida mijoz taktika ishlatadi (chegirma, to'lov shartlari,
 * yetkazib berish). Content (ism, vaziyat) shu yerda — CLAUDE.md qoidasi
 * i18n'ga faqat UI chrome matnlarini talab qiladi, kontent kutubxonalari
 * (bu yerda, objections.ts, scenarios.ts kabi) o'z tilida saqlanadi.
 */

import type { SohaKey, PersonaKey } from "./content";
import type { ObjectionType } from "./coach";

export type NegotiationIcon =
  "percent" | "calendar" | "split" | "truck" | "lock" | "flask" | "swap";

export interface NegotiationScenario {
  id: string;
  icon: NegotiationIcon;
  title: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  description: string;
  objective: string;
  tags: [string, string];
  soha: SohaKey;
  persona: PersonaKey;
  level: number;
  focus: ObjectionType;
  /** true bo'lsa — ma'lum daraja/ballgacha qulflangan (progressiya). */
  locked?: boolean;
}

export const NEGOTIATIONS: NegotiationScenario[] = [
  {
    id: "chegirma",
    icon: "percent",
    title: "Chegirma so'raydi",
    clientName: "Aziz Rahimov",
    clientRole: "ta'minot menejeri",
    clientCompany: "QurilishMet",
    description:
      "Mijoz ishlashga tayyor, lekin shunchaki savdolashmoqchi. Muqobil taklif yo'q — bu yakuniy torg.",
    objective: "Chegirmani berishdan oldin marjani himoya qil.",
    tags: ["Narx", "Marjani saqlash"],
    soha: "mebel",
    persona: "qimmatchi",
    level: 3,
    focus: "narx",
  },
  {
    id: "otsrochka",
    icon: "calendar",
    title: "To'lovni kechiktirishni so'raydi",
    clientName: "Iroda Yusupova",
    clientRole: "moliya direktori",
    clientCompany: "Beshkent Savdo",
    description:
      "Mijoz standart shartlar o'rniga to'lov muddatini uzaytirishni xohlaydi.",
    objective: "Muddat cho'zilsa ham shartnoma foydali bo'lishini ta'minla.",
    tags: ["To'lov", "Moliyaviy shartlar"],
    soha: "bank",
    persona: "bilagon",
    level: 3,
    focus: "qaror",
  },
  {
    id: "5050",
    icon: "split",
    title: "50/50 to'lovni so'raydi",
    clientName: "Alisher Qosimov",
    clientRole: "xarid direktori",
    clientCompany: "Montaj Servis",
    description:
      "Mijoz to'lovni ikkiga bo'lishni taklif qiladi: yarmi hozir, yarmi keyinroq.",
    objective: "Risk taqsimotini o'zingga foydali qilib kelishtir.",
    tags: ["To'lov", "Risk taqsimoti"],
    soha: "fmcg",
    persona: "bilagon",
    level: 4,
    focus: "qaror",
  },
  {
    id: "bepul-yetkazish",
    icon: "truck",
    title: "Bepul yetkazib berishni so'raydi",
    clientName: "Bahrom Toshpulatov",
    clientRole: "bosh muhandis",
    clientCompany: "StroyGarant",
    description:
      "Mijoz yetkazib berish narxga allaqachon kiritilgan deb hisoblaydi, qo'shimcha to'lamoqchi emas.",
    objective: "Qo'shimcha xarajatni oshkor qil, foydani himoya qil.",
    tags: ["Yetkazish", "Qo'shimcha xarajat"],
    soha: "mebel",
    persona: "bilagon",
    level: 3,
    focus: "narx",
  },
  {
    id: "narx-muzlatish",
    icon: "lock",
    title: "Narxni 1 yilga muzlatishni so'raydi",
    clientName: "Farrux Yo'ldoshev",
    clientRole: "moliya direktori",
    clientCompany: "AgroInvest Holding",
    description:
      "Mijoz byudjet barqarorligi uchun uzoq muddatga narxni qotirishni talab qiladi.",
    objective: "Inflyatsiya riskisiz uzoq muddatli bitim tuz.",
    tags: ["Narx", "Uzoq muddatli shartlar"],
    soha: "bank",
    persona: "qimmatchi",
    level: 5,
    focus: "narx",
    locked: true,
  },
  {
    id: "sinov-partiya",
    icon: "flask",
    title: "Chegirma bilan sinov partiyasini so'raydi",
    clientName: "Davron Mirzayev",
    clientRole: "sifat direktori",
    clientCompany: "TexnoLine",
    description:
      "Mijoz kichik sinov buyurtmasini maxsus shartlarda boshlashni taklif qiladi.",
    objective: "Sinovni doimiy hamkorlikka aylantirishga yo'l och.",
    tags: ["Sinov", "Chegirma"],
    soha: "telekom",
    persona: "shubhali",
    level: 5,
    focus: "ishonch",
    locked: true,
  },
  {
    id: "kichik-partiya",
    icon: "swap",
    title: "Kichik partiya + katta hajm va'dasi bilan chegirma so'raydi",
    clientName: "Sardor Bekmurodov",
    clientRole: "ta'minot rahbari",
    clientCompany: "Mega Trade",
    description:
      "Mijoz katta hajmlarda kelajakdagi buyurtmalarni va'da qilib, hozirdanoq chegirma talab qiladi.",
    objective: "Kelajak va'dasiga emas, imzolangan shartga qarab kelish.",
    tags: ["Hajm", "Chegirma"],
    soha: "bozor",
    persona: "bilagon",
    level: 6,
    focus: "raqobat",
    locked: true,
  },
];

export function negotiationHref(n: NegotiationScenario): string {
  const q = new URLSearchParams({
    soha: n.soha,
    persona: n.persona,
    level: String(n.level),
    rejim: "yuzma_yuz",
    focus: n.focus,
  });
  return `/trener?${q.toString()}`;
}
