"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  /** Kirish kechikishi (sekund) — ketma-ket paydo bo'lish uchun. */
  delay?: number;
  className?: string;
}

/**
 * Sahifa bloklari uchun yumshoq "yuqoridan paydo bo'lish" animatsiyasi.
 * `prefers-reduced-motion` hurmat qilinadi (harakat o'rniga statik ko'rsatiladi).
 * Bir marta ko'rinishi bilan cheklangan (qayta-scroll'da qayta o'ynamaydi).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
