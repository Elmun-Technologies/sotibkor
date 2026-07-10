"use client";

import { useMemo } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, AppLoading } from "@/components/ui";
import { AchievementCard } from "@/components/gamification";
import { useAuthGate } from "@/lib/useAuthGate";
import { ACHIEVEMENTS, MOCK_ACHIEVEMENTS } from "@/lib/mock";
import type { AchievementCategory } from "@/lib/types";

const t = getMessages();

const CATEGORY_ORDER: AchievementCategory[] = [
  "sovuq_qongiroq",
  "sifat",
  "progress",
  "intizom",
  "muzokaralar",
  "afsonaviy",
];

const XP_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.xp]));
const CATEGORY_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.category]));

export default function YutuqlarPage() {
  const ready = useAuthGate("/yutuqlar");

  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const earnedXp = MOCK_ACHIEVEMENTS.filter((a) => a.earned).reduce(
    (sum, a) => sum + (XP_BY_CODE.get(a.code) ?? 0),
    0,
  );

  const byCategory = useMemo(() => {
    const groups = new Map<AchievementCategory, typeof MOCK_ACHIEVEMENTS>();
    for (const a of MOCK_ACHIEVEMENTS) {
      const cat = CATEGORY_BY_CODE.get(a.code);
      if (!cat) continue;
      groups.set(cat, [...(groups.get(cat) ?? []), a]);
    }
    return groups;
  }, []);

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.yutuqlar.title} lead={t.yutuqlar.subtitle}>
      <Card className="mb-8 flex flex-wrap items-center gap-8">
        <div>
          <div className="text-4xl font-semibold tabular-nums tracking-tight">
            {earnedCount}
            <span className="text-lg text-faint"> / {totalCount}</span>
          </div>
          <div className="mt-1 text-sm text-muted">
            {t.yutuqlar.earnedLabel}
          </div>
        </div>
        <div className="h-10 w-px bg-hair" aria-hidden />
        <div>
          <div className="text-4xl font-semibold tabular-nums tracking-tight text-[color:var(--good)]">
            {earnedXp.toLocaleString("uz-UZ")}
          </div>
          <div className="mt-1 text-sm text-muted">{t.yutuqlar.xpLabel}</div>
        </div>
      </Card>

      <div className="flex flex-col gap-10">
        {CATEGORY_ORDER.map((cat) => {
          const items = byCategory.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
                {t.achievements.categories[cat]}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a, i) => (
                  <AchievementCard
                    key={a.code}
                    code={a.code}
                    earned={a.earned}
                    earnedAt={a.earnedAt}
                    xp={XP_BY_CODE.get(a.code) ?? 0}
                    index={i}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
