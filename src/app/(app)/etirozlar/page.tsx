"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import {
  OBJECTION_LIBRARY,
  type ObjectionEntry,
  type AnswerStyle,
} from "@/lib/objections";
import { OBJECTION_TYPES, type ObjectionType } from "@/lib/coach";

const t = getMessages();

const STYLE_COLOR: Record<AnswerStyle, string> = {
  logika: "var(--accent)",
  ekspertlik: "var(--good)",
  intriga: "#38bdf8",
  dojim: "var(--warn)",
  bosim: "var(--bad)",
  yumor: "#a78bfa",
};

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

function trainHref(type: ObjectionType): string {
  const q = new URLSearchParams({
    soha: "mebel",
    persona:
      type === "narx" || type === "raqobat"
        ? "qimmatchi"
        : type === "ishonch"
          ? "shubhali"
          : type === "vaqt"
            ? "bandman"
            : "yumshoq-lekin-olmaydi",
    level: "3",
    rejim: "qongiroq",
    focus: type,
  });
  return `/trener?${q.toString()}`;
}

/** Juda soddalashtirilgan mock baholovchi (real LLM emas — demo). */
function mockEvaluate(answer: string): {
  score: number;
  style: AnswerStyle;
  feedback: string;
} {
  const s = answer.toLowerCase();
  const len = answer.trim().length;
  const acknowledges = /tushun|to'g'ri|haqli|albatta|roppa/.test(s);
  const reframes = /lekin|ammo|shuning|qiymat|foyda|natija|solishtir/.test(s);
  const nextStep = /keling|qadam|uchrash|sinab|ko'r|bugun|ertaga/.test(s);
  const argues = /noto'g'ri|unaqa emas|xato|siz bilmaysiz/.test(s);

  let score = 40;
  if (len > 40) score += 8;
  if (acknowledges) score += 16;
  if (reframes) score += 20;
  if (nextStep) score += 12;
  if (argues) score -= 18;
  score = Math.max(12, Math.min(96, score));

  const style: AnswerStyle = argues
    ? "bosim"
    : reframes
      ? "logika"
      : acknowledges
        ? "ekspertlik"
        : "intriga";

  const feedback =
    score >= 70
      ? t.etirozlar.feedbackStrong
      : score >= 45
        ? t.etirozlar.feedbackMid
        : t.etirozlar.feedbackWeak;

  return { score, style, feedback };
}

function scoreColor(score: number): string {
  return score >= 70
    ? "var(--good)"
    : score >= 45
      ? "var(--warn)"
      : "var(--bad)";
}

/* ---------------- Playbook (list + detail) ---------------- */

function PlaybookView() {
  const [filter, setFilter] = useState<ObjectionType | "all">("all");
  const [selectedId, setSelectedId] = useState(OBJECTION_LIBRARY[0].id);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof mockEvaluate> | null>(
    null,
  );

  const list = useMemo(
    () =>
      filter === "all"
        ? OBJECTION_LIBRARY
        : OBJECTION_LIBRARY.filter((o) => o.type === filter),
    [filter],
  );

  const selected: ObjectionEntry =
    list.find((o) => o.id === selectedId) ?? list[0] ?? OBJECTION_LIBRARY[0];

  const selectObjection = (id: string) => {
    setSelectedId(id);
    setAnswer("");
    setResult(null);
  };

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1400);
  };

  const evaluate = () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(mockEvaluate(answer));
      setEvaluating(false);
    }, 700);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Chap: ro'yxat */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={t.etirozlar.all}
          />
          {OBJECTION_TYPES.map((type) => (
            <FilterChip
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
              label={t.etirozlar.types[type]}
            />
          ))}
        </div>
        <Card className="flex max-h-[640px] flex-col gap-1 overflow-y-auto p-2">
          {list.map((o) => {
            const active = o.id === selected.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => selectObjection(o.id)}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-ink text-onink"
                    : "text-foreground hover:bg-foreground/[.05]"
                }`}
              >
                <span className="min-w-0 truncate font-medium">{o.text}</span>
                <span
                  className={`shrink-0 font-mono text-[11px] tabular-nums ${
                    active ? "text-onink/70" : "text-faint"
                  }`}
                >
                  {o.answers.length}
                </span>
              </button>
            );
          })}
        </Card>
      </div>

      {/* O'ng: tafsilot */}
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">{t.etirozlar.types[selected.type]}</div>
              <p className="mt-1.5 text-2xl font-semibold leading-snug tracking-tight text-foreground">
                «{selected.text}»
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-faint">
              {selected.answers.length} {t.etirozlar.answersCount}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {selected.answers.map((a, i) => {
              const favKey = `${selected.id}-${i}`;
              const isFav = favorites.has(favKey);
              return (
                <div
                  key={favKey}
                  className="flex flex-col gap-3 rounded-lg2 border border-border bg-surface2 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="font-mono text-sm tabular-nums text-faint">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] leading-relaxed text-foreground">
                        {a.text}
                      </p>
                      <div className="mt-2">
                        <StyleTag style={a.style} />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => toggleFav(favKey)}
                      aria-label={
                        isFav ? t.etirozlar.unfavBtn : t.etirozlar.favBtn
                      }
                      className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-150 active:scale-[0.9] hover:bg-foreground/[.06] ${
                        isFav ? "text-[color:var(--warn)]" : "text-faint"
                      }`}
                    >
                      {isFav ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(favKey, a.text)}
                      aria-label={t.etirozlar.copyBtn}
                      className="grid h-10 w-10 place-items-center rounded-full text-faint transition-all duration-150 active:scale-[0.9] hover:bg-foreground/[.06] hover:text-foreground"
                    >
                      {copiedKey === favKey ? "✓" : "⧉"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <Link href={trainHref(selected.type)}>
              <Button variant="ghost">▶ {t.etirozlar.practice}</Button>
            </Link>
          </div>
        </Card>

        {/* O'z javobingni sina */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>🧪</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.etirozlar.tryTitle}
            </h2>
          </div>
          <p className="text-sm text-muted">{t.etirozlar.tryLead}</p>
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setResult(null);
            }}
            rows={3}
            placeholder={t.etirozlar.tryPlaceholder}
            className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40"
          />
          <div className="flex items-center gap-3">
            <Button onClick={evaluate} disabled={evaluating || !answer.trim()}>
              {evaluating ? t.etirozlar.tryEvaluating : t.etirozlar.tryBtn}
            </Button>
            {result && (
              <button
                type="button"
                onClick={() => {
                  setAnswer("");
                  setResult(null);
                }}
                className="text-sm text-muted transition hover:text-foreground"
              >
                {t.etirozlar.tryAgain}
              </button>
            )}
          </div>

          {result && (
            <div className="grid gap-4 rounded-lg2 border border-border bg-surface2 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex items-center gap-4">
                <div
                  className="grid h-16 w-16 place-items-center rounded-full text-xl font-semibold tabular-nums"
                  style={{
                    color: scoreColor(result.score),
                    backgroundColor: `color-mix(in srgb, ${scoreColor(result.score)} 12%, transparent)`,
                  }}
                >
                  {result.score}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted">
                    {t.etirozlar.tryStyleLabel}
                  </div>
                  <div className="mt-1">
                    <StyleTag style={result.style} />
                  </div>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-foreground">
                {result.feedback}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
        active
          ? "bg-ink text-onink"
          : "border border-border text-muted hover:bg-foreground/[.04] hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/* ---------------- Tezkor mashq (drill) ---------------- */

type Difficulty = "past" | "orta" | "yuqori";

interface DrillRep {
  key: string;
  obj: ObjectionEntry;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function DrillView() {
  const [step, setStep] = useState<"setup" | "session" | "summary">("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("orta");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [queue, setQueue] = useState<DrillRep[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [current, setCurrent] = useState<ReturnType<
    typeof mockEvaluate
  > | null>(null);
  const [scores, setScores] = useState<
    { type: ObjectionType; score: number }[]
  >([]);

  const selectedCount = Object.values(counts).filter((c) => c > 0).length;
  const totalRounds = Object.values(counts).reduce((s, c) => s + c, 0);

  const toggle = (id: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      next[id] = next[id] > 0 ? 0 : 1;
      return next;
    });
  };

  const bump = (id: string, delta: number) => {
    setCounts((prev) => {
      const cur = prev[id] ?? 0;
      const nv = Math.max(0, Math.min(9, cur + delta));
      return { ...prev, [id]: nv };
    });
  };

  const start = () => {
    const reps: DrillRep[] = [];
    for (const o of OBJECTION_LIBRARY) {
      const n = counts[o.id] ?? 0;
      for (let i = 0; i < n; i++) reps.push({ key: `${o.id}-${i}`, obj: o });
    }
    setQueue(shuffled(reps));
    setIdx(0);
    setScores([]);
    setInput("");
    setCurrent(null);
    setStep("session");
  };

  const submit = () => {
    if (!input.trim()) return;
    const strict = difficulty === "yuqori" ? 8 : difficulty === "orta" ? 0 : -8;
    const base = mockEvaluate(input);
    const score = Math.max(10, Math.min(98, base.score - strict));
    setCurrent({ ...base, score });
    setScores((prev) => [...prev, { type: queue[idx].obj.type, score }]);
  };

  const next = () => {
    setInput("");
    setCurrent(null);
    if (idx + 1 >= queue.length) {
      setStep("summary");
    } else {
      setIdx((i) => i + 1);
    }
  };

  const restart = () => {
    setStep("setup");
    setCounts({});
  };

  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)
      : 0;

  const byType = useMemo(() => {
    const m = new Map<ObjectionType, number[]>();
    for (const r of scores) m.set(r.type, [...(m.get(r.type) ?? []), r.score]);
    const avgs: { type: ObjectionType; avg: number }[] = Array.from(
      m.entries(),
    ).map(([type, arr]) => ({
      type,
      avg: arr.reduce((s: number, x: number) => s + x, 0) / arr.length,
    }));
    avgs.sort((a, b) => b.avg - a.avg);
    return avgs;
  }, [scores]);

  if (step === "summary") {
    return (
      <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 py-12 text-center">
        <span className="text-3xl" aria-hidden>
          🏁
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t.etirozlar.drillDoneTitle}
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
        <p className="text-sm text-muted">{t.etirozlar.drillAvgScore}</p>

        {byType.length > 0 && (
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="inset p-4 text-left">
              <div className="eyebrow text-[color:var(--good)]">
                {t.etirozlar.drillStrongType}
              </div>
              <p className="mt-1.5 font-semibold text-foreground">
                {t.etirozlar.types[byType[0].type]}
              </p>
            </div>
            <div className="inset p-4 text-left">
              <div className="eyebrow text-[color:var(--bad)]">
                {t.etirozlar.drillWeakType}
              </div>
              <p className="mt-1.5 font-semibold text-foreground">
                {t.etirozlar.types[byType[byType.length - 1].type]}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={restart}>{t.etirozlar.drillRestart}</Button>
        </div>
      </Card>
    );
  }

  if (step === "session") {
    const rep = queue[idx];
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {t.etirozlar.drillProgress} {idx + 1} {t.etirozlar.drillOf}{" "}
            {queue.length}
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
            placeholder={t.etirozlar.drillYourAnswer}
            className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40 disabled:opacity-70"
          />
          {!current ? (
            <Button onClick={submit} disabled={!input.trim()}>
              {t.etirozlar.drillSubmit}
            </Button>
          ) : (
            <>
              <div className="grid gap-4 rounded-lg2 border border-border bg-surface2 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-full text-lg font-semibold tabular-nums"
                    style={{
                      color: scoreColor(current.score),
                      backgroundColor: `color-mix(in srgb, ${scoreColor(current.score)} 12%, transparent)`,
                    }}
                  >
                    {current.score}
                  </div>
                  <StyleTag style={current.style} />
                </div>
                <p className="text-[15px] leading-relaxed text-foreground">
                  {current.feedback}
                </p>
              </div>
              <Button onClick={next}>
                {idx + 1 >= queue.length
                  ? t.etirozlar.drillFinish
                  : t.etirozlar.drillNext}
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  // setup
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t.etirozlar.drillSetupTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t.etirozlar.drillSetupLead}
          </p>
        </div>
        <div>
          <div className="eyebrow mb-2">{t.etirozlar.drillDifficulty}</div>
          <div className="inline-flex gap-1 rounded-full bg-surface2 p-1">
            {(
              [
                ["past", t.etirozlar.drillDiffLow],
                ["orta", t.etirozlar.drillDiffMid],
                ["yuqori", t.etirozlar.drillDiffHigh],
              ] as [Difficulty, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDifficulty(k)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                  difficulty === k
                    ? "bg-ink text-onink"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

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
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
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
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => bump(o.id, -1)}
                  disabled={count === 0}
                  className="grid h-7 w-7 place-items-center rounded-full border border-border text-sm text-muted transition hover:text-foreground disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-4 text-center font-mono text-sm tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => bump(o.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-full border border-border text-sm text-muted transition hover:text-foreground"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </Card>

      <div className="sticky bottom-4 flex items-center gap-4 self-start rounded-full border border-border bg-surface px-5 py-3 shadow-lg">
        <span className="text-sm text-muted">
          <strong className="text-foreground">{selectedCount}</strong>{" "}
          {t.etirozlar.drillSelected} ·{" "}
          <strong className="text-foreground">{totalRounds}</strong>{" "}
          {t.etirozlar.drillRounds}
        </span>
        <Button onClick={start} disabled={totalRounds === 0}>
          {t.etirozlar.drillStart}
        </Button>
      </div>
      {totalRounds === 0 && (
        <p className="-mt-3 text-xs text-faint">{t.etirozlar.drillEmpty}</p>
      )}
    </div>
  );
}

/* ---------------- Sahifa ---------------- */

export default function EtirozlarPage() {
  const [tab, setTab] = useState<"playbook" | "drill">("playbook");

  const ready = useAuthGate("/etirozlar");

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.etirozlar.title} lead={t.etirozlar.subtitle}>
      <div className="mb-6 inline-flex gap-1 rounded-full bg-surface2 p-1">
        {(
          [
            ["playbook", t.etirozlar.tabPlaybook],
            ["drill", t.etirozlar.tabDrill],
          ] as const
        ).map(([k, label]) => (
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
            {label}
          </button>
        ))}
      </div>

      {tab === "playbook" ? <PlaybookView /> : <DrillView />}
    </PageShell>
  );
}
