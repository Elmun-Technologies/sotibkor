/**
 * Qo'ng'iroq audio klipini arxivga yuklaydi — FIRE-AND-FORGET (javob
 * kutilmaydi). Ovoz aylanasining kritik yo'liga (STT→LLM→TTS) hech qanday
 * kechikish qo'shmasligi uchun chaqiruvchi hech qachon buni await qilmasin.
 */

export type Speaker = "sotuvchi" | "mijoz";

export function uploadClip(
  sessionId: string,
  speaker: Speaker,
  clipIndex: number,
  blob: Blob,
): void {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("speaker", speaker);
  form.append("clipIndex", String(clipIndex));
  form.append("audio", blob, "clip.audio");
  void fetch("/api/archive/audio", { method: "POST", body: form }).catch(() => {
    /* fon vazifasi — xato bo'lsa jimgina e'tiborsiz (arxiv ixtiyoriy) */
  });
}
