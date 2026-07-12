"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import { SOHA_KEYS, PERSONA_KEYS, type SohaKey } from "@/lib/content";
import {
  Button,
  Card,
  Tag,
  Eyebrow,
  Art,
  type ArtVariant,
} from "@/components/ui";

const t = getMessages();

const SOHA_ART: Record<SohaKey, ArtVariant> = {
  bank: "azure",
  telekom: "mint",
  talim: "amber",
  mebel: "coral",
  kochmas: "violet",
  bozor: "azure",
  fmcg: "amber",
};

const FEATURE_KEYS = ["realVoice", "honestFeedback", "gamified"] as const;
const HOW_KEYS = ["step1", "step2", "step3"] as const;
const TAG_ROT = [-4, 3, -2, 5, -3, 2, -5, 4, -2];

function DemoLine({ role, text }: { role: "seller" | "client"; text: string }) {
  const isSeller = role === "seller";
  return (
    <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
          isSeller ? "bg-ink text-onink" : "inset text-foreground"
        }`}
      >
        <div
          className={`mb-1 font-mono text-[10px] uppercase tracking-wider ${
            isSeller ? "text-onink/60" : "text-muted"
          }`}
        >
          {isSeller ? t.trener.you : t.trener.client}
        </div>
        {text}
      </div>
    </div>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={t.nav.brand}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-onink">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4.5 5.5c0 8 6 14 14 14" />
                <path d="M14 3c3.9 0 7 3.1 7 7" />
                <path d="M14 7c1.7 0 3 1.3 3 3" />
              </svg>
            </span>
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] sm:text-sm sm:tracking-[0.14em]">
              {t.nav.brand}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/boshlash"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              {t.landing.navLogin}
            </Link>
            <Link
              href="/boshlash"
              className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-onink transition hover:opacity-90 sm:px-5"
            >
              {t.landing.navCta}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* ---------- HERO ---------- */}
        <section className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-between gap-8"
          >
            <div className="space-y-6">
              <Tag>{t.landing.heroBadge}</Tag>
              <h1 className="display text-6xl sm:text-7xl lg:text-[5.5rem]">
                {t.landing.heroTitle}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted">
                {t.landing.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/boshlash" variant="primary">
                {t.landing.ctaPrimary}
              </Button>
              <Button href="/reyting" variant="ghost">
                {t.landing.ctaSecondary}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          >
            <Card className="flex h-full flex-col gap-4">
              <Art
                variant="violet"
                className="flex items-end justify-between rounded-lg2 p-4"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/70">
                  {t.landing.heroReplayLabel}
                </span>
                <span className="flex items-end gap-[3px]" aria-hidden>
                  {[0.6, 1, 0.4, 0.85, 0.5].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-[3px] rounded-full bg-foreground/70"
                      style={{ height: 16, transformOrigin: "bottom" }}
                      animate={reduce ? { scaleY: h } : { scaleY: [h, 0.3, h] }}
                      transition={
                        reduce
                          ? undefined
                          : {
                              duration: 0.9,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.12,
                            }
                      }
                    />
                  ))}
                </span>
              </Art>
              <div className="flex flex-col gap-2.5">
                <DemoLine role="client" text={t.landing.demo.c1} />
                <DemoLine role="seller" text={t.landing.demo.s1} />
                <DemoLine role="client" text={t.landing.demo.c2} />
              </div>
            </Card>
          </motion.div>
        </section>

        {/* ---------- STATS ---------- */}
        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {t.landing.stats.map((s) => (
              <div
                key={s.label}
                className="card flex flex-col justify-between p-6"
              >
                <div className="text-5xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </div>
                <div className="mt-4 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="mt-24">
          <h2 className="display mb-8 text-4xl sm:text-5xl">
            {t.landing.featuresTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_KEYS.map((k) => (
              <Card key={k} className="flex h-full flex-col gap-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  {t.landing.features[k].title}
                </h3>
                <p className="leading-relaxed text-muted">
                  {t.landing.features[k].desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- SOHALAR ---------- */}
        <section className="mt-24">
          <Eyebrow>{t.landing.eyebrowSohalar}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {t.landing.sohalarTitle}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            {t.landing.sohalarLead}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOHA_KEYS.map((k, i) => (
              <Card key={k} className="flex h-full flex-col gap-4 p-4">
                <Art
                  variant={SOHA_ART[k]}
                  className="relative aspect-[4/3] rounded-lg2 p-4"
                >
                  <span className="font-mono text-xs text-foreground/70">
                    #{i + 1}
                  </span>
                </Art>
                <div className="px-2 pb-2">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {t.sohalar[k]}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">
                    {t.landing.sohaHint[k]}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- PERSONALAR ---------- */}
        <section className="mt-24">
          <Eyebrow>{t.landing.eyebrowPersonalar}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {t.landing.personalarTitle}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            {t.landing.personalarLead}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONA_KEYS.map((k, i) => (
              <Card key={k} className="flex h-full items-start gap-4">
                <span className="font-mono text-2xl font-semibold tabular-nums text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t.personalar[k]}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {t.landing.personaHint[k]}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- MOAT (nega biz) ---------- */}
        <section className="mt-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <Eyebrow>{t.landing.eyebrowMoat}</Eyebrow>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                {t.landing.moatTitle}
              </h2>
              <p className="mt-3 max-w-sm text-lg text-muted">
                {t.landing.moatLead}
              </p>
            </div>
            <div className="grid gap-3">
              {t.landing.moat.map((m) => (
                <Card key={m} className="flex items-start gap-3 py-5">
                  <span aria-hidden className="mt-0.5 text-[color:var(--good)]">
                    ✓
                  </span>
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {m}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CAPABILITIES (tag cloud) ---------- */}
        <section className="mt-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Eyebrow>{t.landing.eyebrowSkills}</Eyebrow>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                {t.landing.capabilitiesTitle}
              </h2>
              <p className="mt-3 max-w-sm text-lg text-muted">
                {t.landing.capabilitiesLead}
              </p>
            </div>
            <Card className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5 py-10">
              {t.landing.tags.map((tag, i) => (
                <Tag key={tag} rotate={TAG_ROT[i % TAG_ROT.length]}>
                  {tag}
                </Tag>
              ))}
            </Card>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="mt-24">
          <Eyebrow>{t.landing.eyebrowHow}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {t.landing.howTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {HOW_KEYS.map((k, i) => (
              <Card key={k} className="flex h-full flex-col gap-4">
                <div className="text-4xl font-semibold tabular-nums tracking-tight text-faint">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-lg leading-relaxed">{t.landing.how[k]}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- BIZ NIMA QILMAYMIZ (halol pozitsiya) ---------- */}
        <section className="mt-24">
          <Eyebrow>{t.landing.eyebrowHalollik}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {t.landing.notDoTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.landing.notDo.map((n) => (
              <Card key={n} className="flex items-start gap-3 py-5">
                <span aria-hidden className="mt-0.5 text-muted">
                  ✕
                </span>
                <p className="text-[15px] leading-relaxed text-foreground">
                  {n}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- BOTTOM CTA ---------- */}
        <section className="mt-24">
          <div className="ink flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
            <h2 className="display max-w-2xl text-4xl sm:text-6xl">
              {t.landing.ctaBottomTitle}
            </h2>
            <p className="max-w-md text-lg text-[color:var(--on-ink-muted)]">
              {t.landing.ctaBottomDesc}
            </p>
            <span className="rounded-full border border-[color:var(--on-ink)]/25 px-4 py-1.5 text-sm text-[color:var(--on-ink)]">
              {t.landing.trialLine}
            </span>
            <Link
              href="/boshlash"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--on-ink)] px-7 py-3 text-[15px] font-medium text-[color:var(--ink)] transition hover:opacity-90"
            >
              {t.landing.ctaPrimary}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
