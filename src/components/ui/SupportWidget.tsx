"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";

const t = getMessages();

/**
 * Demo kontakt ma'lumotlari — real qo'llab-quvvatlash kanali ulanmagan
 * (keyingi bosqich). Faqat UI namunasi sifatida.
 */
const CONTACTS = {
  phone: "+998 90 123 45 67",
  telegram: "@sotuvchi_trainer",
  email: "yordam@sotuvchitrainer.uz",
};

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="flex items-center gap-3 rounded-lg2 border border-border bg-surface2 px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--good)]/10 text-[color:var(--good)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-foreground">
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-all duration-150 hover:bg-foreground/[.06] hover:text-foreground active:scale-[0.95]"
      >
        {copied ? `✓ ${t.yordam.copied}` : t.yordam.copyBtn}
      </button>
    </div>
  );
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Modal ochiq bo'lsa: Esc bilan yopish + orqa fon scroll'ini bloklash.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[color:var(--good)]/30 bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-lg transition-all duration-150 hover:bg-[color:var(--good)]/[.08] active:scale-[0.96]"
      >
        <span aria-hidden className="text-[color:var(--good)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3" />
            <path d="M4 17v-5a8 8 0 0 1 .5-2.8" />
            <path d="M8 19a4 4 0 0 0 4 2" />
            <rect x="2" y="11" width="4" height="6" rx="1.5" />
          </svg>
        </span>
        {t.yordam.button}
      </button>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-title"
          >
            <motion.button
              type="button"
              aria-label={t.yordam.close}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }
              }
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.yordam.close}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-faint transition-all duration-150 hover:bg-foreground/[.06] hover:text-foreground active:scale-[0.93]"
              >
                ✕
              </button>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--good)]/10 text-[color:var(--good)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3" />
                  <path d="M4 17v-5a8 8 0 0 1 .5-2.8" />
                  <path d="M8 19a4 4 0 0 0 4 2" />
                  <rect x="2" y="11" width="4" height="6" rx="1.5" />
                </svg>
              </div>
              <h2
                id="support-title"
                className="mt-4 text-center text-lg font-semibold tracking-tight"
              >
                {t.yordam.title}
              </h2>
              <p className="mt-1.5 text-center text-sm text-muted">
                {t.yordam.lead}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <ContactRow
                  label={t.yordam.phoneLabel}
                  value={CONTACTS.phone}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4.5 5.5c0 8 6 14 14 14 .9 0 1.5-.7 1.5-1.5v-2.3c0-.7-.5-1.3-1.2-1.5l-2.6-.6c-.6-.1-1.2.1-1.5.6l-.6.9c-2-1-3.6-2.6-4.6-4.6l.9-.6c.5-.3.7-.9.6-1.5l-.6-2.6C10.1 5 9.5 4.5 8.8 4.5H6.5C5.7 4.5 5 5.1 5 6l-.5-.5Z" />
                    </svg>
                  }
                />
                <ContactRow
                  label={t.yordam.telegramLabel}
                  value={CONTACTS.telegram}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 11 17-7-6 17-4-6-6-2 9-6" />
                    </svg>
                  }
                />
                <ContactRow
                  label={t.yordam.emailLabel}
                  value={CONTACTS.email}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  }
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
