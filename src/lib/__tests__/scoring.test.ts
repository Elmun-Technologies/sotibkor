import { describe, expect, it } from "vitest";
import { mockScore, parseScore, type ScoreResult } from "../scoring";
import type { ChatTurn } from "../llm";

const validScore = {
  total: 72,
  breakdown: {
    salomlashish: 8,
    ehtiyoj_aniqlash: 14,
    otkazlarga_ishlov: 20,
    closing: 12,
    ohang: 18,
  },
  mistakes: [
    { quote: "q", why: "w", better: "b" },
    { quote: "q2", why: "w2", better: "b2" },
  ],
  strengths: ["yaxshi ohang"],
  xp_awarded: 90,
};

describe("parseScore — to'g'ri JSON", () => {
  it("toza JSON'ni parse qiladi", () => {
    const r = parseScore(JSON.stringify(validScore));
    expect(r.total).toBe(72);
    expect(r.breakdown.otkazlarga_ishlov).toBe(20);
  });

  it("```json ... ``` bloki bilan o'ralganini tozalaydi", () => {
    const wrapped = "```json\n" + JSON.stringify(validScore) + "\n```";
    expect(parseScore(wrapped).total).toBe(72);
  });

  it("oldi-keti bo'sh joy bilan ham ishlaydi", () => {
    expect(parseScore("  \n" + JSON.stringify(validScore) + "\n  ").total).toBe(
      72,
    );
  });

  it("±1 tolerantlik: total breakdown'dan 1 farq qilsa o'tadi", () => {
    // breakdown yig'indisi 72, total 73 -> farq 1, o'tishi kerak.
    const near = { ...validScore, total: 73 };
    expect(parseScore(JSON.stringify(near)).total).toBe(73);
  });
});

describe("parseScore — noto'g'ri JSON / sxema", () => {
  it("umuman JSON bo'lmagan matnda xato tashlaydi", () => {
    expect(() => parseScore("bu json emas")).toThrow();
  });

  it("breakdown yo'q bo'lsa xato", () => {
    expect(() => parseScore(JSON.stringify({ total: 72 }))).toThrow();
  });

  it("breakdown maydoni raqam bo'lmasa xato", () => {
    const bad = {
      ...validScore,
      breakdown: { ...validScore.breakdown, closing: "ko'p" },
    };
    expect(() => parseScore(JSON.stringify(bad))).toThrow();
  });

  it("total raqam bo'lmasa xato", () => {
    const bad = { ...validScore, total: "72" };
    expect(() => parseScore(JSON.stringify(bad))).toThrow();
  });

  it("total breakdown yig'indisiga mos kelmasa (>1 farq) xato", () => {
    // yig'indi 72, total 99 -> farq 27, rad etilishi kerak.
    const bad = { ...validScore, total: 99 };
    expect(() => parseScore(JSON.stringify(bad))).toThrow();
  });
});

describe("mockScore — chegaralar", () => {
  const seller = (content: string): ChatTurn => ({ role: "user", content });
  const client = (content: string): ChatTurn => ({
    role: "assistant",
    content,
  });

  function assertBounds(r: ScoreResult) {
    expect(r.breakdown.salomlashish).toBeGreaterThanOrEqual(0);
    expect(r.breakdown.salomlashish).toBeLessThanOrEqual(10);
    expect(r.breakdown.ehtiyoj_aniqlash).toBeLessThanOrEqual(20);
    expect(r.breakdown.otkazlarga_ishlov).toBeLessThanOrEqual(30);
    expect(r.breakdown.closing).toBeLessThanOrEqual(20);
    expect(r.breakdown.ohang).toBeLessThanOrEqual(20);
    const sum =
      r.breakdown.salomlashish +
      r.breakdown.ehtiyoj_aniqlash +
      r.breakdown.otkazlarga_ishlov +
      r.breakdown.closing +
      r.breakdown.ohang;
    expect(r.total).toBe(sum);
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.total).toBeLessThanOrEqual(100);
  }

  it("bo'sh transkript — chegaralar ichida, total==yig'indi", () => {
    const r = mockScore([]);
    assertBounds(r);
    expect(r.breakdown.salomlashish).toBe(0);
  });

  it("uzun ko'p replikali suhbat ham chegaradan oshmaydi", () => {
    const long: ChatTurn[] = [];
    for (let i = 0; i < 20; i++) {
      long.push(
        seller("Bu juda ajoyib mahsulot, sizga mos keladi deb o'ylayman?"),
      );
      long.push(client("Bilmadim, o'ylab ko'ray."));
    }
    const r = mockScore(long);
    assertBounds(r);
    // ko'p replika bo'lsa otkazlarga_ishlov shiftga (30) yetadi.
    expect(r.breakdown.otkazlarga_ishlov).toBe(30);
    expect(r.breakdown.ohang).toBe(20);
  });

  it("savol berilgan bo'lsa ehtiyoj_aniqlash yuqoriroq", () => {
    const withQ = mockScore([seller("Sizga nima muhim, aka?")]);
    const withoutQ = mockScore([seller("Bizda zo'r mahsulot bor")]);
    expect(withQ.breakdown.ehtiyoj_aniqlash).toBeGreaterThan(
      withoutQ.breakdown.ehtiyoj_aniqlash,
    );
  });

  it("xp_awarded total'ga teng (mock formulasi)", () => {
    const r = mockScore([seller("Salom, qalaysiz?")]);
    expect(r.xp_awarded).toBe(Math.round(r.total));
  });
});
