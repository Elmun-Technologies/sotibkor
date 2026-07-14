/**
 * Ssenariylar katalogi — nomli mijozlar (persona + soha + qiyinlik).
 * closeme'da "Звонки/Сценарии" bo'limiga o'xshash, lekin O'zbekiston bozori
 * uchun: mahalliy ismlar, jaydari kontekst, qo'ng'iroq/yuzma-yuz rejimi.
 *
 * Har ssenariy trener sahifasiga preset sifatida uzatiladi (query params).
 * Ko'rinadigan matn (mijoz haqida qisqa tavsif) i18n'da — bu yerda kalitlar.
 */

import type { SohaKey, PersonaKey, RejimKey } from "./content";
import type { ObjectionType } from "./coach";

export type Difficulty = "oson" | "orta" | "qiyin";

export interface Scenario {
  id: string;
  /** Mijozning ismi (ko'rinadigan, lekin bu kontent — i18n emas, real ism). */
  name: string;
  /** Mijozning lavozimi/roli (masalan "Xarid menejeri") — kontent, i18n emas. */
  lavozim: string;
  soha: SohaKey;
  persona: PersonaKey;
  rejim: RejimKey;
  level: number;
  difficulty: Difficulty;
  /** Asosiy e'tiroz turi — nishon. */
  focus: ObjectionType;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "aziz-qimmatchi",
    name: "Aziz aka",
    lavozim: "Xaridor",
    soha: "mebel",
    persona: "qimmatchi",
    rejim: "yuzma_yuz",
    level: 3,
    difficulty: "orta",
    focus: "narx",
  },
  {
    id: "dilnoza-shubhali",
    name: "Dilnoza opa",
    lavozim: "Kvartira izlovchi",
    soha: "kochmas",
    persona: "shubhali",
    rejim: "qongiroq",
    level: 4,
    difficulty: "qiyin",
    focus: "ishonch",
  },
  {
    id: "sardor-bandman",
    name: "Sardor",
    lavozim: "Xarid menejeri",
    soha: "telekom",
    persona: "bandman",
    rejim: "qongiroq",
    level: 2,
    difficulty: "oson",
    focus: "vaqt",
  },
  {
    id: "nodira-yumshoq",
    name: "Nodira",
    lavozim: "Ota-ona",
    soha: "talim",
    persona: "yumshoq-lekin-olmaydi",
    rejim: "qongiroq",
    level: 3,
    difficulty: "orta",
    focus: "qaror",
  },
  {
    id: "jamshid-bilagon",
    name: "Jamshid aka",
    lavozim: "Do'kon egasi",
    soha: "fmcg",
    persona: "bilagon",
    rejim: "yuzma_yuz",
    level: 4,
    difficulty: "qiyin",
    focus: "raqobat",
  },
  {
    id: "malika-qimmatchi",
    name: "Malika",
    lavozim: "Moliyaviy qaror qabul qiluvchi",
    soha: "bank",
    persona: "qimmatchi",
    rejim: "qongiroq",
    level: 3,
    difficulty: "orta",
    focus: "narx",
  },
  {
    id: "botir-shubhali",
    name: "Botir",
    lavozim: "Marketpleys sotuvchisi",
    soha: "bozor",
    persona: "shubhali",
    rejim: "qongiroq",
    level: 2,
    difficulty: "oson",
    focus: "ishonch",
  },
  {
    id: "gulnora-bandman",
    name: "Gulnora opa",
    lavozim: "Uy bekasi",
    soha: "mebel",
    persona: "bandman",
    rejim: "qongiroq",
    level: 4,
    difficulty: "qiyin",
    focus: "ehtiyoj",
  },
  {
    id: "rustam-bilagon",
    name: "Rustam",
    lavozim: "IT mutaxassisi",
    soha: "telekom",
    persona: "bilagon",
    rejim: "qongiroq",
    level: 3,
    difficulty: "orta",
    focus: "raqobat",
  },
];

/** Ssenariyni boshlashdan oldin foydalanuvchi o'zgartira oladigan sozlamalar. */
export interface ScenarioOverrides {
  level?: number;
  rejim?: RejimKey;
  tilRejimi?: string;
}

/** Trener sahifasiga preset uchun query string (ixtiyoriy override'lar bilan). */
export function scenarioHref(s: Scenario, o?: ScenarioOverrides): string {
  const q = new URLSearchParams({
    soha: s.soha,
    persona: s.persona,
    level: String(o?.level ?? s.level),
    rejim: o?.rejim ?? s.rejim,
    focus: s.focus,
    name: s.name,
    lavozim: s.lavozim,
  });
  if (o?.tilRejimi) q.set("tilRejimi", o.tilRejimi);
  return `/trener?${q.toString()}`;
}

export const DIFFICULTIES: Difficulty[] = ["oson", "orta", "qiyin"];
