import { describe, expect, it } from "vitest";
import { LEVELS, levelForXp } from "../levels";

// KONTRAKT: 5 daraja, minXp: stajyor=0, sotuvchi=300, katta_sotuvchi=900,
// menejer=2000, sales_master=4000. levelForXp -> { current, next, intoLevel, toNext, progress(0..1) }.

describe("LEVELS registri", () => {
  it("5 ta daraja, kontrakt tartibida", () => {
    expect(LEVELS.map((l) => l.key)).toEqual([
      "stajyor",
      "sotuvchi",
      "katta_sotuvchi",
      "menejer",
      "sales_master",
    ]);
  });

  it("minXp qiymatlari kontraktga mos", () => {
    expect(LEVELS.map((l) => l.minXp)).toEqual([0, 300, 900, 2000, 4000]);
  });

  it("minXp qat'iy o'sish tartibida", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp);
    }
  });
});

describe("levelForXp chegaralari", () => {
  it("0 XP -> stajyor, keyingi sotuvchi, progress 0", () => {
    const r = levelForXp(0);
    expect(r.current.key).toBe("stajyor");
    expect(r.next?.key).toBe("sotuvchi");
    expect(r.progress).toBe(0);
    expect(r.intoLevel).toBe(0);
    expect(r.toNext).toBe(300);
  });

  it("chegaradan bir past (299) -> hali stajyor", () => {
    expect(levelForXp(299).current.key).toBe("stajyor");
  });

  it("aniq chegara (300) -> sotuvchi", () => {
    const r = levelForXp(300);
    expect(r.current.key).toBe("sotuvchi");
    expect(r.intoLevel).toBe(0);
    expect(r.progress).toBe(0);
  });

  it("daraja ichida (1250) -> katta_sotuvchi, progress 0..1 oralig'ida", () => {
    const r = levelForXp(1250);
    expect(r.current.key).toBe("katta_sotuvchi");
    expect(r.next?.key).toBe("menejer");
    expect(r.intoLevel).toBe(350); // 1250 - 900
    expect(r.toNext).toBe(750); // 2000 - 1250
    expect(r.progress).toBeGreaterThan(0);
    expect(r.progress).toBeLessThan(1);
    expect(r.progress).toBeCloseTo(350 / 1100, 5);
  });

  it("eng yuqori daraja (>=4000) -> next null, progress 1, toNext 0", () => {
    const r = levelForXp(6000);
    expect(r.current.key).toBe("sales_master");
    expect(r.next).toBeNull();
    expect(r.progress).toBe(1);
    expect(r.toNext).toBe(0);
  });

  it("manfiy XP xavfsiz (stajyorga qisiladi)", () => {
    const r = levelForXp(-500);
    expect(r.current.key).toBe("stajyor");
    expect(r.progress).toBe(0);
  });
});
