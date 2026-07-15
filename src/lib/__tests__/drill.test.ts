import { describe, it, expect } from "vitest";
import {
  weakestObjectionType,
  recommendDrillCounts,
  buildQueue,
  isDrillDifficulty,
  DIFFICULTY_STRICTNESS,
} from "../drill";
import { OBJECTION_LIBRARY } from "../objections";
import type { ObjectionType } from "../coach";

const STATS: Record<ObjectionType, { met: number; resolved: number }> = {
  narx: { met: 14, resolved: 9 }, // 0.64
  ishonch: { met: 8, resolved: 6 }, // 0.75
  vaqt: { met: 11, resolved: 8 }, // 0.73
  ehtiyoj: { met: 6, resolved: 3 }, // 0.50
  qaror: { met: 9, resolved: 4 }, // 0.44 ← eng zaif
  raqobat: { met: 5, resolved: 3 }, // 0.60
};

describe("weakestObjectionType", () => {
  it("eng past resolved/met nisbatli turni topadi", () => {
    expect(weakestObjectionType(STATS)).toBe("qaror");
  });
  it("met=0 turlarni e'tiborsiz qoldiradi (nolga bo'lish yo'q)", () => {
    const s = { ...STATS, qaror: { met: 0, resolved: 0 } };
    expect(weakestObjectionType(s)).toBe("ehtiyoj");
  });
});

describe("recommendDrillCounts (spaced repetition)", () => {
  it("berilgan turdagi barcha e'tirozlarni tanlaydi", () => {
    const counts = recommendDrillCounts("narx", 2);
    const narxIds = OBJECTION_LIBRARY.filter((o) => o.type === "narx").map(
      (o) => o.id,
    );
    for (const id of narxIds) expect(counts[id]).toBe(2);
    // boshqa turlar tanlanmaydi
    const other = OBJECTION_LIBRARY.find((o) => o.type !== "narx");
    expect(counts[other!.id]).toBeUndefined();
  });
  it("tur null bo'lsa bo'sh tanlov", () => {
    expect(recommendDrillCounts(null)).toEqual({});
  });
});

describe("buildQueue", () => {
  it("takror sonlariga mos navbat quradi", () => {
    const id0 = OBJECTION_LIBRARY[0].id;
    const id1 = OBJECTION_LIBRARY[1].id;
    const q = buildQueue({ [id0]: 3, [id1]: 1 });
    expect(q).toHaveLength(4);
    expect(q.filter((r) => r.obj.id === id0)).toHaveLength(3);
    expect(q.filter((r) => r.obj.id === id1)).toHaveLength(1);
  });
  it("bo'sh tanlov — bo'sh navbat", () => {
    expect(buildQueue({})).toHaveLength(0);
  });
});

describe("qiyinlik", () => {
  it("isDrillDifficulty faqat 3 qiymatga true", () => {
    expect(isDrillDifficulty("past")).toBe(true);
    expect(isDrillDifficulty("orta")).toBe(true);
    expect(isDrillDifficulty("yuqori")).toBe(true);
    expect(isDrillDifficulty("oson")).toBe(false);
  });
  it("yuqori qiyinlik ballni pasaytiradi, past — ko'taradi", () => {
    expect(DIFFICULTY_STRICTNESS.yuqori).toBeGreaterThan(0);
    expect(DIFFICULTY_STRICTNESS.past).toBeLessThan(0);
    expect(DIFFICULTY_STRICTNESS.orta).toBe(0);
  });
});
