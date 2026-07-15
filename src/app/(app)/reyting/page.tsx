"use client";

import { useEffect, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Chip, Button, PersonaAvatar } from "@/components/ui";
import { LeaderboardRow, AchievementCard } from "@/components/gamification";
import { ACHIEVEMENTS, MOCK_LEADERBOARD, MOCK_ACHIEVEMENTS } from "@/lib/mock";
import { weeklyChallenge, getChallengeBest } from "@/lib/challenge";
import { scenarioHref } from "@/lib/scenarios";

const t = getMessages();

const CHALLENGE = weeklyChallenge();
const CHALLENGE_HREF = `${scenarioHref(CHALLENGE)}&challenge=1`;

function scoreTone(v: number): string {
  return v >= 66 ? "var(--good)" : v >= 40 ? "var(--warn)" : "var(--bad)";
}

const XP_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.xp]));

// Manba (MOCK_*) modul darajasidagi statik konstanta — hech qachon
// o'zgarmaydi, shuning uchun bir marta shu yerda hisoblanadi (har render
// yoki useMemo dependency tekshiruvidan ham arzonroq).
const ME = MOCK_LEADERBOARD.find((e) => e.isMe);
const EARNED_COUNT = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
const ACHIEVEMENTS_PREVIEW = [...MOCK_ACHIEVEMENTS]
  .sort((a, b) => Number(b.earned) - Number(a.earned))
  .slice(0, 3);

type Tab = "leaderboard" | "achievements";

export default function ReytingPage() {
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(getChallengeBest());
  }, []);

  return (
    <PageShell title={t.reyting.title} lead={t.reyting.subtitle}>
      <div className="mb-6 flex gap-2">
        <Chip
          active={tab === "leaderboard"}
          onClick={() => setTab("leaderboard")}
        >
          {t.reyting.tabLeaderboard}
        </Chip>
        <Chip
          active={tab === "achievements"}
          onClick={() => setTab("achievements")}
        >
          {t.reyting.tabAchievements}
        </Chip>
      </div>

      {tab === "leaderboard" ? (
        <div>
          {/* Haftalik challenge (10x-5) — bu hafta hamma bir xil mijoz bilan kurashadi */}
          <Card className="mb-4 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span aria-hidden>🏆</span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {t.reyting.challengeTitle}
                  </h2>
                  <p className="text-sm text-muted">
                    {t.reyting.challengeLead}
                  </p>
                </div>
              </div>
            </div>
            <div className="inset flex items-center gap-3 p-3">
              <PersonaAvatar persona={CHALLENGE.persona} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight text-foreground">
                  {CHALLENGE.name}
                </p>
                <p className="text-xs text-muted">
                  {CHALLENGE.lavozim} · {t.sohalar[CHALLENGE.soha]} ·{" "}
                  {t.qongiroq.difficulty[CHALLENGE.difficulty]}
                </p>
              </div>
              {best != null && (
                <div className="text-right">
                  <div className="eyebrow">{t.reyting.challengeYourBest}</div>
                  <div
                    className="text-2xl font-semibold tabular-nums"
                    style={{ color: scoreTone(best) }}
                  >
                    {best}
                  </div>
                </div>
              )}
            </div>
            <Button href={CHALLENGE_HREF} className="w-full sm:w-auto">
              {best != null
                ? t.reyting.challengeRetry
                : t.reyting.challengeStart}{" "}
              →
            </Button>
          </Card>

          {ME && (
            <Card className="mb-4 flex items-center justify-between">
              <span className="eyebrow">{t.reyting.yourRank}</span>
              <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                #{ME.rank}
              </span>
            </Card>
          )}

          {MOCK_LEADERBOARD.length === 0 ? (
            <p className="text-sm text-muted">{t.reyting.empty}</p>
          ) : (
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((entry, i) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={i} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t.reyting.achievementsTitle}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {t.reyting.achievementsSubtitle}
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums text-muted">
              {EARNED_COUNT}/{MOCK_ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS_PREVIEW.map((a, i) => (
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
          <div className="mt-5">
            <Button href="/yutuqlar" variant="ghost">
              {t.yutuqlar.seeAllFromReyting} →
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
