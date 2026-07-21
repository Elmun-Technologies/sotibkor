"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow, AppLoading } from "@/components/ui";
import { TrendChart, RadarChart } from "@/components/gamification";
import { useAuthGate } from "@/lib/useAuthGate";
import { getUser, type Role } from "@/lib/auth";
import {
  MOCK_USER,
  MOCK_SCORE_HISTORY,
  MOCK_SKILLS,
  MOCK_FUNNEL,
  MOCK_OBJECTION_STATS,
} from "@/lib/mock";
import { levelForXp, LEVELS } from "@/lib/levels";
import { FUNNEL_STAGES, OBJECTION_TYPES } from "@/lib/coach";
import type { TeamRow } from "@/lib/types";

const t = getMessages();

function scoreColor(pct: number): string {
  return pct >= 66 ? "var(--good)" : pct >= 40 ? "var(--warn)" : "var(--bad)";
}

/** Ushbu qatorda voronka bosqichlaridan eng past qamrovlisi (eng zaif). */
function weakestStage(row: TeamRow): (typeof FUNNEL_STAGES)[number] {
  return FUNNEL_STAGES.reduce((a, b) =>
    row.funnel[a] <= row.funnel[b] ? a : b,
  );
}

type RangeKey = "r7" | "r30" | "all";
const RANGE_COUNT: Record<RangeKey, number> = { r7: 7, r30: 30, all: Infinity };

const SKILL_KEYS = [
  "salomlashish",
  "ehtiyoj_aniqlash",
  "otkazlarga_ishlov",
  "closing",
  "ohang",
] as const;

export default function AnalitikaPage() {
  const ready = useAuthGate("/analitika");
  const [role, setRole] = useState<Role>("menejer");
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [range, setRange] = useState<RangeKey>("r30");

  useEffect(() => {
    if (ready) setRole(getUser()?.role ?? "menejer");
  }, [ready]);

  useEffect(() => {
    if (role !== "rop") return;
    fetch("/api/team-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { team?: TeamRow[] } | null) => {
        if (data?.team) setTeam(data.team);
      })
      .catch(() => {});
  }, [role]);

  const rankedTeam = useMemo(
    () => [...team].sort((a, b) => b.avg - a.avg),
    [team],
  );
  const teamAvg = useMemo(
    () =>
      team.length === 0
        ? 0
        : Math.round(team.reduce((s, m) => s + m.avg, 0) / team.length),
    [team],
  );

  // Sana oralig'i — trend va o'rtacha ballni tanlangan davr bo'yicha kesadi.
  const rangedHistory = useMemo(() => {
    const n = RANGE_COUNT[range];
    return n === Infinity ? MOCK_SCORE_HISTORY : MOCK_SCORE_HISTORY.slice(-n);
  }, [range]);

  const avgScore = useMemo(
    () =>
      rangedHistory.length === 0
        ? 0
        : Math.round(
            rangedHistory.reduce((s, v) => s + v, 0) / rangedHistory.length,
          ),
    [rangedHistory],
  );

  const radarAxes = useMemo(
    () =>
      SKILL_KEYS.map((k) => ({
        label: t.analitika.skills[k],
        value: MOCK_SKILLS[k],
      })),
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

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.analitika.title} lead={t.analitika.subtitle}>
      {role === "rop" && rankedTeam.length > 0 && (
        <Card className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              {t.analitika.teamTitle}
            </h2>
            <span className="text-sm text-muted">
              {t.analitika.teamAvgLabel}:{" "}
              <span
                className="font-semibold tabular-nums"
                style={{ color: scoreColor(teamAvg) }}
              >
                {teamAvg}
              </span>
            </span>
          </div>
          <div className="divide-y divide-hair">
            {rankedTeam.map((m, i) => (
              <div key={m.name} className="flex items-center gap-4 py-3">
                <span className="w-5 shrink-0 text-center font-mono text-sm text-faint">
                  {i + 1}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-semibold">
                  {m.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {m.name}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold tabular-nums"
                      style={{ color: scoreColor(m.avg) }}
                    >
                      {m.avg}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    <span>
                      {t.analitika.teamWeakStage}:{" "}
                      {t.analitika.funnelStages[weakestStage(m)]}
                    </span>
                    {m.weakObjection && (
                      <span>
                        {t.analitika.teamWeakObjection}:{" "}
                        {t.etirozlar.types[m.weakObjection]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sana oralig'i */}
      <div className="mb-6 flex gap-1 rounded-full border border-border p-1 w-fit">
        {(
          [
            ["r7", t.analitika.range7],
            ["r30", t.analitika.range30],
            ["all", t.analitika.rangeAll],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            aria-pressed={range === key}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              range === key
                ? "bg-ink text-onink"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ustki statistikalar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card flex flex-col gap-1 p-4 sm:p-7">
          <Eyebrow>{t.analitika.levelLabel}</Eyebrow>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums tracking-tight sm:text-4xl">
              {levelIndex}
            </span>
            <span className="text-sm text-faint sm:text-lg">
              / {LEVELS.length}
            </span>
          </div>
          <span className="text-xs text-muted sm:text-sm">
            {t.profil.daraja[level.current.key]}
          </span>
        </div>
        <div className="card flex flex-col gap-1 p-4 sm:p-7">
          <Eyebrow>{t.analitika.sessionsLabel}</Eyebrow>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-4xl">
            {MOCK_USER.sessionsCount}
          </div>
        </div>
        <div className="card flex flex-col gap-1 p-4 sm:p-7">
          <Eyebrow>{t.analitika.avgScoreLabel}</Eyebrow>
          <div
            className="mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-4xl"
            style={{ color: scoreColor(avgScore) }}
          >
            {avgScore}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Ball trendi */}
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.trendTitle}
          </h2>
          <TrendChart data={rangedHistory} />
        </Card>

        {/* Ko'nikma profili (radar) */}
        <Card className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {t.analitika.skillsTitle}
            </h2>
            <p className="text-sm text-muted">{t.analitika.skillsLead}</p>
          </div>
          <RadarChart axes={radarAxes} />
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
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.analitika.errorsTitle}
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-3">
            {t.analitika.errors.map((e) => (
              <li
                key={e}
                className="inset flex items-start gap-2.5 p-3.5 text-sm"
              >
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
          <Button href={`/etirozlar?focus=${weakestType}`}>
            {t.analitika.insightsCta} →
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
