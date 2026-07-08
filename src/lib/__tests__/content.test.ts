import { describe, expect, it } from "vitest";
import {
  PERSONALAR,
  PERSONA_KEYS,
  SOHALAR,
  SOHA_KEYS,
  isPersonaKey,
  isSohaKey,
  type PersonaKey,
  type SohaKey,
} from "../content";

const EXPECTED_SOHALAR: SohaKey[] = [
  "bank",
  "telekom",
  "talim",
  "mebel",
  "kochmas",
  "bozor",
  "fmcg",
];
const EXPECTED_PERSONALAR: PersonaKey[] = [
  "qimmatchi",
  "shubhali",
  "bandman",
  "bilagon",
  "yumshoq-lekin-olmaydi",
];

describe("SOHALAR registri", () => {
  it("kutilgan barcha sohalarni o'z ichiga oladi", () => {
    expect(new Set(SOHA_KEYS)).toEqual(new Set(EXPECTED_SOHALAR));
  });

  it("SOHA_KEYS SOHALAR kalitlariga mos", () => {
    expect(new Set(SOHA_KEYS)).toEqual(new Set(Object.keys(SOHALAR)));
  });

  it("har soha to'liq: key mos va mahsulot bo'sh emas", () => {
    for (const key of SOHA_KEYS) {
      const soha = SOHALAR[key];
      expect(soha.key).toBe(key);
      expect(soha.mahsulot.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("PERSONALAR registri", () => {
  it("kutilgan 5 personani o'z ichiga oladi", () => {
    expect(new Set(PERSONA_KEYS)).toEqual(new Set(EXPECTED_PERSONALAR));
  });

  it("PERSONA_KEYS PERSONALAR kalitlariga mos", () => {
    expect(new Set(PERSONA_KEYS)).toEqual(new Set(Object.keys(PERSONALAR)));
  });

  it("har persona to'liq: key mos, promptFile personas/ ostida, mockLines bo'sh emas", () => {
    for (const key of PERSONA_KEYS) {
      const p = PERSONALAR[key];
      expect(p.key).toBe(key);
      expect(p.promptFile).toMatch(/^personas\/.+\.md$/);
      expect(p.mockLines.length).toBeGreaterThan(0);
      for (const line of p.mockLines) {
        expect(line.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("type guard'lar", () => {
  it("isSohaKey haqiqiy/soxta kalitlarni farqlaydi", () => {
    expect(isSohaKey("bank")).toBe(true);
    expect(isSohaKey("kosmos")).toBe(false);
  });

  it("isPersonaKey haqiqiy/soxta kalitlarni farqlaydi", () => {
    expect(isPersonaKey("qimmatchi")).toBe(true);
    expect(isPersonaKey("mehribon")).toBe(false);
  });
});
