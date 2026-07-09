"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow } from "@/components/ui";
import { isRegistered, isOnboarded } from "@/lib/auth";
import { OBJECTION_LIBRARY } from "@/lib/objections";
import { OBJECTION_TYPES, type ObjectionType } from "@/lib/coach";

const t = getMessages();

type StyleKey = keyof typeof t.etirozlar.styles;

/** Har e'tiroz turi uchun tavsiya etilgan javob uslubi. */
const STYLE_BY_TYPE: Record<ObjectionType, StyleKey> = {
  narx: "logika",
  ishonch: "ekspertlik",
  vaqt: "intriga",
  ehtiyoj: "intriga",
  qaror: "dojim",
  raqobat: "bosim",
};

const STYLE_COLOR: Record<StyleKey, string> = {
  logika: "var(--accent)",
  ekspertlik: "var(--good)",
  intriga: "var(--warn)",
  dojim: "var(--live)",
  bosim: "var(--live)",
  yumor: "var(--accent)",
};

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

function StyleTag({ style }: { style: StyleKey }) {
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

/** Juda soddalashtirilgan mock baholovchi (real LLM emas — demo). */
function mockEvaluate(answer: string): {
  score: number;
  style: StyleKey;
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

  const style: StyleKey = argues
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

export default function EtirozlarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<ObjectionType | "all">("all");

  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof mockEvaluate> | null>(
    null,
  );

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/etirozlar");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/etirozlar");
      return;
    }
    setReady(true);
  }, [router]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: OBJECTION_LIBRARY.length };
    for (const type of OBJECTION_TYPES)
      c[type] = OBJECTION_LIBRARY.filter((o) => o.type === type).length;
    return c;
  }, []);

  const list = useMemo(
    () =>
      filter === "all"
        ? OBJECTION_LIBRARY
        : OBJECTION_LIBRARY.filter((o) => o.type === filter),
    [filter],
  );

  const evaluate = () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    setResult(null);
    // Demo kechikish — real bosqichda scoring LLM chaqiriladi
    window.setTimeout(() => {
      setResult(mockEvaluate(answer));
      setEvaluating(false);
    }, 700);
  };

  if (!ready) return null;

  return (
    <PageShell title={t.etirozlar.title} lead={t.etirozlar.subtitle}>
      {/* Filtr */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={t.etirozlar.all}
          count={counts.all}
        />
        {OBJECTION_TYPES.map((type) => (
          <FilterChip
            key={type}
            active={filter === type}
            onClick={() => setFilter(type)}
            label={t.etirozlar.types[type]}
            count={counts[type]}
          />
        ))}
      </div>

      {/* E'tiroz kartalari */}
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((obj, i) => {
          const style = STYLE_BY_TYPE[obj.type];
          return (
            <Card key={`${obj.type}-${i}`} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Eyebrow>{t.etirozlar.types[obj.type]}</Eyebrow>
                  <p className="mt-1.5 text-lg font-medium leading-snug text-foreground">
                    «{obj.text}»
                  </p>
                </div>
                <StyleTag style={style} />
              </div>

              <div className="inset p-4">
                <Eyebrow className="text-[color:var(--good)]">
                  {t.etirozlar.bestLabel}
                </Eyebrow>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">
                  {obj.counter}
                </p>
              </div>

              <div className="mt-auto">
                <Link href={trainHref(obj.type)}>
                  <Button variant="ghost" className="w-full sm:w-auto">
                    ▶ {t.etirozlar.practice}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* O'z javobingni sina */}
      <div className="mt-10">
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
                    color:
                      result.score >= 70
                        ? "var(--good)"
                        : result.score >= 45
                          ? "var(--warn)"
                          : "var(--bad)",
                    backgroundColor: `color-mix(in srgb, ${
                      result.score >= 70
                        ? "var(--good)"
                        : result.score >= 45
                          ? "var(--warn)"
                          : "var(--bad)"
                    } 12%, transparent)`,
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
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-ink text-onink"
          : "border border-border text-muted hover:bg-foreground/[.04] hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`font-mono text-[11px] tabular-nums ${
          active ? "text-onink/70" : "text-faint"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
