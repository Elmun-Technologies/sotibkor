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
    soha: "telekom",
    persona: "bilagon",
    rejim: "qongiroq",
    level: 3,
    difficulty: "orta",
    focus: "raqobat",
  },
];

/** Trener sahifasiga preset uchun query string. */
export function scenarioHref(s: Scenario): string {
  const q = new URLSearchParams({
    soha: s.soha,
    persona: s.persona,
    level: String(s.level),
    rejim: s.rejim,
    focus: s.focus,
  });
  return `/trener?${q.toString()}`;
}

export const DIFFICULTIES: Difficulty[] = ["oson", "orta", "qiyin"];
