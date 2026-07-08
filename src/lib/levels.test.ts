import { describe, expect, it } from "vitest";
import { LEVELS, levelForXp } from "./levels";

describe("LEVELS", () => {
  it("5 ta daraja, minXp o'sish tartibida", () => {
    expect(LEVELS.map((l) => l.key)).toEqual([
      "stajyor",
      "sotuvchi",
      "katta_sotuvchi",
      "menejer",
      "sales_master",
    ]);
    expect(LEVELS.map((l) => l.minXp)).toEqual([0, 300, 900, 2000, 4000]);
  });
});

describe("levelForXp", () => {
  it("0 XP -> stajyor, keyingi sotuvchi", () => {
    const r = levelForXp(0);
    expect(r.current.key).toBe("stajyor");
    expect(r.next?.key).toBe("sotuvchi");
    expect(r.progress).toBe(0);
    expect(r.toNext).toBe(300);
  });

  it("chegara qiymati (300) -> sotuvchi", () => {
    expect(levelForXp(300).current.key).toBe("sotuvchi");
  });

  it("1250 XP -> katta_sotuvchi, progress oralig'ida", () => {
    const r = levelForXp(1250);
    expect(r.current.key).toBe("katta_sotuvchi");
    expect(r.next?.key).toBe("menejer");
    expect(r.intoLevel).toBe(350);
    expect(r.toNext).toBe(750);
    expect(r.progress).toBeCloseTo(350 / 1100, 5);
  });

  it("eng yuqori daraja -> next null, progress 1", () => {
    const r = levelForXp(5000);
    expect(r.current.key).toBe("sales_master");
    expect(r.next).toBeNull();
    expect(r.progress).toBe(1);
    expect(r.toNext).toBe(0);
  });

  it("manfiy XP xavfsiz (0 ga qisiladi)", () => {
    expect(levelForXp(-100).current.key).toBe("stajyor");
  });
});
