import { describe, expect, it } from "vitest";
import { computeRms } from "../useVoiceActivity";

describe("computeRms", () => {
  it("bo'sh massiv uchun 0 qaytaradi", () => {
    expect(computeRms(new Uint8Array([]))).toBe(0);
  });

  it("markazda (128) tekis signal — sukunat, RMS 0", () => {
    expect(computeRms(new Uint8Array(64).fill(128))).toBe(0);
  });

  it("doimiy chetlanish uchun RMS aynan shu chetlanishga teng", () => {
    // Barcha qiymatlar 128+40 — RMS = 40 (barcha nuqta bir xil bo'lgani uchun).
    expect(computeRms(new Uint8Array(64).fill(168))).toBeCloseTo(40, 5);
  });

  it("baland ovoz tinch signaldan yuqori RMS beradi", () => {
    const quiet = new Uint8Array(64).fill(130); // 128 dan 2 chetlangan
    const loud = new Uint8Array(64).fill(200); // 128 dan 72 chetlangan
    expect(computeRms(loud)).toBeGreaterThan(computeRms(quiet));
  });

  it("simmetrik ijobiy/salbiy chetlanishlar bir xil RMS beradi", () => {
    const positive = new Uint8Array(4).fill(128 + 50); // 178
    const negative = new Uint8Array(4).fill(128 - 50); // 78
    expect(computeRms(positive)).toBeCloseTo(computeRms(negative), 5);
  });
});
