"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { getUser, setUserRole, type Role } from "@/lib/auth";
import {
  OBJECTION_TYPES,
  FUNNEL_STAGES,
  type ObjectionType,
} from "@/lib/coach";
import type { TeamRow } from "@/lib/types";
import {
  teamAvgScore,
  teamProgress,
  teamFunnelAverage,
  teamWeakestStage,
  weakObjectionRanking,
  rankByScore,
  activityBucket,
} from "@/lib/team";
import {
  getRopAssignments,
  assignRopTask,
  removeRopAssignment,
  type RopAssignment,
} from "@/lib/ropTasks";

const t = getMessages();

function scoreColor(v: number): string {
  return v >= 66 ? "var(--good)" : v >= 40 ? "var(--warn)" : "var(--bad)";
}

/** Oxirgi faollik soatini i18n matniga aylantiradi (activityBucket sof yadrosi ustida). */
function activityLabel(hours: number): string {
  const b = activityBucket(hours);
  switch (b.key) {
    case "hozir":
      return t.rop.activeNow;
    case "soat":
      return t.rop.activeHours.replace("{n}", String(b.n));
    case "kecha":
      return t.rop.activeYesterday;
    case "kun":
      return t.rop.activeDays.replace("{n}", String(b.n));
  }
}

export default function RopPage() {
  const ready = useAuthGate("/rop");
  const [role, setRole] = useState<Role>("menejer");
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [assignments, setAssignments] = useState<RopAssignment[]>([]);

  // Forma holati
  const [member, setMember] = useState("");
  const [taskName, setTaskName] = useState("");
  const [focus, setFocus] = useState<ObjectionType>("narx");
  const [target, setTarget] = useState(5);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) setRole(getUser()?.role ?? "menejer");
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setAssignments(getRopAssignments());
    fetch("/api/team-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { team?: TeamRow[] } | null) => {
        if (data?.team) {
          setTeam(data.team);
          if (data.team[0]) setMember(data.team[0].name);
        }
      })
      .catch(() => {});
  }, [ready]);

  const rankedTeam = useMemo(() => rankByScore(team), [team]);
  const avgScore = useMemo(() => teamAvgScore(team), [team]);
  const progress = useMemo(() => teamProgress(team), [team]);
  const funnelAvg = useMemo(() => teamFunnelAverage(team), [team]);
  const weakestStage = useMemo(() => teamWeakestStage(team), [team]);
  const weakRanking = useMemo(() => weakObjectionRanking(team), [team]);
  const activeCount = useMemo(
    () => team.filter((m) => m.lastActiveHours < 24).length,
    [team],
  );

  const assign = () => {
    if (!member || !taskName.trim()) return;
    setAssignments(
      assignRopTask({
        member,
        title: taskName,
        focus,
        target,
        atIso: new Date().toISOString(),
      }),
    );
    setTaskName("");
  };

  const remove = (id: string) => setAssignments(removeRopAssignment(id));

  /** A'zolar ro'yxatidan tez tayinlash: shu a'zoni tanlab, formaga o'tadi. */
  const quickAssign = (name: string) => {
    setMember(name);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const switchRole = (r: Role) => {
    setUserRole(r);
    setRole(r);
  };

  if (!ready) return <AppLoading />;

  // ---------- Menejer ko'rinishi: rol ajratilgan, demo o'tish ----------
  if (role !== "rop") {
    return (
      <PageShell title={t.rop.title}>
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="text-3xl" aria-hidden>
            👔
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.rop.onlyRop}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
              {t.rop.onlyRopLead}
            </p>
          </div>
          <Button onClick={() => switchRole("rop")}>{t.rop.demoRopView}</Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title={t.rop.title} lead={t.rop.subtitle}>
      {/* Demo rol belgisi + menejerga qaytish */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface2 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
          {t.rop.demoBadge}
        </span>
        <button
          type="button"
          onClick={() => switchRole("menejer")}
          className="text-xs text-muted underline-offset-2 transition hover:text-foreground hover:underline"
        >
          {t.rop.demoBackMenejer}
        </button>
      </div>

      {/* Umumiy jamoa statistikasi */}
      <Card className="mb-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold tracking-tight">
          {t.rop.overallTitle}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="inset p-3 text-center">
            <Eyebrow>{t.rop.overallAvg}</Eyebrow>
            <div
              className="mt-0.5 text-2xl font-semibold tabular-nums"
              style={{ color: scoreColor(avgScore) }}
            >
              {avgScore}
            </div>
          </div>
          <div className="inset p-3 text-center">
            <Eyebrow>{t.rop.overallDone}</Eyebrow>
            <div className="mt-0.5 text-2xl font-semibold tabular-nums">
              {progress.done}
              <span className="text-base text-muted">/{progress.target}</span>
            </div>
          </div>
          <div className="inset p-3 text-center">
            <Eyebrow>{t.rop.overallActive}</Eyebrow>
            <div className="mt-0.5 text-2xl font-semibold tabular-nums">
              {activeCount}
              <span className="text-base text-muted">/{team.length}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* O'rtacha voronka */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t.rop.avgFunnelLabel}
              </span>
              {weakestStage && (
                <span className="text-xs text-[color:var(--warn)]">
                  {t.analitika.funnelStages[weakestStage]}
                </span>
              )}
            </div>
            <div className="flex items-end gap-1.5">
              {FUNNEL_STAGES.map((stage) => {
                const pct = funnelAvg[stage];
                return (
                  <div
                    key={stage}
                    className="flex-1"
                    title={`${t.analitika.funnelStages[stage]}: ${pct}%`}
                  >
                    <div className="flex h-20 items-end overflow-hidden rounded bg-foreground/[.06]">
                      <div
                        className="w-full rounded"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: scoreColor(pct),
                        }}
                      />
                    </div>
                    <div className="mt-1 text-center font-mono text-[10px] tabular-nums text-faint">
                      {pct}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eng zaif e'tiroz turlari */}
          <div>
            <div className="mb-2 text-sm font-medium text-foreground">
              {t.rop.weakRankingTitle}
            </div>
            {weakRanking.length === 0 ? (
              <p className="text-sm text-muted">{t.rop.weakRankingEmpty}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {weakRanking.map((w) => (
                  <div key={w.type} className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-sm text-foreground">
                      {t.etirozlar.types[w.type]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/[.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(w.count / Math.max(1, team.length)) * 100}%`,
                          backgroundColor: "var(--warn)",
                        }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-muted">
                      {w.count} {t.rop.weakRankingUnit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Vazifa tayinlash */}
      <div ref={formRef}>
        <Card className="mb-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {t.rop.assignTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.rop.assignMember}
              </span>
              <select
                value={member}
                onChange={(e) => setMember(e.target.value)}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition focus:border-foreground/40"
              >
                {team.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.rop.assignFocus}
              </span>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value as ObjectionType)}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition focus:border-foreground/40"
              >
                {OBJECTION_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {t.etirozlar.types[o]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.rop.assignTask}
              </span>
              <input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder={t.rop.assignTaskPh}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.rop.assignTarget}
              </span>
              <input
                type="number"
                min={1}
                max={50}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition focus:border-foreground/40"
              />
            </label>
          </div>
          <div>
            <Button onClick={assign} disabled={!member || !taskName.trim()}>
              {t.rop.assignBtn}
            </Button>
          </div>
        </Card>
      </div>

      {/* Tayinlangan vazifalar */}
      <Card className="mb-6 flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {t.rop.assignedTitle}
        </h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">{t.rop.assignedEmpty}</p>
        ) : (
          <div className="divide-y divide-hair">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-semibold">
                  {a.member[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {a.title}
                  </div>
                  <div className="text-xs text-muted">
                    {a.member} · {t.etirozlar.types[a.focus]} · {a.target}×
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="shrink-0 text-xs text-muted transition hover:text-[color:var(--bad)]"
                >
                  {t.rop.removeBtn}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Jamoa a'zolari ro'yxati */}
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        {t.rop.teamListTitle}
      </h2>
      <Card className="mb-6 p-0">
        {/* Desktop/tablet: jadval */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-hair text-left font-mono text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-medium">{t.rop.colName}</th>
                <th className="px-3 py-3 text-center font-medium">
                  {t.rop.colAvg}
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  {t.rop.colStreak}
                </th>
                <th className="px-3 py-3 font-medium">{t.rop.colActivity}</th>
                <th className="px-3 py-3 font-medium">{t.rop.colWeak}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {team.map((m) => (
                <tr key={m.name}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-onink">
                        {m.name[0]}
                      </span>
                      <span className="font-medium text-foreground">
                        {m.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className="font-mono font-semibold tabular-nums"
                      style={{ color: scoreColor(m.avg) }}
                    >
                      {m.avg}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono tabular-nums text-foreground">
                    {m.streakDays}
                    <span className="text-xs text-muted">
                      {" "}
                      {t.rop.streakUnit}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            m.lastActiveHours < 24
                              ? "var(--good)"
                              : "var(--faint)",
                        }}
                      />
                      {activityLabel(m.lastActiveHours)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted">
                    {m.weakObjection ? t.etirozlar.types[m.weakObjection] : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => quickAssign(m.name)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface2"
                    >
                      {t.rop.assignQuick}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil: karta-qatorlar (jadval kesilib qolmasligi uchun) */}
        <div className="divide-y divide-hair sm:hidden">
          {team.map((m) => (
            <div key={m.name} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-onink">
                    {m.name[0]}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {m.name}
                  </span>
                </div>
                <span
                  className="shrink-0 font-mono text-base font-semibold tabular-nums"
                  style={{ color: scoreColor(m.avg) }}
                >
                  {m.avg}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  {t.rop.colStreak}:{" "}
                  <span className="font-mono tabular-nums text-foreground">
                    {m.streakDays}
                  </span>
                  {t.rop.streakUnit}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        m.lastActiveHours < 24 ? "var(--good)" : "var(--faint)",
                    }}
                  />
                  {activityLabel(m.lastActiveHours)}
                </span>
                <span>
                  {t.rop.colWeak}:{" "}
                  {m.weakObjection ? t.etirozlar.types[m.weakObjection] : "—"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => quickAssign(m.name)}
                className="min-h-[44px] rounded-full border border-border px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface2 active:scale-[0.98]"
              >
                {t.rop.assignQuick}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Jamoa leaderboardi */}
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        {t.rop.leaderboardTitle}
      </h2>
      <Card className="divide-y divide-hair">
        {rankedTeam.map((m, i) => (
          <div key={m.name} className="flex items-center gap-4 py-3">
            <span
              className="w-6 shrink-0 text-center font-mono text-sm"
              style={{ color: i === 0 ? "var(--accent)" : "var(--faint)" }}
            >
              {i + 1}
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-semibold">
              {m.name[0]}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {m.name}
            </span>
            <span
              className="font-mono text-sm font-semibold tabular-nums"
              style={{ color: scoreColor(m.avg) }}
            >
              {m.avg}
            </span>
            <span className="hidden text-xs text-faint sm:inline">
              {t.rop.leaderAvg}
            </span>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}
