"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * (app) bo'limidagi har bir navigatsiyada yengil kirish animatsiyasi.
 * Next.js App Router `template.tsx`ni har marshrut o'zgarishida qayta mount
 * qiladi — shuning uchun bu yerda entrance beriladi. Faqat opacity/transform
 * (kompozitor) — kritik ovoz yo'liga (trener) ta'sir qilmaydi, chunki bu bir
 * martalik mount effekti, LLM/STT/TTS async oqimidan mustaqil.
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
