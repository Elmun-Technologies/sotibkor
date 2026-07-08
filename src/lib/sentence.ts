/**
 * Streaming pipeline uchun gap ajratgich. LLM oqimidan matn bo'laklari keladi;
 * birinchi to'liq gap (`.`/`?`/`!`/`…`) tayyor bo'lishi bilan darrov TTS'ga
 * uzatiladi (butun javob kutilmaydi) — latency uchun kritik (CLAUDE.md §5).
 */

const SENTENCE_END = /[.!?…]+[\s"»)]*/;

/**
 * Oqim bo'laklarini yig'ib, to'liq gaplarni chiqaradigan buffer.
 *
 *   const sp = new SentenceStreamer();
 *   sp.push(chunk) -> string[] (tayyor gaplar)
 *   sp.flush()     -> string[] (qolgan matn)
 */
export class SentenceStreamer {
  private buffer = "";

  push(chunk: string): string[] {
    this.buffer += chunk;
    const out: string[] = [];
    let match: RegExpMatchArray | null;
    // Buferdan to'liq gaplarni birma-bir uzib olamiz.
    while ((match = this.buffer.match(SENTENCE_END)) && match.index != null) {
      const end = match.index + match[0].length;
      const sentence = this.buffer.slice(0, end).trim();
      if (sentence) out.push(sentence);
      this.buffer = this.buffer.slice(end);
    }
    return out;
  }

  flush(): string[] {
    const rest = this.buffer.trim();
    this.buffer = "";
    return rest ? [rest] : [];
  }
}
