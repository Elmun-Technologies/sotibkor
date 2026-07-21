"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import {
  OBJECTION_LIBRARY,
  type ObjectionEntry,
  type AnswerStyle,
} from "@/lib/objections";
import { evaluateAnswer } from "@/lib/objectionEval";
import { OBJECTION_TYPES, type ObjectionType } from "@/lib/coach";

const t = getMessages();

const STYLE_COLOR: Record<AnswerStyle, string> = {
  logika: "var(--accent)",
  ekspertlik: "var(--good)",
  intriga: "var(--info)",
  dojim: "var(--warn)",
  bosim: "var(--bad)",
  yumor: "var(--fun)",
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

/**
 * Baholovchi (src/lib/objectionEval.ts) — 6 uslubdan qaysi biriga tushishini
 * aniqlab, ball + kuchli/zaif tomonni beradi. `feedback` — drill oqimi uchun
 * qisqa umumiy izoh (ball asosida). Playbook "O'z javobingni sina" esa kuchli
 * va zaif tomonni alohida ko'rsatadi.
 */
function mockEvaluate(answer: string): {
  score: number;
  style: AnswerStyle;
  strength: string;
  weakness: string;
  feedback: string;
} {
  const r = evaluateAnswer(answer);
  const feedback =
    r.score >= 70
      ? t.etirozlar.feedbackStrong
      : r.score >= 45
        ? t.etirozlar.feedbackMid
        : t.etirozlar.feedbackWeak;
  return {
    score: r.score,
    style: r.style,
    strength: t.etirozlar.eval.strength[r.strength],
    weakness: t.etirozlar.eval.weakness[r.weakness],
    feedback,
  };
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

  // Sevimlilar localStorage'da saqlanadi — reload'da yo'qolmaydi (jonli).
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);
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
    setFavorites(new Set(toggleFavorite(id)));
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
        <select
          value={selected.id}
          onChange={(e) => selectObjection(e.target.value)}
          aria-label={t.etirozlar.selectAria}
          className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-foreground/40 lg:hidden"
        >
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.text} · {o.answers.length} {t.etirozlar.answersCount}
            </option>
          ))}
        </select>

        <Card className="hidden max-h-[640px] flex-col gap-1 overflow-y-auto p-2 lg:flex">
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
                      aria-pressed={isFav}
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
                    <span className="sr-only" role="status" aria-live="polite">
                      {copiedKey === favKey ? t.etirozlar.copied : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <Button href={trainHref(selected.type)} variant="ghost">
              ▶ {t.etirozlar.practice}
            </Button>
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
            <div className="flex flex-col gap-4 rounded-lg2 border border-border bg-surface2 p-5">
              <div className="flex items-center gap-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-semibold tabular-nums"
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg2 border border-[color:var(--good)]/30 bg-[color:var(--good)]/[.06] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-[color:var(--good)]">
                    ✓ {t.etirozlar.tryStrengthLabel}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {result.strength}
                  </p>
                </div>
                <div className="rounded-lg2 border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/[.06] p-3">
                  <div className="text-[11px] uppercase tracking-wider text-[color:var(--warn)]">
                    ↑ {t.etirozlar.tryWeaknessLabel}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {result.weakness}
                  </p>
                </div>
              </div>
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

/* ---------------- Sahifa ---------------- */

export default function EtirozlarPage() {
  const ready = useAuthGate("/etirozlar");

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.etirozlar.title} lead={t.etirozlar.subtitle}>
      <div className="mb-6 inline-flex gap-1 rounded-full bg-surface2 p-1">
        <span className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-onink">
          {t.etirozlar.tabPlaybook}
        </span>
        <Link
          href="/drill"
          className="rounded-full px-5 py-2 text-sm font-medium text-muted transition-all duration-150 hover:text-foreground active:scale-[0.97]"
        >
          {t.etirozlar.tabDrill} →
        </Link>
      </div>

      <PlaybookView />
    </PageShell>
  );
}
