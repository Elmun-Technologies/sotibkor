"use client";

/**
 * Mikrofon tekshiruvi — suhbat BOSHLANISHIDAN oldin ko'rsatiladigan ekran
 * uchun (CloseMe-solishtiruv #1). Ovoz aylanasining kritik yo'lidan tashqarida
 * ishlaydi (hali suhbat boshlanmagan) — shuning uchun latency cheklovi yo'q,
 * lekin baribir soddaligicha qoladi: `useVoiceActivity.ts`dagi bir xil
 * RMS/AnalyserNode yondashuvidan foydalanadi.
 */

import { useEffect, useState } from "react";
import { computeRms } from "./useVoiceActivity";

export type MicPermission = "pending" | "granted" | "denied";

export interface MicCheckState {
  permission: MicPermission;
  /** 0..100 — joriy mikrofon balandligi (vizual o'lchagich uchun). */
  level: number;
}

export function useMicCheck(active: boolean): MicCheckState {
  const [permission, setPermission] = useState<MicPermission>("pending");
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!active) {
      setPermission("pending");
      setLevel(0);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setPermission("denied");
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf: number | null = null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        setPermission("granted");
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          // RMS taxminan 0..40 oralig'ida foydali signal beradi (og'zaki
          // gapirish balandligida) — 0..100 o'lchagich uchun shu bo'yicha kengaytiramiz.
          const rms = computeRms(data);
          setLevel(Math.max(0, Math.min(100, Math.round((rms / 40) * 100))));
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        if (!cancelled) setPermission("denied");
      }
    }
    void start();

    return () => {
      cancelled = true;
      if (raf != null) cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [active]);

  return { permission, level };
}
