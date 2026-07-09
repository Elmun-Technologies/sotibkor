"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow } from "@/components/ui";
import { TrendChart } from "@/components/gamification";
import { isRegistered, isOnboarded } from "@/lib/auth";
import {
  MOCK_USER,
  MOCK_SCORE_HISTORY,
  MOCK_FUNNEL,
  MOCK_OBJECTION_STATS,
} from "@/lib/mock";
import { levelForXp, LEVELS } from "@/lib/levels";
import { FUNNEL_STAGES, OBJECTION_TYPES } from "@/lib/coach";

const t = getMessages();

function scoreColor(pct: number): string {
  return pct >= 66 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--bad)";
}

export default function AnalitikaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/analitika");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/analitika");
      return;
    }
    setReady(true);
  }, [router]);

  const avgScore = useMemo(
    () =>
      Math.round(
        MOCK_SCORE_HISTORY.reduce((s, v) => s + v, 0) /
          MOCK_SCORE_HISTORY.length,
      ),
    [],
  );

  const level = levelForXp(MOCK_USER.xp);
  const levelIndex = LEVELS.findIndex((l) => l.key === level.current.key) + 1;

  const weakestType = useMemo(() => {
    const entries = OBJECTION_TYPES.map((type) => {
      const s = MOCK_OBJECTION_STATS[type];
      return { type, rate: s.resolved / s.met };
    });
    entries.sort((a, b) => a.rate - b.rate);
    return entries[0].type;
  }, []);

  if (!ready) return null;

  return (
    <PageShell title={t.analitika.title} lead={t.analitika.subtitle}>
      <div className="mb-6 text-sm text-muted">{t.analitika.period}</div>

      {/* Ustki statistikalar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.analitika.levelLabel}</Eyebrow>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tabular-nums tracking-tight">
              {levelIndex}
            </span>
            <span className="text-lg text-faint">/ {LEVELS.length}</span>
          </div>
          <span className="text-sm text-muted">
            {t.profil.daraja[level.current.key]}
          </span>
        </Card>
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.analitika.sessionsLabel}</Eyebrow>
          <div className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">
            {MOCK_USER.sessionsCount}
          </div>
        </Card>
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.analitika.avgScoreLabel}</Eyebrow>
          <div
            className="mt-1 text-4xl font-semibold tabular-nums tracking-tight"
            style={{ color: scoreColor(avgScore) }}
          >
            {avgScore}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Ball trendi */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.trendTitle}
          </h2>
          <TrendChart data={MOCK_SCORE_HISTORY} />
        </Card>

        {/* Voronka */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.funnelTitle}
          </h2>
          <div className="flex flex-col gap-3">
            {FUNNEL_STAGES.map((stage) => {
              const pct = MOCK_FUNNEL[stage];
              return (
                <div key={stage}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {t.analitika.funnelStages[stage]}
                    </span>
                    <span
                      className="font-mono text-xs tabular-nums"
                      style={{ color: scoreColor(pct) }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-foreground/[.08]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: scoreColor(pct),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* E'tirozlar statistikasi */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.objTitle}
          </h2>
          <div className="divide-y divide-hair">
            {OBJECTION_TYPES.map((type) => {
              const s = MOCK_OBJECTION_STATS[type];
              const rate = Math.round((s.resolved / s.met) * 100);
              return (
                <div
                  key={type}
                  className="flex items-center gap-4 py-2.5 text-sm"
                >
                  <span className="w-24 shrink-0 font-medium text-foreground">
                    {t.etirozlar.types[type]}
                  </span>
                  <span className="w-16 shrink-0 text-muted">
                    {s.met} {t.analitika.objMet.toLowerCase()}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[.08]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${rate}%`,
                        backgroundColor: scoreColor(rate),
                      }}
                    />
                  </div>
                  <span
                    className="w-10 shrink-0 text-right font-mono text-xs tabular-nums"
                    style={{ color: scoreColor(rate) }}
                  >
                    {rate}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Xatolar */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.errorsTitle}
          </h2>
          <ul className="flex flex-col gap-2.5">
            {t.analitika.errors.map((e) => (
              <li key={e} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-[color:var(--bad)]" aria-hidden>
                  ●
                </span>
                <span className="text-foreground">{e}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* AI xulosalari */}
      <Card className="mt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span aria-hidden>💡</span>
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.insightsTitle}
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {t.analitika.insights.map((ins) => (
            <li
              key={ins}
              className="inset p-4 text-sm leading-relaxed text-foreground"
            >
              {ins}
            </li>
          ))}
        </ul>
        <div>
          <Link href={`/etirozlar?focus=${weakestType}`}>
            <Button>{t.analitika.insightsCta} →</Button>
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
