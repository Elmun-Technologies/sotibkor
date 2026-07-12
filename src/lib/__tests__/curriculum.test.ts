import { describe, expect, it } from "vitest";
import {
  ALL_LESSONS,
  curriculumStars,
  findLesson,
  isLessonUnlocked,
  lessonProgress,
} from "../curriculum";

describe("findLesson", () => {
  it("mavjud id uchun darsni topadi", () => {
    expect(findLesson("ochilish")?.id).toBe("ochilish");
  });

  it("noma'lum id uchun undefined qaytaradi", () => {
    expect(findLesson("yoq_bunday_dars")).toBeUndefined();
  });
});

describe("lessonProgress", () => {
  it("mock progressi bor dars uchun to'g'ri qiymat qaytaradi", () => {
    const p = lessonProgress("ochilish");
    expect(p.completion).toBe(100);
    expect(p.stars).toBe(3);
  });

  it("mockda yo'q id uchun bo'sh (0) progress qaytaradi", () => {
    const p = lessonProgress("yoq_bunday_dars");
    expect(p.completion).toBe(0);
    expect(p.stars).toBe(0);
    expect(p.score).toBeNull();
  });
});

describe("isLessonUnlocked", () => {
  it("birinchi dars har doim ochiq", () => {
    expect(isLessonUnlocked(ALL_LESSONS[0].id)).toBe(true);
  });

  it("oldingi dars tugagan bo'lsa keyingisi ochiq", () => {
    // "ochilish" (1-dars) 100% tugagan -> "ehtiyoj" (2-dars) ochiq.
    expect(isLessonUnlocked("ehtiyoj")).toBe(true);
  });

  it("oldingi dars tugamagan bo'lsa keyingisi yopiq", () => {
    // "narx_etirozi" 60% (tugamagan) -> "ishonch_etirozi" yopiq.
    expect(isLessonUnlocked("ishonch_etirozi")).toBe(false);
  });

  it("noma'lum dars id uchun xavfsiz true qaytaradi", () => {
    expect(isLessonUnlocked("yoq_bunday_dars")).toBe(true);
  });
});

describe("curriculumStars", () => {
  it("umumiy yulduzlar mock progressga mos yig'indi", () => {
    const { earned, total } = curriculumStars();
    expect(total).toBe(ALL_LESSONS.length * 3);
    expect(earned).toBeGreaterThan(0);
    expect(earned).toBeLessThanOrEqual(total);
  });
});
