"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { OBJECTION_LIBRARY } from "@/lib/objections";
import { evaluateAnswer } from "@/lib/objectionEval";
import { MOCK_OBJECTION_STATS } from "@/lib/mock";
import type { AnswerStyle } from "@/lib/objections";
import type { ObjectionType } from "@/lib/coach";
import {
  DRILL_DIFFICULTIES,
  DIFFICULTY_STRICTNESS,
  weakestObjectionType,
  recommendDrillCounts,
  buildQueue,
  getDrillHistory,
  saveDrillResult,
  type DrillDifficulty,
  type DrillRep,
  type DrillHistoryEntry,
} from "@/lib/drill";

const t = getMessages();

const STYLE_COLOR: Record<AnswerStyle, string> = {
  logika: "var(--accent)",
  ekspertlik: "var(--good)",
  intriga: "var(--info)",
  dojim: "var(--warn)",
  bosim: "var(--bad)",
  yumor: "var(--fun)",
};

const DIFF_LABEL: Record<DrillDifficulty, string> = {
  past: t.drill.diffLow,
  orta: t.drill.diffMid,
  yuqori: t.drill.diffHigh,
};

function scoreColor(score: number): string {
  return score >= 70
    ? "var(--good)"
    : score >= 45
      ? "var(--warn)"
      : "var(--bad)";
}

function StyleTag({ style }: { style: AnswerStyle }) {
  const color = STYLE_COLOR[style];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{
        color: `color-mix(in srgb, ${color} 88%, var(--foreground))`,
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {t.etirozlar.styles[style]}
    </span>
  );
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface EvalResult {
  score: number;
  style: AnswerStyle;
  strength: string;
  weakness: string;
}

function evaluate(answer: string, difficulty: DrillDifficulty): EvalResult {
  const r = evaluateAnswer(answer);
  const score = Math.max(
    10,
    Math.min(98, r.score - DIFFICULTY_STRICTNESS[difficulty]),
  );
  return {
    score,
    style: r.style,
    strength: t.etirozlar.eval.strength[r.strength],
    weakness: t.etirozlar.eval.weakness[r.weakness],
  };
}

export default function DrillPage() {
  const ready = useAuthGate("/drill");

  const [step, setStep] = useState<"setup" | "session" | "summary">("setup");
  const [difficulty, setDifficulty] = useState<DrillDifficulty>("orta");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [weakType, setWeakType] = useState<ObjectionType | null>(null);
  const [history, setHistory] = useState<DrillHistoryEntry[]>([]);

  const [queue, setQueue] = useState<DrillRep[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [current, setCurrent] = useState<EvalResult | null>(null);
  const [scores, setScores] = useState<
    { type: ObjectionType; score: number }[]
  >([]);

  // Spaced-repetition: avval real weakObjection (sessiyalardan), bo'lmasa
  // analitika statistikasidan eng zaif turni tavsiya qilamiz.
  useEffect(() => {
    if (!ready) return;
    setHistory(getDrillHistory());
    const fallback = weakestObjectionType(MOCK_OBJECTION_STATS);
    setWeakType(fallback);
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { weakObjection?: ObjectionType | null } | null) => {
        if (data?.weakObjection) setWeakType(data.weakObjection);
      })
      .catch(() => {});
  }, [ready]);

  const selectedCount = Object.values(counts).filter((c) => c > 0).length;
  const totalRounds = Object.values(counts).reduce((s, c) => s + c, 0);

  const toggle = (id: string) =>
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) > 0 ? 0 : 1 }));

  const bump = (id: string, delta: number) =>
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(9, (prev[id] ?? 0) + delta)),
    }));

  const applyRecommendation = () =>
    setCounts(recommendDrillCounts(weakType, 2));

  const clearSel = () => setCounts({});

  const start = () => {
    setQueue(shuffled(buildQueue(counts)));
    setIdx(0);
    setScores([]);
    setInput("");
    setCurrent(null);
    setStep("session");
  };

  const submit = () => {
    if (!input.trim()) return;
    const r = evaluate(input, difficulty);
    setCurrent(r);
    setScores((prev) => [
      ...prev,
      { type: queue[idx].obj.type, score: r.score },
    ]);
  };

  const next = () => {
    setInput("");
    setCurrent(null);
    if (idx + 1 >= queue.length) setStep("summary");
    else setIdx((i) => i + 1);
  };

  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)
      : 0;

  const byType = useMemo(() => {
    const m = new Map<ObjectionType, number[]>();
    for (const r of scores) m.set(r.type, [...(m.get(r.type) ?? []), r.score]);
    return Array.from(m.entries())
      .map(([type, arr]) => ({
        type,
        avg: arr.reduce((s, x) => s + x, 0) / arr.length,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [scores]);

  // Yakunda natijani tarixga bir marta saqlaymiz.
  useEffect(() => {
    if (step !== "summary" || scores.length === 0) return;
    const entry: DrillHistoryEntry = {
      at: new Date().toISOString(),
      avg,
      rounds: scores.length,
      difficulty,
      strongest: byType[0]?.type ?? null,
      weakest: byType[byType.length - 1]?.type ?? null,
    };
    setHistory(saveDrillResult(entry));
    // Faqat summary'ga birinchi kirganda — scores o'zgarmaydi bu bosqichda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const restart = () => {
    setStep("setup");
    setCounts({});
  };

  if (!ready) return <AppLoading />;

  /* ---------- summary ---------- */
  if (step === "summary") {
    return (
      <PageShell>
        <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 py-12 text-center">
          <span className="text-3xl" aria-hidden>
            🏁
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t.drill.doneTitle}
          </h2>
          <div
            className="grid h-24 w-24 place-items-center rounded-full text-3xl font-semibold tabular-nums"
            style={{
              color: scoreColor(avg),
              backgroundColor: `color-mix(in srgb, ${scoreColor(avg)} 12%, transparent)`,
            }}
          >
            {avg}
          </div>
          <p className="text-sm text-muted">{t.drill.avgScore}</p>
          {byType.length > 0 && (
            <div className="grid w-full gap-3 sm:grid-cols-2">
              <div className="inset p-4 text-left">
                <div className="eyebrow text-[color:var(--good)]">
                  {t.drill.strongType}
                </div>
                <p className="mt-1.5 font-semibold text-foreground">
                  {t.etirozlar.types[byType[0].type]}
                </p>
              </div>
              <div className="inset p-4 text-left">
                <div className="eyebrow text-[color:var(--bad)]">
                  {t.drill.weakType}
                </div>
                <p className="mt-1.5 font-semibold text-foreground">
                  {t.etirozlar.types[byType[byType.length - 1].type]}
                </p>
              </div>
            </div>
          )}
          <Button onClick={restart}>{t.drill.restart}</Button>
        </Card>
      </PageShell>
    );
  }

  /* ---------- session ---------- */
  if (step === "session") {
    const rep = queue[idx];
    return (
      <PageShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              {t.drill.progress} {idx + 1} {t.drill.of} {queue.length}
            </span>
            <span
              className="font-mono text-xs tabular-nums"
              style={{ color: "var(--accent)" }}
            >
              {t.etirozlar.types[rep.obj.type]}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[.08]">
            <div
              className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300"
              style={{
                width: `${((idx + (current ? 1 : 0)) / queue.length) * 100}%`,
              }}
            />
          </div>

          <Card className="flex flex-col gap-4">
            <div className="inset p-4">
              <p className="text-lg font-medium leading-relaxed text-foreground">
                «{rep.obj.text}»
              </p>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              disabled={!!current}
              placeholder={t.drill.yourAnswer}
              className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40 disabled:opacity-70"
            />
            {!current ? (
              <Button onClick={submit} disabled={!input.trim()}>
                {t.drill.submit}
              </Button>
            ) : (
              <>
                <div className="flex flex-col gap-3 rounded-lg2 border border-border bg-surface2 p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-semibold tabular-nums"
                      style={{
                        color: scoreColor(current.score),
                        backgroundColor: `color-mix(in srgb, ${scoreColor(current.score)} 12%, transparent)`,
                      }}
                    >
                      {current.score}
                    </div>
                    <StyleTag style={current.style} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg2 border border-[color:var(--good)]/30 bg-[color:var(--good)]/[.06] p-3">
                      <div className="text-[11px] uppercase tracking-wider text-[color:var(--good)]">
                        ✓ {t.drill.strengthLabel}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">
                        {current.strength}
                      </p>
                    </div>
                    <div className="rounded-lg2 border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/[.06] p-3">
                      <div className="text-[11px] uppercase tracking-wider text-[color:var(--warn)]">
                        ↑ {t.drill.weaknessLabel}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">
                        {current.weakness}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={next}>
                  {idx + 1 >= queue.length ? t.drill.finish : t.drill.next}
                </Button>
              </>
            )}
          </Card>
        </div>
      </PageShell>
    );
  }

  /* ---------- setup ---------- */
  return (
    <PageShell title={t.drill.title} lead={t.drill.subtitle}>
      {/* Spaced-repetition tavsiyasi */}
      {weakType && (
        <Card className="mb-4 flex flex-col gap-3 border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[.05] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span aria-hidden>🎯</span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                {t.drill.recommendTitle}
              </h2>
              <p className="text-sm text-muted">{t.drill.recommendLead}</p>
              <p className="mt-1 text-sm">
                <span className="text-muted">{t.drill.recommendType}: </span>
                <span className="font-semibold text-foreground">
                  {t.etirozlar.types[weakType]}
                </span>
              </p>
            </div>
          </div>
          <Button onClick={applyRecommendation} className="shrink-0">
            {t.drill.recommendApply}
          </Button>
        </Card>
      )}

      {/* Qiyinlik */}
      <Card className="mb-4 flex flex-col gap-3">
        <div className="eyebrow">{t.drill.difficulty}</div>
        <div className="inline-flex w-fit gap-1 rounded-full bg-surface2 p-1">
          {DRILL_DIFFICULTIES.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setDifficulty(k)}
              aria-pressed={difficulty === k}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                difficulty === k
                  ? "bg-ink text-onink"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {DIFF_LABEL[k]}
            </button>
          ))}
        </div>
      </Card>

      {/* E'tiroz tanlash */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted">
          <strong className="text-foreground">{selectedCount}</strong>{" "}
          {t.drill.selected} ·{" "}
          <strong className="text-foreground">{totalRounds}</strong>{" "}
          {t.drill.rounds}
        </span>
        <button
          type="button"
          onClick={clearSel}
          disabled={totalRounds === 0}
          className="text-sm text-muted transition hover:text-foreground disabled:opacity-40"
        >
          {t.drill.clearSel}
        </button>
      </div>

      <Card className="flex flex-col gap-1 p-2">
        {OBJECTION_LIBRARY.map((o) => {
          const count = counts[o.id] ?? 0;
          const checked = count > 0;
          return (
            <div
              key={o.id}
              className="flex items-center gap-3 border-t border-hair px-3 py-2.5 first:border-t-0"
            >
              <button
                type="button"
                onClick={() => toggle(o.id)}
                aria-pressed={checked}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-all duration-150 active:scale-[0.93] ${
                  checked
                    ? "border-ink bg-ink text-onink"
                    : "border-border text-transparent"
                }`}
              >
                ✓
              </button>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {o.text}
              </span>
              <span className="hidden shrink-0 sm:block">
                <StyleTagType type={o.type} />
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => bump(o.id, -1)}
                  disabled={count === 0}
                  aria-label={t.drill.decreaseBtn}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-sm text-muted transition-all duration-150 hover:text-foreground active:scale-[0.9] disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-4 text-center font-mono text-sm tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => bump(o.id, 1)}
                  aria-label={t.drill.increaseBtn}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-sm text-muted transition-all duration-150 hover:text-foreground active:scale-[0.9]"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      <div className="sticky bottom-4 mt-4 flex items-center gap-4 self-start rounded-full border border-border bg-surface px-5 py-3 shadow-[var(--shadow-card-hover)]">
        <Button onClick={start} disabled={totalRounds === 0}>
          {t.drill.start}
        </Button>
        {totalRounds === 0 && (
          <span className="text-xs text-faint">{t.drill.empty}</span>
        )}
      </div>

      {/* Tarix */}
      <div className="mt-10">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          {t.drill.historyTitle}
        </h2>
        {history.length === 0 ? (
          <Card className="py-8 text-center text-sm text-muted">
            {t.drill.historyEmpty}
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h, i) => (
              <Card
                key={`${h.at}-${i}`}
                className="flex items-center gap-4 py-3"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums"
                  style={{
                    color: scoreColor(h.avg),
                    backgroundColor: `color-mix(in srgb, ${scoreColor(h.avg)} 12%, transparent)`,
                  }}
                >
                  {h.avg}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                    <span className="font-medium text-foreground">
                      {new Date(h.at).toLocaleDateString("uz-UZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-muted">
                      {h.rounds} {t.drill.historyRounds}
                    </span>
                    <span className="text-faint">·</span>
                    <span className="text-muted">
                      {DIFF_LABEL[h.difficulty]}
                    </span>
                  </div>
                  {h.weakest && (
                    <div className="mt-0.5 text-xs text-muted">
                      {t.drill.weakType}: {t.etirozlar.types[h.weakest]}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

/** E'tiroz turini kichik teg sifatida (tanlov ro'yxatida). */
function StyleTagType({ type }: { type: ObjectionType }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
      {t.etirozlar.types[type]}
    </span>
  );
}
