/**
 * Haftalik reja (10x-4) — shaxsiy mashq rejasining DETERMINISTIK yadrosi.
 *
 * closeme'da yo'q: sotuvchining eng zaif e'tirozini (spaced-repetition,
 * `getWeakObjection`) markazga qo'yib, 7 kunlik maqsadli mashq rejasi
 * tuzadi. Sof funksiya — LLM YO'Q (kalitsiz ham to'liq ishlaydi, test
 * qilinadi). LLM asosidagi "AI mentor izohi" keyingi bosqichda ustiga
 * qo'shilishi mumkin (real OPENAI_API_KEY bilan) — bu interfeys o'zgarmaydi.
 */

import type { ObjectionType } from "./coach";
import {
  PERSONA_KEYS,
  SOHA_KEYS,
  personaForObjection,
  type PersonaKey,
  type SohaKey,
} from "./content";

export interface PlanDay {
  /** 0 = dushanba ... 6 = yakshanba. */
  dayIndex: number;
  objection: ObjectionType;
  persona: PersonaKey;
  soha: SohaKey;
  /** Qiyinlik darajasi (1..6) — hafta oxiriga bordim-sari oshadi. */
  level: number;
}

/** Persona bilan bog'langan e'tiroz turlari (ehtiyoj personasiz — chiqarib tashlanadi). */
const OBJECTIONS_WITH_PERSONA: ObjectionType[] = [
  "narx",
  "ishonch",
  "vaqt",
  "qaror",
  "raqobat",
];

/**
 * 7 kunlik rejani tuzadi. Zaif e'tiroz (bo'lsa) 1- va 4-kunlarda takrorlanadi
 * (spaced repetition), qolgan kunlar boshqa turlar bilan to'ldiriladi.
 * Sohalar `spheres` (foydalanuvchi profili) bo'yicha, bo'lmasa barcha sohalar
 * bo'yicha aylanadi. To'liq deterministik — bir xil kirish, bir xil chiqish.
 */
export function generateWeeklyPlan(
  weakObjection: ObjectionType | null,
  spheres?: SohaKey[],
): PlanDay[] {
  // Kun ketma-ketligi: zaif tur birinchi bo'lsin, keyin qolganlari (barqaror
  // tartibda), oxirida zaif tur yana bir marta (4-kun atrofida takror).
  const weak =
    weakObjection && OBJECTIONS_WITH_PERSONA.includes(weakObjection)
      ? weakObjection
      : null;

  const rest = OBJECTIONS_WITH_PERSONA.filter((o) => o !== weak);
  // 7 kunlik e'tiroz ketma-ketligini quramiz.
  const sequence: ObjectionType[] = [];
  if (weak) sequence.push(weak);
  sequence.push(...rest); // 4 ta (weak bo'lsa) yoki 5 ta
  // 7 kungacha to'ldiramiz: zaif turni (yoki birinchi turni) takrorlaymiz.
  const reinforce = weak ?? OBJECTIONS_WITH_PERSONA[0];
  while (sequence.length < 7) {
    sequence.push(reinforce);
  }

  const sohaPool = spheres && spheres.length > 0 ? spheres : SOHA_KEYS;

  return sequence.slice(0, 7).map((objection, dayIndex) => {
    const persona =
      personaForObjection(objection) ??
      PERSONA_KEYS[dayIndex % PERSONA_KEYS.length];
    const soha = sohaPool[dayIndex % sohaPool.length];
    // Daraja hafta davomida asta oshadi: 2 → 4.
    const level = 2 + Math.floor(dayIndex / 3);
    return { dayIndex, objection, persona, soha, level };
  });
}
