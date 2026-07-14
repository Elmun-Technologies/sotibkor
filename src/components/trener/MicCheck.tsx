"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Card, Button } from "@/components/ui";
import { useMicCheck } from "@/lib/useMicCheck";

const t = getMessages();

export interface MicCheckProps {
  onBack: () => void;
  onContinue: () => void;
  /** Server so'rovi (sessiya yaratish) kutilmoqda. */
  starting?: boolean;
}

const BARS = 20;

export function MicCheck({ onBack, onContinue, starting }: MicCheckProps) {
  const reduce = useReducedMotion();
  const { permission, level } = useMicCheck(true);
  const activeBars = Math.round((level / 100) * BARS);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="display text-5xl sm:text-6xl">{t.miccheck.title}</h1>
        <p className="max-w-xl text-base text-muted">{t.miccheck.subtitle}</p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10">
        {permission === "denied" && (
          <p
            role="alert"
            className="text-center text-sm text-[color:var(--bad)]"
          >
            {t.miccheck.denied}
          </p>
        )}
        {permission === "pending" && (
          <p className="text-center text-sm text-muted">{t.miccheck.waiting}</p>
        )}
        {permission === "granted" && (
          <p className="text-center text-sm text-[color:var(--good)]">
            {t.miccheck.granted}
          </p>
        )}

        <div
          className="flex h-24 w-full max-w-sm items-end justify-center gap-1"
          role="meter"
          aria-label={t.miccheck.meterLabel}
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {Array.from({ length: BARS }).map((_, i) => {
            const on = i < activeBars;
            return (
              <motion.span
                key={i}
                className="w-2 flex-1 rounded-full"
                style={{
                  background: on ? "var(--accent)" : "var(--foreground)",
                  opacity: on ? 1 : 0.1,
                }}
                animate={{ height: on ? `${30 + i * 3}%` : "12%" }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }
                }
              />
            );
          })}
        </div>

        <p className="text-center text-xs text-faint">{t.miccheck.hint}</p>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onContinue} disabled={starting}>
          {starting ? t.miccheck.starting : t.miccheck.continue}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          {t.miccheck.back}
        </button>
      </div>
      {permission === "denied" && (
        <p className="text-xs text-faint">{t.miccheck.deniedContinueHint}</p>
      )}
    </div>
  );
}
