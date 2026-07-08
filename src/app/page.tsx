"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { getMessages } from "@/i18n";
import { SOHA_KEYS, PERSONA_KEYS } from "@/lib/content";
import { Card, Badge } from "@/components/ui";

const t = getMessages();

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DemoLine({ role, text }: { role: "seller" | "client"; text: string }) {
  const isSeller = role === "seller";
  return (
    <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isSeller
            ? "border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/12 text-foreground"
            : "surface text-foreground/90"
        }`}
      >
        <div
          className={`mb-0.5 font-mono text-[10px] uppercase tracking-wider ${
            isSeller ? "text-[color:var(--neon)]" : "text-muted"
          }`}
        >
          {isSeller ? t.trener.you : t.trener.client}
        </div>
        {text}
      </div>
    </div>
  );
}

const FEATURE_KEYS = ["realVoice", "honestFeedback", "gamified"] as const;
const HOW_KEYS = ["step1", "step2", "step3"] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ---------- HERO ---------- */}
      <section className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <div className="space-y-5">
            <Badge tone="neon">{t.landing.heroBadge}</Badge>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] sm:text-5xl">
              <span className="neon-text">{t.landing.heroTitle}</span>
            </h1>
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted">
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/trener"
                className="neon-glow rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[color:var(--neon)]/20"
              >
                {t.landing.ctaPrimary}
              </Link>
              <Link
                href="/reyting"
                className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/5"
              >
                {t.landing.ctaSecondary}
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <Card className="neon-glow space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {t.landing.heroReplayLabel}
              </span>
              <span className="flex items-end gap-[3px]" aria-hidden>
                {[0.6, 1, 0.4, 0.85, 0.5].map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-[color:var(--neon)]"
                    style={{ height: 14 }}
                    animate={{ scaleY: [h, 0.3, h] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </span>
            </div>
            <DemoLine role="client" text={t.landing.demo.c1} />
            <DemoLine role="seller" text={t.landing.demo.s1} />
            <DemoLine role="client" text={t.landing.demo.c2} />
          </Card>
        </Reveal>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="mt-20">
        <Reveal>
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
            {t.landing.featuresTitle}
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURE_KEYS.map((k, i) => (
            <Reveal key={k} delay={i * 0.08}>
              <Card className="h-full space-y-2">
                <h3 className="font-semibold text-foreground">
                  {t.landing.features[k].title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {t.landing.features[k].desc}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- SOHALAR ---------- */}
      <section className="mt-20">
        <Reveal>
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t.landing.sohalarTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.landing.sohalarLead}</p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOHA_KEYS.map((k, i) => (
            <Reveal key={k} delay={i * 0.06}>
              <Card className="h-full space-y-1.5">
                <h3 className="font-semibold text-foreground">
                  {t.sohalar[k]}
                </h3>
                <p className="text-sm text-muted">{t.landing.sohaHint[k]}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- PERSONALAR ---------- */}
      <section className="mt-20">
        <Reveal>
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t.landing.personalarTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{t.landing.personalarLead}</p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONA_KEYS.map((k, i) => (
            <Reveal key={k} delay={i * 0.06}>
              <Card className="flex h-full items-start gap-3">
                <span className="mt-0.5">
                  <Badge tone="neon">{String(i + 1).padStart(2, "0")}</Badge>
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    {t.personalar[k]}
                  </h3>
                  <p className="text-sm text-muted">
                    {t.landing.personaHint[k]}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mt-20">
        <Reveal>
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
            {t.landing.howTitle}
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_KEYS.map((k, i) => (
            <Reveal key={k} delay={i * 0.08}>
              <Card className="h-full space-y-2">
                <div className="neon-text font-mono text-2xl font-bold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {t.landing.how[k]}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- BOTTOM CTA ---------- */}
      <section className="mt-20">
        <Reveal>
          <Card className="neon-glow flex flex-col items-center gap-4 py-10 text-center">
            <h2 className="text-balance text-2xl font-bold sm:text-3xl">
              {t.landing.ctaBottomTitle}
            </h2>
            <p className="max-w-md text-sm text-muted">
              {t.landing.ctaBottomDesc}
            </p>
            <Link
              href="/trener"
              className="neon-glow rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-7 py-3 text-sm font-semibold text-foreground transition hover:bg-[color:var(--neon)]/20"
            >
              {t.landing.ctaPrimary}
            </Link>
          </Card>
        </Reveal>
      </section>
    </main>
  );
}
