"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Card, Button, Chip, AppLoading, Illustration } from "@/components/ui";
import {
  getUser,
  isOnboarded,
  saveProfile,
  syncFromSupabase,
} from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/config";
import { safeNext } from "@/lib/safeNext";

const t = getMessages();

function StepIcon({ kind }: { kind: "product" | "audience" }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  return kind === "product" ? (
    <svg {...common}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  ) : (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function nextUrl(): string {
  if (typeof window === "undefined") return "/home";
  return safeNext(new URLSearchParams(window.location.search).get("next"));
}

export default function OnboardingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("");
  const [usp, setUsp] = useState("");
  const [audience, setAudience] = useState("");
  const [spheres, setSpheres] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const decide = () => {
      if (!active) return;
      if (!getUser()) {
        router.replace("/boshlash");
        return;
      }
      if (isOnboarded()) {
        router.replace(nextUrl());
        return;
      }
      setReady(true);
    };
    if (getUser() || !hasSupabaseAuth()) decide();
    else void syncFromSupabase().finally(decide);
    return () => {
      active = false;
    };
  }, [router]);

  const toggle = (s: string) =>
    setSpheres((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const addCustom = () => {
    const c = custom.trim();
    if (!c) return;
    setCustomList((l) => [...l, c]);
    setSpheres((s) => [...s, c]);
    setCustom("");
  };

  const finish = () => {
    saveProfile({
      product: product.trim() || undefined,
      usp: usp.trim() || undefined,
      audience: audience.trim() || undefined,
      spheres,
      onboarded: true,
    });
    router.push(nextUrl());
  };

  const total = 2;

  if (!ready) return <AppLoading />;

  const variants = {
    enter: { opacity: 0, x: reduce ? 0 : 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -24 },
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Xush kelibsiz qismi */}
      <div className="mb-7 flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-onink">
          <Illustration name="spark" size={26} className="text-onink" />
        </span>
        <div>
          <h1 className="display text-3xl sm:text-4xl">
            {t.onboarding.welcomeTitle}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.onboarding.welcomeLead}</p>
        </div>
      </div>

      {/* Progress */}
      <div
        className="mb-8 flex gap-2"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${t.onboarding.step} ${step} / ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[.08]"
          >
            <motion.div
              className="h-full rounded-full bg-[color:var(--accent)]"
              initial={false}
              animate={{ width: i < step ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      <div className="eyebrow mb-3">
        {t.onboarding.step} {step} / {total}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
                  <StepIcon kind="product" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {t.onboarding.step1Title}
                  </h2>
                  <p className="text-sm text-muted">{t.onboarding.step1Lead}</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {t.onboarding.product}
                </span>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder={t.onboarding.productPh}
                  className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {t.onboarding.usp}
                </span>
                <textarea
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  rows={3}
                  placeholder={t.onboarding.uspPh}
                  className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {t.onboarding.audience}
                </span>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder={t.onboarding.audiencePh}
                  className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
                />
              </label>
            </Card>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStep(2)}>
                {t.onboarding.nextBtn} →
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
                  <StepIcon kind="audience" />
                </span>
                <div>
                  <h2 id="step2-title" className="text-xl font-semibold tracking-tight">
                    {t.onboarding.step2Title}
                  </h2>
                  <p className="text-sm text-muted">{t.onboarding.step2Lead}</p>
                </div>
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby="step2-title"
              >
                {[...t.onboarding.spheres, ...customList].map((s) => (
                  <Chip
                    key={s}
                    active={spheres.includes(s)}
                    onClick={() => toggle(s)}
                  >
                    {s}
                  </Chip>
                ))}
                <Chip
                  active={spheres.includes(t.onboarding.anyBusiness)}
                  onClick={() => toggle(t.onboarding.anyBusiness)}
                >
                  🌐 {t.onboarding.anyBusiness}
                </Chip>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  aria-label={t.onboarding.customPh}
                  placeholder={t.onboarding.customPh}
                  className="min-w-0 flex-1 rounded-full border border-border bg-surface2 px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40"
                />
                <Button variant="ghost" onClick={addCustom}>
                  {t.onboarding.addBtn}
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted">{t.onboarding.multiHint}</p>
            </Card>
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-muted underline-offset-2 transition hover:text-foreground hover:underline"
              >
                ← {t.onboarding.backBtn}
              </button>
              <Button onClick={finish}>{t.onboarding.finishBtn} →</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-center text-xs text-faint">
        {t.onboarding.step} {step} / {total} · {t.onboarding.welcomeTitle}
      </p>
    </main>
  );
}
