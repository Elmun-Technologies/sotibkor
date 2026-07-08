import { getMessages } from "@/i18n";
import { PageShell, Card, Stat } from "@/components/ui";
import {
  LevelBadge,
  StreakFlame,
  ProgressMap,
  AchievementCard,
} from "@/components/gamification";
import { ACHIEVEMENTS, MOCK_USER, MOCK_ACHIEVEMENTS } from "@/lib/mock";

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

  return (
    <PageShell title={t.profil.title}>
      <p className="-mt-3 mb-8 text-sm text-muted">{t.profil.subtitle}</p>

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
            <div className="surface flex items-center rounded-xl p-4">
              <div className="w-full">
                <div className="font-mono text-xs uppercase tracking-widest text-muted">
                  {t.profil.streak}
                </div>
                <div className="mt-1">
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
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          {t.profil.progressTitle}
        </h2>
        <ProgressMap xp={MOCK_USER.xp} />
      </Card>

      {/* Yutuqlar */}
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t.profil.achievementsTitle}
        </h2>
        <span className="font-mono text-xs tabular-nums text-muted">
          {earnedCount}/{totalCount} {t.profil.achievementsProgress}
        </span>
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
    </PageShell>
  );
}
