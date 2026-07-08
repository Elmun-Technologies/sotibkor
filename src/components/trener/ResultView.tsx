"use client";

import { motion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Card, ProgressBar, Badge, Button } from "@/components/ui";
import type { ScoreResult } from "@/lib/scoring";

const t = getMessages();

export interface ResultViewProps {
  score: ScoreResult;
  onAgain: () => void;
}

function verdict(total: number): {
  text: string;
  tone: "good" | "neon" | "warn";
} {
  if (total >= 80) return { text: t.natija.verdictHigh, tone: "good" };
  if (total >= 55) return { text: t.natija.verdictMid, tone: "neon" };
  return { text: t.natija.verdictLow, tone: "warn" };
}

export function ResultView({ score, onAgain }: ResultViewProps) {
  const v = verdict(score.total);
  const rows: [string, number, number][] = [
    [t.natija.salomlashish, score.breakdown.salomlashish, 10],
    [t.natija.ehtiyoj_aniqlash, score.breakdown.ehtiyoj_aniqlash, 20],
    [t.natija.otkazlarga_ishlov, score.breakdown.otkazlarga_ishlov, 30],
    [t.natija.closing, score.breakdown.closing, 20],
    [t.natija.ohang, score.breakdown.ohang, 20],
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="eyebrow">{t.natija.total}</div>
          <div className="flex items-end gap-2">
            <span className="text-8xl font-semibold tabular-nums tracking-tight">
              {score.total}
            </span>
            <span className="mb-3 text-lg text-muted">{t.natija.outOf}</span>
          </div>
          <Badge tone={v.tone}>{v.text}</Badge>
          <div className="mt-1 text-sm text-muted">
            {t.natija.xp}:{" "}
            <span className="text-[color:var(--good)]">
              +{score.xp_awarded}
            </span>
          </div>
        </Card>
      </motion.div>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {t.natija.breakdown}
        </h2>
        <Card className="space-y-3">
          {rows.map(([label, val, max]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-foreground/70">{label}</span>
                <span className="font-mono tabular-nums text-muted">
                  {val}/{max}
                </span>
              </div>
              <ProgressBar value={val} max={max} />
            </div>
          ))}
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {t.natija.mistakes}
        </h2>
        <div className="space-y-3">
          {score.mistakes.map((m, i) => (
            <Card key={i} className="space-y-1.5 text-sm">
              <p className="italic text-foreground/70">“{m.quote}”</p>
              <p className="text-[color:var(--warn)]">
                <span className="text-muted">{t.natija.why}: </span>
                {m.why}
              </p>
              <p className="text-[color:var(--good)]">
                <span className="text-muted">{t.natija.better}: </span>
                {m.better}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {t.natija.strengths}
        </h2>
        <Card>
          <ul className="space-y-1.5 text-sm text-[color:var(--good)]">
            {score.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-[color:var(--good)]">
                  ✓
                </span>
                <span className="text-foreground/80">{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Button onClick={onAgain} className="w-full">
        {t.natija.again}
      </Button>
    </div>
  );
}
