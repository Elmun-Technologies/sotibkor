"use client";

/**
 * Ovoz faolligini aniqlash (VAD) — mijoz (persona) gapirayotganda sotuvchi
 * gapni bo'lsa, darrov aniqlab beradi (issue #7 — to'liq barge-in).
 *
 * Brauzer Web Audio API orqali mikrofon balandligini kuzatadi (ML model
 * emas — oddiy RMS chegarasi + barqarorlik vaqti). `echoCancellation` va
 * `noiseSuppression` yoqilgan — dinamikdan chiqayotgan persona ovozi mikrofonga
 * qaytib "o'zini bo'lib qo'ymasligi" uchun asosiy himoya shu.
 *
 * MUHIM: chegara qiymatlari (`thresholdRms`/`sustainMs`) haqiqiy qurilma/
 * mikrofon bilan sinovdan o'tkazilmagan (bu muhitda audio uskunasi yo'q) —
 * real foydalanuvchilar bilan kalibrlanishi kerak. Xato ishga tushsa
 * (masalan fon shovqinidan) — eng yomon holatda persona bir oz erta
 * to'xtaydi, hech narsa buzilmaydi (qo'lda mikrofon/matn tugmasi baribir
 * ishlaydi).
 */

import { useEffect, useRef } from "react";

/**
 * Vaqt-domeni bayt bufferidan (0..255, 128 markazlangan) RMS balandligini
 * hisoblaydi — analyser.getByteTimeDomainData() natijasi shu shaklda keladi.
 */
export function computeRms(data: Uint8Array): number {
  if (data.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i] - 128;
    sumSquares += v * v;
  }
  return Math.sqrt(sumSquares / data.length);
}

export interface VoiceActivityOptions {
  /** Mikrofon oqimi shu true bo'lganda ochiladi/saqlanadi (masalan "chat" bosqichi). */
  enabled: boolean;
  /** Shu true bo'lgandagina ovoz balandligi trigger sifatida hisoblanadi (masalan persona gapirayotganda). */
  listening: boolean;
  /** Barqaror ovoz aniqlanganda chaqiriladi. */
  onVoice: () => void;
  /** 0..255 (vaqt-domeni RMS) — shundan baland bo'lsa "gapiryapti" hisoblanadi. */
  thresholdRms?: number;
  /** Shuncha millisekund barqaror baland bo'lsa trigger otiladi (qisqa shovqinni filtrlaydi). */
  sustainMs?: number;
}

export function useVoiceActivity({
  enabled,
  listening,
  onVoice,
  thresholdRms = 30,
  sustainMs = 220,
}: VoiceActivityOptions): void {
  const listeningRef = useRef(listening);
  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  const onVoiceRef = useRef(onVoice);
  useEffect(() => {
    onVoiceRef.current = onVoice;
  }, [onVoice]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf: number | null = null;
    let aboveSince: number | null = null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!listeningRef.current) {
            aboveSince = null;
          } else {
            analyser.getByteTimeDomainData(data);
            const rms = computeRms(data);
            const now = performance.now();
            if (rms > thresholdRms) {
              if (aboveSince == null) aboveSince = now;
              if (now - aboveSince >= sustainMs) {
                aboveSince = null;
                onVoiceRef.current();
              }
            } else {
              aboveSince = null;
            }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // Mikrofon ruxsati yo'q/rad etildi — VAD jimgina o'chadi, qo'lda
        // mikrofon/matn tugmasi baribir to'liq ishlayveradi.
      }
    }
    void start();

    return () => {
      cancelled = true;
      if (raf != null) cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [enabled, thresholdRms, sustainMs]);
}
