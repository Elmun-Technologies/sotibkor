"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Auth-gate tekshiruvi paytida ko'rsatiladigan yengil yuklanish holati
 * (avval `return null` — bo'sh miltillash edi). Kritik yo'ldan tashqarida.
 */
export function AppLoading() {
  const reduce = useReducedMotion();
  return (
    <div
      className="flex min-h-[60vh] w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-foreground/30"
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
