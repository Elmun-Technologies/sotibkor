/**
 * Streaming pipeline uchun gap ajratgich. LLM oqimidan matn bo'laklari keladi;
 * birinchi to'liq gap (`.`/`?`/`!`/`…`) tayyor bo'lishi bilan darrov TTS'ga
 * uzatiladi (butun javob kutilmaydi) — latency uchun kritik (CLAUDE.md §5).
 *
 * TTFB optimizatsiyasi: `earlyFirst` yoqilsa, BIRINCHI bo'lak vergul/tire
 * kabi ergash-gap chegarasida ham chiqariladi (agar u yetarlicha uzun bo'lsa) —
 * shunda persona uzun gap bilan boshlaganda ham birinchi tovush tezroq
 * eshitiladi. Faqat birinchi bo'lakka ta'sir qiladi; qolgani odatdagidek
 * to'liq gap chegarasida.
 */

const SENTENCE_END = /[.!?…]+[\s"»)]*/;
/** Birinchi bo'lak uchun ergash-gap chegarasi (vergul/tire/ikki nuqta/nuqta-vergul). */
const CLAUSE_BREAK = /[,—:;][\s"»)]*/;
/** Birinchi bo'lakni erta chiqarish uchun minimal uzunlik — juda qisqa parcha TTS'da g'alati eshitiladi. */
const MIN_FIRST_CHARS = 14;

export interface SentenceStreamerOptions {
  /** Birinchi bo'lakni ergash-gap chegarasida ham erta chiqarish (TTFB uchun). */
  earlyFirst?: boolean;
  /** Erta chiqarish uchun minimal belgilar soni (standart 14). */
  minFirstChars?: number;
}

/**
 * Oqim bo'laklarini yig'ib, to'liq gaplarni chiqaradigan buffer.
 *
 *   const sp = new SentenceStreamer();
 *   sp.push(chunk) -> string[] (tayyor gaplar)
 *   sp.flush()     -> string[] (qolgan matn)
 */
export class SentenceStreamer {
  private buffer = "";
  private emitted = false;
  private readonly earlyFirst: boolean;
  private readonly minFirstChars: number;

  constructor(opts: SentenceStreamerOptions = {}) {
    this.earlyFirst = opts.earlyFirst ?? false;
    this.minFirstChars = opts.minFirstChars ?? MIN_FIRST_CHARS;
  }

  push(chunk: string): string[] {
    this.buffer += chunk;
    const out: string[] = [];
    let match: RegExpMatchArray | null;
    // Buferdan to'liq gaplarni birma-bir uzib olamiz.
    while ((match = this.buffer.match(SENTENCE_END)) && match.index != null) {
      const end = match.index + match[0].length;
      const sentence = this.buffer.slice(0, end).trim();
      if (sentence) {
        out.push(sentence);
        this.emitted = true;
      }
      this.buffer = this.buffer.slice(end);
    }

    // TTFB: hali hech narsa chiqmagan bo'lsa va birinchi bo'lakni erta
    // chiqarish yoqilgan bo'lsa — ergash-gap chegarasida (yetarlicha uzun
    // bo'lsa) birinchi parchani ajratib yuboramiz.
    if (this.earlyFirst && !this.emitted && out.length === 0) {
      const cb = this.buffer.match(CLAUSE_BREAK);
      if (cb && cb.index != null && cb.index >= this.minFirstChars) {
        const end = cb.index + cb[0].length;
        const first = this.buffer.slice(0, end).trim();
        if (first) {
          out.push(first);
          this.emitted = true;
          this.buffer = this.buffer.slice(end);
        }
      }
    }
    return out;
  }

  flush(): string[] {
    const rest = this.buffer.trim();
    this.buffer = "";
    if (rest) this.emitted = true;
    return rest ? [rest] : [];
  }
}
