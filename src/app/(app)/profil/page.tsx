"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Stat, Chip, Button } from "@/components/ui";
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
import {
  isRegistered,
  isOnboarded,
  getProfile,
  saveProfile,
  type Profile,
} from "@/lib/auth";

const t = getMessages();

const XP_BY_CODE = new Map(ACHIEVEMENTS.map((a) => [a.code, a.xp]));

/** ISO 'YYYY-MM-DD' -> 'DD.MM.YYYY'. */
function formatDate(iso: string | null): string {
  if (!iso) return t.profil.never;
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
}

function ProductSettingsCard() {
  const [product, setProduct] = useState("");
  const [usp, setUsp] = useState("");
  const [audience, setAudience] = useState("");
  const [spheres, setSpheres] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProduct(p.product ?? "");
      setUsp(p.usp ?? "");
      setAudience(p.audience ?? "");
      setSpheres(p.spheres ?? []);
    }
  }, []);

  const toggle = (s: string) =>
    setSpheres((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const addCustom = () => {
    const c = custom.trim();
    if (!c) return;
    setSpheres((s) => [...s, c]);
    setCustom("");
  };

  const save = () => {
    const prev: Profile = getProfile() ?? { spheres: [], onboarded: true };
    saveProfile({
      ...prev,
      product: product.trim() || undefined,
      usp: usp.trim() || undefined,
      audience: audience.trim() || undefined,
      spheres,
      onboarded: true,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Card className="mb-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {t.profil.productTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.profil.productLead}</p>
      </div>

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
          rows={2}
          placeholder={t.onboarding.uspPh}
          className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40"
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

      <div>
        <span className="mb-2 block text-sm text-foreground">
          {t.onboarding.step2Title}
        </span>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set([...t.onboarding.spheres, ...spheres])).map(
            (s) => (
              <Chip
                key={s}
                active={spheres.includes(s)}
                onClick={() => toggle(s)}
              >
                {s}
              </Chip>
            ),
          )}
        </div>
        <div className="mt-3 flex gap-2">
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
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save}>{t.profil.saveBtn}</Button>
        {saved && (
          <span className="text-sm text-[color:var(--good)]">
            ✓ {t.profil.savedMsg}
          </span>
        )}
      </div>
    </Card>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/profil");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/profil");
      return;
    }
    setReady(true);
  }, [router]);

  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const preview = [...MOCK_ACHIEVEMENTS]
    .sort((a, b) => Number(b.earned) - Number(a.earned))
    .slice(0, 6);

  if (!ready) return null;

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

      {/* Mahsulot ma'lumotlari (tahrirlanadigan) */}
      <ProductSettingsCard />

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
