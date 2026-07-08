"use client";

import { motion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Card, ProgressBar, Badge, Button } from "@/components/ui";
import { TranscriptReview } from "./TranscriptReview";
import type { ScoreResult } from "@/lib/scoring";
import {
  recommend,
  interestSeries,
  FUNNEL_STAGES,
  type FunnelStage,
  type Turn,
} from "@/lib/coach";

const t = getMessages();

export interface ResultViewProps {
  score: ScoreResult;
  onAgain: () => void;
  transcript?: Turn[];
}

function verdict(total: number): {
  text: string;
  tone: "good" | "neon" | "warn";
} {
  if (total >= 80) return { text: t.natija.verdictHigh, tone: "good" };
  if (total >= 55) return { text: t.natija.verdictMid, tone: "neon" };
  return { text: t.natija.verdictLow, tone: "warn" };
}

export function ResultView({
  score,
  onAgain,
  transcript = [],
}: ResultViewProps) {
  const v = verdict(score.total);
  const b = score.breakdown;
  const rows: [string, number, number][] = [
    [t.natija.salomlashish, b.salomlashish, 10],
    [t.natija.ehtiyoj_aniqlash, b.ehtiyoj_aniqlash, 20],
    [t.natija.otkazlarga_ishlov, b.otkazlarga_ishlov, 30],
    [t.natija.closing, b.closing, 20],
    [t.natija.ohang, b.ohang, 20],
  ];

  const rec = recommend(transcript, b);
  const funnelRatio: Record<FunnelStage, number> = {
    kontakt: b.salomlashish / 10,
    ehtiyoj: b.ehtiyoj_aniqlash / 20,
    prezentatsiya: b.ohang / 20,
    etiroz: b.otkazlarga_ishlov / 30,
    yopish: b.closing / 20,
  };

  const series = interestSeries(transcript);
  const spark =
    series.length > 1
      ? series
          .map((p, i) => {
            const x = (i / (series.length - 1)) * 100;
            return `${x},${100 - Math.max(0, Math.min(100, p))}`;
          })
          .join(" ")
      : "";

  return (
    <div className="space-y-5">
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

      {/* Sotuv voronkasi */}
      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {t.natija.funnelTitle}
        </h2>
        <Card className="overflow-x-auto">
          <div className="flex min-w-[520px] items-end gap-2">
            {FUNNEL_STAGES.map((s) => {
              const pct = Math.round(funnelRatio[s] * 100);
              const weak = s === rec.weakestStage;
              return (
                <div
                  key={s}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-24 w-full items-end">
                    <div className="flex w-full flex-col items-center">
                      <span
                        className="mb-1 text-xs font-medium tabular-nums"
                        style={{ color: weak ? "var(--warn)" : "var(--muted)" }}
                      >
                        {pct}%
                      </span>
                      <div className="h-20 w-full overflow-hidden rounded-lg2 bg-foreground/[.06]">
                        <div
                          className="w-full rounded-lg2"
                          style={{
                            height: `${pct}%`,
                            marginTop: `${100 - pct}%`,
                            background: weak ? "var(--warn)" : "var(--ink)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-center text-xs ${weak ? "font-semibold text-foreground" : "text-muted"}`}
                  >
                    {t.natija.funnel[s]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Keyingi mashq tavsiyasi (spaced repetition) */}
      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
          {t.natija.recTitle}
        </h2>
        <div className="ink flex items-start gap-3 p-5">
          <span aria-hidden className="text-xl">
            🎯
          </span>
          <p className="text-[15px] leading-relaxed text-[color:var(--on-ink)]">
            {rec.message}
          </p>
        </div>
      </section>

      {/* Qiziqish dinamikasi */}
      {spark && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
            {t.natija.interestTitle}
          </h2>
          <Card>
            <div className="h-20 w-full">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden
              >
                <polyline
                  points={spark}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>
                {t.natija.interestStart}: {series[0]}
              </span>
              <span>
                {t.natija.interestEnd}: {series[series.length - 1]}
              </span>
            </div>
          </Card>
        </section>
      )}

      {transcript.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t.natija.reviewTitle}
            </h2>
            <span className="text-sm text-muted">{t.natija.reviewHint}</span>
          </div>
          <Card>
            <TranscriptReview transcript={transcript} />
          </Card>
        </section>
      )}

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
          <ul className="space-y-1.5 text-sm">
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
