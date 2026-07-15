"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { getUser, type Role } from "@/lib/auth";
import {
  OBJECTION_TYPES,
  FUNNEL_STAGES,
  type ObjectionType,
} from "@/lib/coach";
import type { TeamRow } from "@/lib/types";
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

function weakestStage(row: TeamRow): (typeof FUNNEL_STAGES)[number] {
  return FUNNEL_STAGES.reduce((a, b) =>
    row.funnel[a] <= row.funnel[b] ? a : b,
  );
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

  const rankedTeam = useMemo(
    () => [...team].sort((a, b) => b.avg - a.avg),
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

  if (!ready) return <AppLoading />;

  if (role !== "rop") {
    return (
      <PageShell title={t.rop.title}>
        <Card className="py-12 text-center text-sm text-muted">
          {t.rop.onlyRop}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title={t.rop.title} lead={t.rop.subtitle}>
      {/* Vazifa tayinlash */}
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

      {/* Menejerlar progressi */}
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        {t.rop.progressTitle}
      </h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {team.map((m) => (
          <Card key={m.name} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-onink">
                {m.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold tracking-tight text-foreground">
                  {m.name}
                </div>
                <div className="text-xs text-muted">
                  {t.rop.weakLabel}:{" "}
                  {m.weakObjection ? t.etirozlar.types[m.weakObjection] : "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="inset p-2.5 text-center">
                <Eyebrow>{t.rop.avgLabel}</Eyebrow>
                <div
                  className="mt-0.5 text-xl font-semibold tabular-nums"
                  style={{ color: scoreColor(m.avg) }}
                >
                  {m.avg}
                </div>
              </div>
              <div className="inset p-2.5 text-center">
                <Eyebrow>{t.rop.streakLabel}</Eyebrow>
                <div className="mt-0.5 text-xl font-semibold tabular-nums">
                  {m.streakDays}
                  <span className="ml-0.5 text-[11px] font-normal text-muted">
                    {t.rop.streakUnit}
                  </span>
                </div>
              </div>
              <div className="inset p-2.5 text-center">
                <Eyebrow>{t.rop.doneLabel}</Eyebrow>
                <div className="mt-0.5 text-xl font-semibold tabular-nums">
                  {m.done}/{m.target}
                </div>
              </div>
            </div>
            {/* Voronka mini-barlari */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-muted">{t.rop.funnelLabel}</span>
                <span className="text-xs text-faint">
                  {t.analitika.funnelStages[weakestStage(m)]}
                </span>
              </div>
              <div className="flex items-end gap-1">
                {FUNNEL_STAGES.map((stage) => {
                  const pct = m.funnel[stage];
                  return (
                    <div
                      key={stage}
                      className="flex-1"
                      title={`${t.analitika.funnelStages[stage]}: ${pct}%`}
                    >
                      <div className="flex h-12 items-end overflow-hidden rounded bg-foreground/[.06]">
                        <div
                          className="w-full rounded"
                          style={{
                            height: `${pct}%`,
                            backgroundColor: scoreColor(pct),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

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
