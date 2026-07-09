"use client";

import { useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Chip } from "@/components/ui";
import { LeaderboardRow, AchievementCard } from "@/components/gamification";
import { ACHIEVEMENTS, MOCK_LEADERBOARD, MOCK_ACHIEVEMENTS } from "@/lib/mock";

const t = getMessages();

const XP_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.xp]));

type Tab = "leaderboard" | "achievements";

export default function ReytingPage() {
  const [tab, setTab] = useState<Tab>("leaderboard");
  const me = MOCK_LEADERBOARD.find((e) => e.isMe);

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
          {me && (
            <Card className="mb-4 flex items-center justify-between">
              <span className="eyebrow">{t.reyting.yourRank}</span>
              <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                #{me.rank}
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
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t.reyting.achievementsTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {t.reyting.achievementsSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_ACHIEVEMENTS.map((a, i) => (
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
      )}
    </PageShell>
  );
}
