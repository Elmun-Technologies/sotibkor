"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/i18n";
import {
  PageShell,
  Card,
  Button,
  ProgressBar,
  AppLoading,
} from "@/components/ui";
import { getUser, type Role } from "@/lib/auth";
import { useAuthGate } from "@/lib/useAuthGate";
import {
  MOCK_ASSIGNMENTS_ACTIVE,
  MOCK_ASSIGNMENTS_DONE,
  MOCK_TEAM,
} from "@/lib/mock";
import { assignmentsForMember } from "@/lib/ropTasks";
import type { Assignment, TaskStatus } from "@/lib/types";

const t = getMessages();

function StatusDot({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { c: string; label: string }> = {
    new: { c: "var(--accent)", label: t.vazifalar.statusNew },
    progress: { c: "var(--warn)", label: t.vazifalar.statusProgress },
    done: { c: "var(--good)", label: t.vazifalar.statusDone },
  };
  const { c, label } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color: `color-mix(in srgb, ${c} 85%, var(--foreground))` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
      {label}
    </span>
  );
}

function TaskCard({ task }: { task: Assignment }) {
  const pct = Math.round((task.done / task.target) * 100);
  const isDone = task.status === "done";
  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold tracking-tight text-foreground">
            {task.title}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {t.vazifalar.assignedBy}: {task.by}
          </p>
        </div>
        <StatusDot status={task.status} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>
            {t.vazifalar.progress}: {task.done}/{task.target}{" "}
            {t.vazifalar.callsUnit}
          </span>
          <span className="font-mono tabular-nums">{pct}%</span>
        </div>
        <ProgressBar value={pct} max={100} />
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-hair pt-4">
        <span className="mr-auto text-xs text-muted">
          {isDone ? "✓" : `${t.vazifalar.due}: ${task.dueDays} kun`}
        </span>
        <Button
          href={`/trener?soha=mebel&persona=qimmatchi&level=3&rejim=qongiroq&focus=${task.focus}`}
          variant={isDone ? "ghost" : "primary"}
        >
          {isDone ? t.vazifalar.reviewBtn : t.vazifalar.startBtn}
        </Button>
      </div>
    </Card>
  );
}

export default function VazifalarPage() {
  const ready = useAuthGate("/vazifalar");
  const [role, setRole] = useState<Role>("menejer");
  const [tab, setTab] = useState<"active" | "done">("active");
  // ROP tomonidan menejerga tayinlangan vazifalar (ism bo'yicha).
  const [ropTasks, setRopTasks] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!ready) return;
    const u = getUser();
    setRole(u?.role ?? "menejer");
    const mine = assignmentsForMember(u?.name ?? "");
    setRopTasks(
      mine.map((a) => ({
        id: a.id,
        title: a.title,
        by: t.vazifalar.ropAssignedBy,
        target: a.target,
        done: 0,
        dueDays: 7,
        status: "new" as TaskStatus,
        focus: a.focus,
      })),
    );
  }, [ready]);

  const teamAvg = useMemo(
    () =>
      Math.round(MOCK_TEAM.reduce((s, m) => s + m.avg, 0) / MOCK_TEAM.length),
    [],
  );

  if (!ready) return <AppLoading />;

  // ---------- ROP ko'rinishi ----------
  if (role === "rop") {
    return (
      <PageShell title={t.vazifalar.title} lead={t.vazifalar.subtitleRop}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* ROP paneliga o'tish */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span aria-hidden>🎯</span>
              <h2 className="text-xl font-semibold tracking-tight">
                {t.vazifalar.ropCtaTitle}
              </h2>
            </div>
            <p className="text-sm text-muted">{t.vazifalar.ropCtaLead}</p>
            <div className="mt-auto">
              <Button href="/rop">{t.vazifalar.ropCtaBtn}</Button>
            </div>
          </Card>

          {/* Jamoa holati */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                {t.vazifalar.ropTeamTitle}
              </h2>
              <span className="text-sm text-muted">
                {t.vazifalar.teamAvg}:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {teamAvg}
                </span>
              </span>
            </div>
            <div className="divide-y divide-hair">
              {MOCK_TEAM.map((m) => {
                const pct = Math.round((m.done / m.target) * 100);
                return (
                  <div key={m.name} className="flex items-center gap-4 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-semibold">
                      {m.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {m.name}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-muted">
                          {m.done}/{m.target}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar value={pct} max={100} />
                      </div>
                    </div>
                    <span
                      className="w-10 text-right font-mono text-sm font-semibold tabular-nums"
                      style={{
                        color:
                          m.avg >= 75
                            ? "var(--good)"
                            : m.avg >= 65
                              ? "var(--warn)"
                              : "var(--bad)",
                      }}
                    >
                      {m.avg}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  // ---------- Menejer ko'rinishi ----------
  const list =
    tab === "active"
      ? [...ropTasks, ...MOCK_ASSIGNMENTS_ACTIVE]
      : MOCK_ASSIGNMENTS_DONE;

  return (
    <PageShell title={t.vazifalar.title} lead={t.vazifalar.subtitleMenejer}>
      <div className="mb-6 inline-flex gap-1 rounded-full bg-surface2 p-1">
        {(["active", "done"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
              tab === k
                ? "bg-ink text-onink"
                : "text-muted hover:text-foreground"
            }`}
          >
            {k === "active" ? t.vazifalar.tabActive : t.vazifalar.tabDone}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="text-3xl" aria-hidden>
            📋
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.vazifalar.emptyMenejerTitle}
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
              {t.vazifalar.emptyMenejerLead}
            </p>
          </div>
          <Button href="/qongiroq" variant="ghost">
            {t.vazifalar.emptyMenejerCta}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
