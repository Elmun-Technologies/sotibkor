import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Stat } from "@/components/ui";
import {
  LevelBadge,
  StreakFlame,
  ProgressMap,
  AchievementCard,
  TrendChart,
  ActivityCalendar,
} from "@/components/gamification";
import {
  ACHIEVEMENTS,
  MOCK_USER,
  MOCK_ACHIEVEMENTS,
  MOCK_SCORE_HISTORY,
  MOCK_ACTIVE_DAYS,
  MOCK_DAILY,
  MOCK_LONGEST,
} from "@/lib/mock";

const t = getMessages();

const XP_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.xp]));

/** ISO 'YYYY-MM-DD' -> 'DD.MM.YYYY'. */
function formatDate(iso: string | null): string {
  if (!iso) return t.profil.never;
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
}

export default function ProfilPage() {
  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const preview = [...MOCK_ACHIEVEMENTS]
    .sort((a, b) => Number(b.earned) - Number(a.earned))
    .slice(0, 6);

  return (
    <PageShell title={t.profil.title} lead={t.profil.subtitle}>
      {/* Daraja + asosiy ko'rsatkichlar */}
      <Card className="mb-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
          <LevelBadge xp={MOCK_USER.xp} />

          <div className="grid w-full flex-1 grid-cols-2 gap-3">
            <Stat
              label={t.profil.xpTotal}
              value={MOCK_USER.xp.toLocaleString("ru-RU")}
            />
            <Stat
              label={t.profil.sessions}
              value={MOCK_USER.sessionsCount}
              hint={t.profil.sessionsUnit}
            />
            <div className="inset flex items-center p-5">
              <div className="w-full">
                <div className="eyebrow">{t.profil.streak}</div>
                <div className="mt-2">
                  <StreakFlame days={MOCK_USER.streakDays} />
                </div>
              </div>
            </div>
            <Stat
              label={t.profil.lastActive}
              value={
                <span className="text-base font-medium">
                  {formatDate(MOCK_USER.lastActive)}
                </span>
              }
            />
          </div>
        </div>
      </Card>

      {/* O'sish xaritasi */}
      <Card className="mb-6">
        <h2 className="mb-5 text-xl font-semibold tracking-tight text-foreground">
          {t.profil.progressTitle}
        </h2>
        <ProgressMap xp={MOCK_USER.xp} />
      </Card>

      {/* Ball dinamikasi (trend) */}
      <Card className="mb-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t.profil.trendTitle}
          </h2>
          <span className="text-sm text-muted">{t.profil.trendHint}</span>
        </div>
        <TrendChart data={MOCK_SCORE_HISTORY} />
      </Card>

      {/* Faollik kalendari + kunlik maqsad */}
      <Card className="mb-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t.profil.activityTitle}
          </h2>
          <span className="text-sm text-muted">
            {t.profil.longestStreak}: {MOCK_LONGEST.days} {t.profil.streakDays}{" "}
            · {MOCK_LONGEST.weeks} {t.profil.streakWeeks}
          </span>
        </div>
        <ActivityCalendar activeDays={MOCK_ACTIVE_DAYS} daily={MOCK_DAILY} />
      </Card>

      {/* Yutuqlar */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t.profil.achievementsTitle}
        </h2>
        <Link
          href="/yutuqlar"
          className="text-sm text-muted hover:text-foreground"
        >
          {earnedCount}/{totalCount} {t.profil.achievementsProgress} →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((a, i) => (
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
    </PageShell>
  );
}
