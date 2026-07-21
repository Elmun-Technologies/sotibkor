"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button, Eyebrow, AppLoading } from "@/components/ui";
import { getUser, isOnboarded } from "@/lib/auth";
import { useAuthGate } from "@/lib/useAuthGate";
import { hasFinishedSession, getCompletedPlanDays } from "@/lib/progress";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { generateWeeklyPlan, type PlanDay } from "@/lib/weeklyPlan";
import { PersonaAvatar } from "@/components/ui";
import { OBJECTION_LIBRARY } from "@/lib/objections";
import type { ObjectionType } from "@/lib/coach";
import type { PersonaKey } from "@/lib/content";

/** Reja kuni uchun trener preset havolasi. */
function planHref(d: PlanDay): string {
  const q = new URLSearchParams({
    soha: d.soha,
    persona: d.persona,
    level: String(d.level),
    rejim: "qongiroq",
    focus: d.objection,
  });
  return `/trener?${q.toString()}`;
}

/** Yarim tundagacha qolgan vaqt (soat:daqiqa) — keyingi kun e'tirozi. */
function msToMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function fmtCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}s ${m}d`;
}

const t = getMessages();

const PERSONA_BY_TYPE: Record<ObjectionType, PersonaKey> = {
  narx: "qimmatchi",
  ishonch: "shubhali",
  vaqt: "bandman",
  ehtiyoj: "bandman",
  qaror: "yumshoq-lekin-olmaydi",
  raqobat: "qimmatchi",
};

function trainHref(type: ObjectionType): string {
  const q = new URLSearchParams({
    soha: "mebel",
    persona: PERSONA_BY_TYPE[type],
    level: "3",
    rejim: "qongiroq",
    focus: type,
  });
  return `/trener?${q.toString()}`;
}

export default function HomePage() {
  const ready = useAuthGate("/home");
  const [name, setName] = useState("");
  const [greet, setGreet] = useState(t.home.greetDay);
  const [dayIdx, setDayIdx] = useState(0);
  const [profileDone, setProfileDone] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [weakObjection, setWeakObjection] = useState<ObjectionType | null>(
    null,
  );
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [todayIndex, setTodayIndex] = useState(0);

  const obj = OBJECTION_LIBRARY[dayIdx % OBJECTION_LIBRARY.length];
  const quote = t.home.quotes[dayIdx % t.home.quotes.length];
  const plan = generateWeeklyPlan(weakObjection);

  useEffect(() => {
    if (!ready) return;
    setName(getUser()?.name ?? "");
    setProfileDone(isOnboarded());
    setSessionDone(hasFinishedSession());
    const now = new Date();
    const h = now.getHours();
    setGreet(
      h < 6
        ? t.home.greetNight
        : h < 12
          ? t.home.greetMorning
          : h < 18
            ? t.home.greetDay
            : t.home.greetEve,
    );
    setDayIdx(now.getDate());
    setTodayIndex((now.getDay() + 6) % 7); // dushanba=0
    setCompletedDays(getCompletedPlanDays());
    // Zaif e'tiroz (spaced-repetition) — reja shu bo'yicha markazlashadi.
    // Supabase yo'q bo'lsa route null qaytaradi (reja umumiy rejaga tushadi).
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { weakObjection?: ObjectionType | null } | null) => {
        if (data?.weakObjection) setWeakObjection(data.weakObjection);
      })
      .catch(() => {});
  }, [ready]);

  // Sevimli holatini shu kunning e'tirozi bo'yicha o'qiymiz.
  useEffect(() => {
    if (!ready) return;
    setIsFav(getFavorites().has(obj.id));
  }, [ready, obj.id]);

  // Keyingi kun e'tirozigacha countdown (har daqiqa yangilanadi).
  useEffect(() => {
    if (!ready) return;
    const tick = () => setCountdown(fmtCountdown(msToMidnight(new Date())));
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, [ready]);

  if (!ready) return <AppLoading />;

  const onToggleFav = () => setIsFav(toggleFavorite(obj.id).has(obj.id));

  // Boshlash checklisti — HAQIQIY lokal signallardan (hardcode emas):
  // ro'yxatdan o'tgan (bu sahifada = ha), profil to'ldirilgan, birinchi suhbat.
  const steps = [
    { label: t.home.checklistStep1, done: true },
    { label: t.home.checklistStep2, done: profileDone },
    { label: t.home.checklistStep3, done: sessionDone },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Salom + streak */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="display text-4xl sm:text-5xl">
            {greet}
            {name ? `, ${name}` : ""} 👋
          </h1>
          <p className="mt-3 text-lg text-muted">{t.home.subtitle}</p>
        </div>
        <Link
          href="/trener"
          className="ink flex items-center gap-4 px-5 py-4 transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[color:var(--on-ink)]/25 text-2xl font-semibold tabular-nums">
            0
          </div>
          <div>
            <div className="text-sm font-semibold">{t.home.streakTitle}</div>
            <div className="text-xs text-[color:var(--on-ink-muted)]">
              {t.home.streakStart} →
            </div>
          </div>
        </Link>
      </div>

      {/* Boshlash checklisti — barcha qadam bajarilgach yashiriladi */}
      {!allDone && (
        <Card className="mb-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>🚀</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.checklistTitle}
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-[15px]">
                <span
                  aria-hidden
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs"
                  style={{
                    background: s.done
                      ? "color-mix(in srgb, var(--good) 18%, transparent)"
                      : "var(--surface2)",
                    color: s.done ? "var(--good)" : "var(--muted)",
                  }}
                >
                  {s.done ? "✓" : ""}
                </span>
                <span
                  className={
                    s.done ? "text-muted line-through" : "text-foreground"
                  }
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {!profileDone ? (
              <Button href="/onboarding">{t.home.checklistProfileCta}</Button>
            ) : (
              <Button href="/dars">{t.home.checklistCta}</Button>
            )}
          </div>
        </Card>
      )}

      {/* Haftalik reja (10x-4) — zaif e'tirozga qarab tuzilgan 7 kunlik mashq */}
      <Card className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span aria-hidden>🗓️</span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.planTitle}
            </h2>
            <p className="text-sm text-muted">{t.home.planLead}</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {plan.map((d) => {
            const isToday = d.dayIndex === todayIndex;
            const done = completedDays.has(d.dayIndex);
            return (
              <Link
                key={d.dayIndex}
                href={planHref(d)}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition hover:border-foreground/30"
                style={{
                  borderColor: isToday
                    ? "color-mix(in srgb, var(--accent) 55%, transparent)"
                    : "var(--border)",
                  background: isToday
                    ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                    : "transparent",
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {t.home.weekdays[d.dayIndex]}
                </span>
                <span className="relative">
                  <PersonaAvatar persona={d.persona} size={30} />
                  {done && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full text-[8px]"
                      style={{ background: "var(--good)", color: "#fff" }}
                    >
                      ✓
                    </span>
                  )}
                </span>
                <span className="text-[10px] leading-tight text-foreground">
                  {t.etirozlar.types[d.objection]}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kun e'tirozi — kunlik asosiy mashq, shu sabab boshqalardan ajralib turadi */}
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base"
                style={{
                  background:
                    "color-mix(in srgb, var(--warn) 18%, transparent)",
                }}
              >
                ⚡
              </span>
              <h2 className="text-xl font-semibold tracking-tight">
                {t.home.objTitle}
              </h2>
            </div>
            {countdown && (
              <span className="font-mono text-xs tabular-nums text-muted">
                {t.home.objCountdown}: {countdown}
              </span>
            )}
          </div>
          <p className="text-lg font-medium">«{obj.text}»</p>
          <div className="inset p-4">
            <Eyebrow className="text-[color:var(--good)]">
              {t.home.objBest}
            </Eyebrow>
            <p className="mt-1.5 text-[15px] text-foreground">
              {obj.answers[0].text}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href={trainHref(obj.type)}>{t.home.train}</Button>
            <Button href="/etirozlar" variant="ghost">
              ↻ {t.home.repeat}
            </Button>
            <Button
              variant="ghost"
              onClick={onToggleFav}
              aria-pressed={isFav}
              style={
                isFav
                  ? {
                      borderColor:
                        "color-mix(in srgb, var(--warn) 45%, transparent)",
                      color: "var(--warn)",
                    }
                  : undefined
              }
            >
              {isFav ? "★" : "☆"} {isFav ? t.home.favorited : t.home.favorite}
            </Button>
          </div>
        </Card>

        {/* Kun fikri — ilhomlantiruvchi, lekin ikkinchi darajali (harakat talab qilmaydi) */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted">
            <span aria-hidden>💡</span>
            <h2 className="text-sm font-medium uppercase tracking-wide">
              {t.home.quoteTitle}
            </h2>
          </div>
          <p className="text-lg italic leading-relaxed text-foreground/80">
            “{quote.t}”
          </p>
          <div className="mt-auto flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-surface2 text-sm font-semibold">
              {quote.a.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {quote.a}
              </span>
              <span className="text-xs text-muted">{quote.s}</span>
            </div>
          </div>
        </Card>

        {/* Mening qo'ng'iroqlarim */}
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.callsTitle}
            </h2>
            <Link
              href="/reyting"
              className="text-sm text-muted hover:text-foreground"
            >
              {t.home.callsSeeAll} →
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-8 text-center">
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-full bg-surface2 text-lg"
            >
              🎙️
            </span>
            <p className="text-sm text-muted">{t.home.callsEmpty}</p>
            <Button href="/dars" variant="ghost">
              {t.home.startTraining}
            </Button>
          </div>
        </Card>

        {/* Bugun prokachat */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>🎯</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.levelUpTitle}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="inset p-4">
              <Eyebrow>{t.home.weakStage}</Eyebrow>
              <p className="mt-1.5 font-semibold text-foreground">
                {t.home.weakStageValue}
              </p>
            </div>
            <div className="inset p-4">
              <Eyebrow>{t.home.skills}</Eyebrow>
              <ul className="mt-1.5 space-y-1 text-sm text-foreground">
                {t.home.skillsList.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-[color:var(--accent)]">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button href="/dars" className="w-full sm:w-auto">
            {t.home.startTraining} →
          </Button>
        </Card>
      </div>
    </main>
  );
}
