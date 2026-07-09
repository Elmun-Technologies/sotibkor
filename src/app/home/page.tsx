"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button, Eyebrow } from "@/components/ui";
import { getUser, isRegistered, isOnboarded } from "@/lib/auth";
import { OBJECTION_LIBRARY } from "@/lib/objections";
import type { ObjectionType } from "@/lib/coach";
import type { PersonaKey } from "@/lib/content";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const [greet, setGreet] = useState(t.home.greetDay);
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/home");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/home");
      return;
    }
    setName(getUser()?.name ?? "");
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
  }, [router]);

  const obj = OBJECTION_LIBRARY[dayIdx % OBJECTION_LIBRARY.length];
  const quote = t.home.quotes[dayIdx % t.home.quotes.length];

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
        <div className="ink flex items-center gap-4 px-5 py-4">
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[color:var(--on-ink)]/25 text-2xl font-semibold tabular-nums">
            0
          </div>
          <div>
            <div className="text-sm font-semibold">{t.home.streakTitle}</div>
            <div className="text-xs text-[color:var(--on-ink-muted)]">
              {t.home.streakStart}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kun e'tirozi */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>⚡</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.objTitle}
            </h2>
          </div>
          <p className="text-lg font-medium">«{obj.text}»</p>
          <div className="inset p-4">
            <Eyebrow className="text-[color:var(--good)]">
              {t.home.objBest}
            </Eyebrow>
            <p className="mt-1.5 text-[15px] text-foreground">{obj.counter}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={trainHref(obj.type)}>
              <Button>{t.home.train}</Button>
            </Link>
            <Button variant="ghost">☆ {t.home.favorite}</Button>
          </div>
        </Card>

        {/* Kun fikri */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>💡</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.home.quoteTitle}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-foreground">{quote.t}</p>
          <div className="mt-auto flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-surface2 text-sm font-semibold">
              {quote.a.charAt(0)}
            </div>
            <span className="text-sm text-muted">{quote.a}</span>
          </div>
        </Card>

        {/* Mening qo'ng'iroqlarim */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
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
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
            <p className="text-sm text-muted">{t.home.callsEmpty}</p>
            <Link href="/dars">
              <Button variant="ghost">{t.home.startTraining}</Button>
            </Link>
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
          <Link href="/dars">
            <Button className="w-full sm:w-auto">
              {t.home.startTraining} →
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
