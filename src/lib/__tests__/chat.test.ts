import { describe, it, expect, beforeEach, vi } from "vitest";
import { CHANNELS, channelMessages, channelCount, postMessage } from "../chat";

// localStorage stubi (node env — window yo'q).
function makeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  const ls = makeStorage();
  vi.stubGlobal("window", { localStorage: ls });
  vi.stubGlobal("localStorage", ls);
});

describe("seed xabarlar", () => {
  it("har kanalda kamida bitta seed xabar bor", () => {
    for (const ch of CHANNELS) {
      expect(channelCount(ch)).toBeGreaterThan(0);
    }
  });
  it("xabarlar vaqt bo'yicha o'sish tartibida", () => {
    const msgs = channelMessages("umumiy");
    for (let i = 1; i < msgs.length; i++) {
      expect(msgs[i].at >= msgs[i - 1].at).toBe(true);
    }
  });
});

describe("postMessage", () => {
  it("yangi xabarni kanalga qo'shadi va oxiriga qo'yadi", () => {
    const before = channelCount("narx");
    const after = postMessage(
      "narx",
      "Men",
      "Sinov xabar",
      "2030-01-01T00:00:00Z",
    );
    expect(channelCount("narx")).toBe(before + 1);
    const last = after[after.length - 1];
    expect(last.text).toBe("Sinov xabar");
    expect(last.author).toBe("Men");
    expect(last.mine).toBe(true);
  });

  it("bo'sh matnni e'tiborsiz qoldiradi", () => {
    const before = channelCount("umumiy");
    postMessage("umumiy", "Men", "   ", "2030-01-01T00:00:00Z");
    expect(channelCount("umumiy")).toBe(before);
  });

  it("xabar faqat o'z kanalida ko'rinadi", () => {
    postMessage("qongiroq", "Men", "Faqat qongiroq", "2030-01-01T00:00:00Z");
    expect(
      channelMessages("qongiroq").some((m) => m.text === "Faqat qongiroq"),
    ).toBe(true);
    expect(
      channelMessages("motivatsiya").some((m) => m.text === "Faqat qongiroq"),
    ).toBe(false);
  });
});
