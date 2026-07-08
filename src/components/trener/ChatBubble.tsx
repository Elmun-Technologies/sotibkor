"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { getMessages } from "@/i18n";

const t = getMessages();

export interface ChatBubbleProps {
  role: "user" | "assistant";
  live?: boolean;
  children: ReactNode;
}

/** Transkript pufakchasi. Sotuvchi o'ngda (neon), mijoz chapda (surface). */
export function ChatBubble({ role, live = false, children }: ChatBubbleProps) {
  const isSeller = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isSeller ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isSeller ? "bg-ink text-onink" : "inset text-foreground"
        }`}
      >
        <div
          className={`mb-1 font-mono text-[10px] uppercase tracking-wider ${
            isSeller ? "text-onink/60" : "text-muted"
          }`}
        >
          {isSeller ? t.trener.you : t.trener.client}
        </div>
        <span>{children}</span>
        {live && (
          <motion.span
            aria-hidden
            className="ml-1 inline-block h-3 w-[2px] translate-y-0.5 bg-current"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}
