"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, Eyebrow } from "@/components/ui";
import { isRegistered, isOnboarded } from "@/lib/auth";

const t = getMessages();

type PlanKey = "bepul" | "amaliyot" | "profi" | "solo";
const PLAN_ORDER: PlanKey[] = ["bepul", "amaliyot", "profi", "solo"];
const CURRENT_PLAN: PlanKey = "bepul";

export default function TariflarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/tariflar");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/tariflar");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <PageShell title={t.tariflar.title} lead={t.tariflar.subtitle}>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.tariflar.currentPlan}</Eyebrow>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            {t.tariflar.plans[CURRENT_PLAN].name}
          </div>
        </Card>
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.tariflar.callsUsed}</Eyebrow>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            0{" "}
            <span className="text-base font-normal text-faint">
              {t.tariflar.callsUnit}
            </span>
          </div>
        </Card>
        <Card className="flex flex-col gap-1">
          <Eyebrow>{t.tariflar.freeLeft}</Eyebrow>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[color:var(--good)]">
            5/5
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PLAN_ORDER.map((key) => {
          const plan = t.tariflar.plans[key];
          const isCurrent = key === CURRENT_PLAN;
          const isPopular = key === "amaliyot";
          return (
            <Card
              key={key}
              className={`flex flex-col gap-5 ${
                isPopular ? "border-2 border-[color:var(--good)]" : ""
              }`}
            >
              <div>
                {isCurrent ? (
                  <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
                    {t.tariflar.current}
                  </span>
                ) : isPopular ? (
                  <span className="inline-flex items-center rounded-full bg-[color:var(--good)]/15 px-2.5 py-1 text-[11px] font-medium text-[color:var(--good)]">
                    {t.tariflar.popular}
                  </span>
                ) : (
                  <span className="inline-block h-[22px]" aria-hidden />
                )}
                <div className="mt-2 text-sm text-muted">{plan.tagline}</div>
                <h3 className="text-xl font-semibold tracking-tight">
                  {plan.name}
                </h3>
              </div>

              <div>
                <span className="text-3xl font-semibold tabular-nums tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted">
                  {" "}
                  {t.tariflar.currency}
                  {key === "solo" ? t.tariflar.perMonth : ""}
                </span>
                {plan.calls && (
                  <p className="mt-1 text-xs text-faint">
                    {plan.calls} {t.tariflar.callsUnit} ·{" "}
                    {t.tariflar.notExpiring}
                  </p>
                )}
              </div>

              <ul className="flex flex-1 flex-col gap-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span
                      className="mt-0.5 text-[color:var(--good)]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? "ghost" : "primary"}
                disabled={isCurrent}
                className="w-full justify-center"
                onClick={() => setNotice(true)}
              >
                {isCurrent
                  ? t.tariflar.currentBtn
                  : key === "solo"
                    ? t.tariflar.connectBtn
                    : t.tariflar.selectBtn}
              </Button>
            </Card>
          );
        })}
      </div>

      {notice && (
        <p className="mt-6 text-center text-sm text-muted">
          {t.tariflar.comingSoon}
        </p>
      )}
    </PageShell>
  );
}
