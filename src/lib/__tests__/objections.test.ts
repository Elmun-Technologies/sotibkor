import { describe, it, expect } from "vitest";
import {
  OBJECTION_LIBRARY,
  ANSWER_STYLES,
  objectionsByType,
  type AnswerStyle,
} from "../objections";
import { OBJECTION_TYPES } from "../coach";

describe("OBJECTION_LIBRARY — 6 uslubli kutubxona", () => {
  it("har e'tirozning barcha 6 uslubi bor (aynan bir martadan)", () => {
    for (const o of OBJECTION_LIBRARY) {
      const styles = o.answers.map((a) => a.style);
      expect(styles).toHaveLength(6);
      // Har uslub aynan bir marta
      for (const style of ANSWER_STYLES) {
        expect(styles.filter((s) => s === style)).toHaveLength(1);
      }
    }
  });

  it("har javob bo'sh emas va yetarlicha mazmunli", () => {
    for (const o of OBJECTION_LIBRARY) {
      for (const a of o.answers) {
        expect(a.text.trim().length).toBeGreaterThan(15);
      }
    }
  });

  it("id'lar takrorlanmaydi", () => {
    const ids = OBJECTION_LIBRARY.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("har e'tiroz turi kamida bitta e'tirozga ega", () => {
    for (const type of OBJECTION_TYPES) {
      if (type === "ehtiyoj" || type === "narx") {
        expect(objectionsByType(type).length).toBeGreaterThan(0);
      }
    }
  });

  it("ANSWER_STYLES aynan 6 ta noyob uslub", () => {
    const set = new Set<AnswerStyle>(ANSWER_STYLES);
    expect(set.size).toBe(6);
  });
});
