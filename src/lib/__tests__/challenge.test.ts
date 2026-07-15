import { describe, it, expect } from "vitest";
import { weeklyChallenge } from "../challenge";
import { SCENARIOS } from "../scenarios";

describe("weeklyChallenge (haftalik challenge — 10x-5)", () => {
  it("mavjud ssenariylardan birini qaytaradi", () => {
    const c = weeklyChallenge("2026-W1");
    expect(SCENARIOS.some((s) => s.id === c.id)).toBe(true);
  });

  it("bir xil hafta uchun deterministik (hamma bir xil challenge ko'radi)", () => {
    expect(weeklyChallenge("2026-W12").id).toBe(weeklyChallenge("2026-W12").id);
  });

  it("turli haftalar odatda turli challenge beradi (hash tarqaladi)", () => {
    const ids = new Set(
      Array.from(
        { length: 12 },
        (_, i) => weeklyChallenge(`2026-W${i + 1}`).id,
      ),
    );
    // 9 ta ssenariy bor — 12 haftada kamida 3 xil challenge chiqishi kerak.
    expect(ids.size).toBeGreaterThanOrEqual(3);
  });

  it("har doim to'liq ssenariy obyekti (persona/soha/nom bilan)", () => {
    const c = weeklyChallenge("2026-W5");
    expect(c.persona).toBeTruthy();
    expect(c.soha).toBeTruthy();
    expect(c.name.length).toBeGreaterThan(0);
  });
});
