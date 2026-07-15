import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchWithTimeout,
  firstTokenWatchdog,
  isTimeoutError,
  TimeoutError,
  VOICE_TIMEOUTS,
} from "../fetchDeadline";

/** Signal abort bo'lguncha osilib turadigan, keyin AbortError bilan uziladigan fetch stubi (real fetch kabi). */
function hangingFetch(): typeof fetch {
  return ((_input: unknown, init: RequestInit = {}) =>
    new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => {
        const e = new Error("aborted");
        e.name = "AbortError";
        reject(e);
      });
    })) as unknown as typeof fetch;
}

describe("fetchWithTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("javob tez kelsa oddiy Response qaytaradi (timeout ishga tushmaydi)", async () => {
    const fast = (() =>
      Promise.resolve(new Response("ok"))) as unknown as typeof fetch;
    const res = await fetchWithTimeout("/x", {}, 1000, fast);
    expect(res.ok).toBe(true);
  });

  it("deadline oshsa TimeoutError bilan uzadi (osilib qolmaydi)", async () => {
    const p = fetchWithTimeout("/slow", {}, 1000, hangingFetch());
    // Rad etishni oldindan ushlaymiz (unhandled rejection bo'lmasin).
    const assertion = expect(p).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("deadline'gacha javob kelmasa aynan belgilangan vaqtdan keyin uzadi", async () => {
    const p = fetchWithTimeout("/slow", {}, 3500, hangingFetch());
    const assertion = expect(p).rejects.toThrow(/3500/);
    await vi.advanceTimersByTimeAsync(3500);
    await assertion;
  });
});

describe("firstTokenWatchdog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("armed() chaqirilmasa timeout'dan keyin onStall ishga tushadi", async () => {
    const onStall = vi.fn();
    firstTokenWatchdog(1000, onStall);
    await vi.advanceTimersByTimeAsync(1000);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it("armed() (birinchi token keldi) onStall'ni bekor qiladi", async () => {
    const onStall = vi.fn();
    const wd = firstTokenWatchdog(1000, onStall);
    wd.armed();
    await vi.advanceTimersByTimeAsync(2000);
    expect(onStall).not.toHaveBeenCalled();
  });

  it("clear() ham onStall'ni bekor qiladi", async () => {
    const onStall = vi.fn();
    const wd = firstTokenWatchdog(1000, onStall);
    wd.clear();
    await vi.advanceTimersByTimeAsync(2000);
    expect(onStall).not.toHaveBeenCalled();
  });
});

describe("isTimeoutError", () => {
  it("TimeoutError va AbortError'ni taniydi, boshqasini yo'q", () => {
    expect(isTimeoutError(new TimeoutError(1000))).toBe(true);
    const abort = new Error("x");
    abort.name = "AbortError";
    expect(isTimeoutError(abort)).toBe(true);
    expect(isTimeoutError(new Error("oddiy"))).toBe(false);
    expect(isTimeoutError(null)).toBe(false);
  });
});

describe("VOICE_TIMEOUTS", () => {
  it("byudjetga mos deadline'lar (STT eng keng, TTS/LLM tezroq)", () => {
    expect(VOICE_TIMEOUTS.tts).toBeLessThan(VOICE_TIMEOUTS.stt);
    expect(VOICE_TIMEOUTS.llmFirstToken).toBeLessThan(VOICE_TIMEOUTS.stt);
    expect(VOICE_TIMEOUTS.tts).toBeGreaterThan(0);
  });
});
