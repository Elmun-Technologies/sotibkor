"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Button, Card, Tag, Eyebrow, Art } from "@/components/ui";

const t = getMessages();

export default function BiznesPage() {
  const reduce = useReducedMotion();
  const b = t.biznes;
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
              href="/"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              {b.navBack}
            </Link>
            <Link
              href="/boshlash"
              className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-onink transition hover:opacity-90 sm:px-5"
            >
              {b.navCta}
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
              <Tag>{b.heroBadge}</Tag>
              <h1 className="display text-5xl sm:text-6xl lg:text-7xl">
                {b.heroTitle}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted">
                {b.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/boshlash" variant="primary">
                {b.heroCtaPrimary}
              </Button>
              <Button href="/rop" variant="ghost">
                {b.heroCtaSecondary}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          >
            {/* Jamoa progressi mini-preview (ROP panelidan ilhom) */}
            <Card className="flex h-full flex-col gap-4">
              <Art
                variant="mint"
                className="flex items-end justify-between rounded-lg2 p-4"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/70">
                  {b.heroPreviewLabel}
                </span>
                <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                  72
                </span>
              </Art>
              <div className="flex flex-1 flex-col justify-center divide-y divide-hair">
                {[
                  { n: "Dilnoza", v: 81 },
                  { n: "Aziz", v: 74 },
                  { n: "Nodira", v: 69 },
                  { n: "Sardor", v: 63 },
                ].map((m, i) => (
                  <div key={m.n} className="flex items-center gap-3 py-2.5">
                    <span className="w-4 text-center font-mono text-xs text-faint">
                      {i + 1}
                    </span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-semibold">
                      {m.n[0]}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {m.n}
                    </span>
                    <span
                      className="font-mono text-sm font-semibold tabular-nums"
                      style={{
                        color:
                          m.v >= 75
                            ? "var(--good)"
                            : m.v >= 65
                              ? "var(--warn)"
                              : "var(--bad)",
                      }}
                    >
                      {m.v}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>

        {/* ---------- STATS ---------- */}
        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {b.stats.map((s) => (
              <div
                key={s.label}
                className="card flex flex-col justify-between p-6"
              >
                <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-4 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- PROBLEM ---------- */}
        <section className="mt-24">
          <Eyebrow>{b.problemEyebrow}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {b.problemTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {b.problems.map((p) => (
              <Card key={p.title} className="flex items-start gap-3 py-5">
                <span aria-hidden className="mt-0.5 text-muted">
                  ✕
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">
                    {p.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- SOLUTION / FEATURES ---------- */}
        <section className="mt-24">
          <Eyebrow>{b.solutionEyebrow}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            {b.solutionTitle}
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">{b.solutionLead}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {b.features.map((f) => (
              <Card key={f.title} className="flex h-full flex-col gap-3">
                <h3 className="text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="leading-relaxed text-muted">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="mt-24">
          <Eyebrow>{b.howEyebrow}</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">{b.howTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {b.how.map((step, i) => (
              <Card key={i} className="flex h-full flex-col gap-4">
                <div className="text-4xl font-semibold tabular-nums tracking-tight text-faint">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-lg leading-relaxed">{step}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- ROI (nega ishlaydi) ---------- */}
        <section className="mt-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <Eyebrow>{b.roiEyebrow}</Eyebrow>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                {b.roiTitle}
              </h2>
            </div>
            <div className="grid gap-3">
              {b.roi.map((r) => (
                <Card key={r} className="flex items-start gap-3 py-5">
                  <span aria-hidden className="mt-0.5 text-[color:var(--good)]">
                    ✓
                  </span>
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {r}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- PRICING HINT ---------- */}
        <section className="mt-24">
          <Card className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>{b.pricingEyebrow}</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {b.pricingTitle}
              </h2>
              <p className="mt-2 max-w-md text-muted">{b.pricingLead}</p>
            </div>
            <Button href="/tariflar" variant="ghost">
              {b.pricingCta}
            </Button>
          </Card>
        </section>

        {/* ---------- BOTTOM CTA ---------- */}
        <section className="mt-24">
          <div className="ink flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
            <h2 className="display max-w-2xl text-4xl sm:text-6xl">
              {b.ctaTitle}
            </h2>
            <p className="max-w-md text-lg text-[color:var(--on-ink-muted)]">
              {b.ctaDesc}
            </p>
            <span className="rounded-full border border-[color:var(--on-ink)]/25 px-4 py-1.5 text-sm text-[color:var(--on-ink)]">
              {b.ctaNote}
            </span>
            <Link
              href="/boshlash"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--on-ink)] px-7 py-3 text-[15px] font-medium text-[color:var(--ink)] transition hover:opacity-90"
            >
              {b.ctaBtn}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
