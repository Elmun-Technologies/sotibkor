import { describe, it, expect } from "vitest";
import { generateWeeklyPlan } from "../weeklyPlan";
import { personaForObjection } from "../content";

describe("generateWeeklyPlan (haftalik reja — 10x-4)", () => {
  it("har doim aynan 7 kun qaytaradi", () => {
    expect(generateWeeklyPlan("narx")).toHaveLength(7);
    expect(generateWeeklyPlan(null)).toHaveLength(7);
  });

  it("deterministik — bir xil kirish, bir xil chiqish", () => {
    expect(generateWeeklyPlan("ishonch")).toEqual(
      generateWeeklyPlan("ishonch"),
    );
  });

  it("kun indekslari 0..6 tartibda", () => {
    const plan = generateWeeklyPlan("vaqt");
    plan.forEach((d, i) => expect(d.dayIndex).toBe(i));
  });

  it("zaif e'tiroz birinchi kunga qo'yiladi", () => {
    expect(generateWeeklyPlan("raqobat")[0].objection).toBe("raqobat");
  });

  it("zaif e'tiroz hafta davomida kamida 2 marta takrorlanadi (spaced repetition)", () => {
    const plan = generateWeeklyPlan("narx");
    const count = plan.filter((d) => d.objection === "narx").length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("har kun e'tiroziga mos persona biriktiriladi", () => {
    for (const d of generateWeeklyPlan("qaror")) {
      const expected = personaForObjection(d.objection);
      if (expected) expect(d.persona).toBe(expected);
    }
  });

  it("daraja hafta oxiriga bordim-sari oshadi", () => {
    const plan = generateWeeklyPlan("narx");
    expect(plan[0].level).toBeLessThanOrEqual(plan[6].level);
    expect(plan[0].level).toBe(2);
  });

  it("profil sohalari berilsa faqat shulardan foydalanadi", () => {
    const plan = generateWeeklyPlan("narx", ["bank", "telekom"]);
    for (const d of plan) {
      expect(["bank", "telekom"]).toContain(d.soha);
    }
  });

  it("zaif e'tiroz null yoki personasiz (ehtiyoj) bo'lsa ham 7 kun ishlaydi", () => {
    expect(generateWeeklyPlan(null)).toHaveLength(7);
    expect(generateWeeklyPlan("ehtiyoj")).toHaveLength(7);
  });
});
