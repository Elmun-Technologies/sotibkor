"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMessages } from "@/i18n";
import { Card, Button, Chip, AppLoading } from "@/components/ui";
import {
  getUser,
  isOnboarded,
  saveProfile,
  syncFromSupabase,
} from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/config";

const t = getMessages();

function nextUrl(): string {
  if (typeof window === "undefined") return "/home";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/home";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("");
  const [usp, setUsp] = useState("");
  const [audience, setAudience] = useState("");
  const [spheres, setSpheres] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [customList, setCustomList] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Onboarding: registered bo'lishi shart, lekin ONBOARDED bo'lmasligi kerak.
  // Kesh bo'sh + Supabase yoqilgan bo'lsa — avval real sessiyani kutamiz
  // (Google bilan qaytgan foydalanuvchi yangi brauzerda qamalib qolmasin).
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[.08]"
          >
            <div
              className="h-full rounded-full bg-[color:var(--good)] transition-[width] duration-400"
              style={{ width: i < step ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="eyebrow mb-3">
        {t.onboarding.step} {step} / {total}
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <h1 className="display text-4xl sm:text-5xl">
              {t.onboarding.step1Title}
            </h1>
            <p className="mt-3 text-lg text-muted">{t.onboarding.step1Lead}</p>
          </div>
          <Card className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
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
              <span className="mb-1.5 block text-sm text-foreground">
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
              <span className="mb-1.5 block text-sm text-foreground">
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
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>{t.onboarding.nextBtn} →</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="display text-4xl sm:text-5xl">
              {t.onboarding.step2Title}
            </h1>
            <p className="mt-3 text-lg text-muted">{t.onboarding.step2Lead}</p>
          </div>
          <Card>
            <div className="flex flex-wrap gap-2">
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
                placeholder={t.onboarding.customPh}
                className="min-w-0 flex-1 rounded-full border border-border bg-surface2 px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
              <Button variant="ghost" onClick={addCustom}>
                {t.onboarding.addBtn}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted">{t.onboarding.multiHint}</p>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← {t.onboarding.backBtn}
            </Button>
            <Button onClick={finish}>{t.onboarding.finishBtn} →</Button>
          </div>
        </div>
      )}
    </main>
  );
}
