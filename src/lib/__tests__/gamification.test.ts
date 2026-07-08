import { describe, expect, it } from "vitest";
import { nextStreak, xpForScore } from "../gamification";

// KONTRAKT (BE-B):
//   xpForScore(total, { closed?, personaLevel? }) ~ total + (closed?50:0) + (personaLevel>=6?30:0)
//   nextStreak(prevStreak, lastActiveISO|null, todayISO) -> yangi streak.
// Sanalar ISO 'YYYY-MM-DD'.

describe("xpForScore", () => {
  it("bonussiz — total'ning o'zi", () => {
    expect(xpForScore(72)).toBe(72);
  });

  it("yopilgan suhbat -> +50", () => {
    expect(xpForScore(72, { closed: true })).toBe(72 + 50);
  });

  it("qiyin persona (level>=6) -> +30", () => {
    expect(xpForScore(72, { personaLevel: 6 })).toBe(72 + 30);
  });

  it("oson persona (level<6) -> bonus yo'q", () => {
    expect(xpForScore(72, { personaLevel: 5 })).toBe(72);
  });

  it("ikkala bonus birga", () => {
    expect(xpForScore(80, { closed: true, personaLevel: 7 })).toBe(
      80 + 50 + 30,
    );
  });

  it("manfiy total 0 ga qisiladi (bonuslar saqlanadi)", () => {
    expect(xpForScore(-10, { closed: true })).toBe(50);
  });

  it("natija butun son", () => {
    expect(Number.isInteger(xpForScore(55.4, { closed: true }))).toBe(true);
  });
});

describe("nextStreak", () => {
  it("lastActive null -> bugun birinchi kun (1)", () => {
    expect(nextStreak(0, null, "2026-07-08")).toBe(1);
  });

  it("lastActive kecha -> davomi (prev+1)", () => {
    expect(nextStreak(4, "2026-07-07", "2026-07-08")).toBe(5);
  });

  it("lastActive bugun -> o'zgarmaydi (>=1)", () => {
    expect(nextStreak(4, "2026-07-08", "2026-07-08")).toBe(4);
  });

  it("uzilish (>1 kun) -> qaytadan 1", () => {
    expect(nextStreak(9, "2026-07-05", "2026-07-08")).toBe(1);
  });

  it("noto'g'ri lastActive formati -> birinchi kun (1)", () => {
    expect(nextStreak(3, "kecha", "2026-07-08")).toBe(1);
  });

  it("bir kunlik streak boshi (prev 0, kecha faol) -> 1", () => {
    // prev 0 bo'lsa ham kecha faol bo'lsa davomi 0+1 = 1.
    expect(nextStreak(0, "2026-07-07", "2026-07-08")).toBe(1);
  });
});
