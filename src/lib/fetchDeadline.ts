/**
 * Deadline'li fetch — ovoz aylanasining "osilib qolish"ka qarshi yadrosi.
 *
 * Raqobatchining (CloseMe) eng katta zaifi: sekin javob va dialog osilishi.
 * Sekin ulanish / VPN ostida oddiy `fetch` cheksiz kutishi mumkin — bu esa
 * suhbatni muzlatib qo'yadi. Har bir kritik yo'l chaqiruvi (STT/LLM/TTS) uchun
 * qat'iy deadline qo'yamiz: belgilangan vaqtda javob kelmasa — AbortController
 * bilan uzamiz va chaqiruvchi darrov zaxira (fallback) rejimiga o'tadi.
 *
 * Faqat mijoz (brauzer) tomonida ishlatiladi. Server tomonidagi Aisha/OpenAI
 * chaqiruvlari o'zining alohida timeout'iga ega (aisha.ts / llm.ts).
 */

/** Kritik yo'l deadline'lari (ms). Byudjet: to'liq aylana < 2000ms (ARCHITECTURE §5). */
export const VOICE_TIMEOUTS = {
  /** STT — gap uzunroq bo'lishi mumkin, biroz kengroq deadline. */
  stt: 8000,
  /** TTS birinchi javob — sekin bo'lsa Web Speech zaxirasiga tez o'tamiz. */
  tts: 3500,
  /** LLM birinchi token — kelmasa oqim osilgan, uzamiz. */
  llmFirstToken: 4500,
} as const;

/** Deadline oshib ketganda tashlanadigan xato — chaqiruvchi buni fallback signali deb biladi. */
export class TimeoutError extends Error {
  constructor(public timeoutMs: number) {
    super(`Deadline (${timeoutMs}ms) oshib ketdi`);
    this.name = "TimeoutError";
  }
}

export function isTimeoutError(err: unknown): boolean {
  return (
    err instanceof TimeoutError ||
    (err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError"))
  );
}

type FetchImpl = typeof fetch;

/**
 * `fetch`, lekin `timeoutMs` ichida ulanish (birinchi javob) kelmasa uziladi.
 * Streaming javoblar uchun: deadline faqat javob HEADER'igacha (birinchi bayt
 * emas, `Response` qaytguncha) amal qiladi — tanani o'qish alohida boshqariladi.
 *
 * Tashqi `signal` berilsa, u ham hurmat qilinadi (barge-in / komponent unmount).
 * Test uchun `fetchImpl` in'ektsiya qilinishi mumkin.
 */
export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = 5000,
  fetchImpl: FetchImpl = fetch,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Tashqi signal (agar berilsa) ham abort'ni chaqirsin.
  const external = init.signal;
  if (external) {
    if (external.aborted) controller.abort();
    else
      external.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
  }

  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (timedOut) throw new TimeoutError(timeoutMs);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Streaming oqim uchun "birinchi token watchdog": `timeoutMs` ichida
 * `armed()` chaqirilmasa (birinchi bayt kelmasa), `onStall()` ishga tushadi.
 * Birinchi token kelishi bilan `armed()` chaqiriladi va watchdog o'chadi.
 *
 *   const wd = firstTokenWatchdog(4500, () => controller.abort());
 *   ... birinchi chunk kelganda: wd.armed();
 *   ... oxirida (har holatda): wd.clear();
 */
export function firstTokenWatchdog(
  timeoutMs: number,
  onStall: () => void,
): { armed: () => void; clear: () => void } {
  let disarmed = false;
  const timer = setTimeout(() => {
    if (!disarmed) onStall();
  }, timeoutMs);
  return {
    armed: () => {
      disarmed = true;
      clearTimeout(timer);
    },
    clear: () => {
      disarmed = true;
      clearTimeout(timer);
    },
  };
}
