import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, ProgressBar, Badge, Button } from "@/components/ui";
import {
  CURRICULUM,
  lessonProgress,
  isLessonUnlocked,
  curriculumStars,
  ALL_LESSONS,
  type Lesson,
} from "@/lib/curriculum";

const t = getMessages();
const U = t.dars.units as Record<string, { title: string; desc: string }>;
const L = t.dars.lessons as Record<string, { title: string; desc: string }>;

function lessonHref(l: Lesson): string {
  const q = new URLSearchParams({
    soha: l.soha,
    persona: l.persona,
    level: String(l.level),
    rejim: l.rejim,
  });
  if (l.focus) q.set("focus", l.focus);
  return `/trener?${q.toString()}`;
}

function Stars({ n, max }: { n: number; max: number }) {
  return (
    <span
      className="font-mono text-sm tabular-nums text-foreground"
      aria-label={`${n}/${max}`}
    >
      <span className="text-[color:var(--warn)]">{"★".repeat(n)}</span>
      <span className="text-foreground/20">
        {"★".repeat(Math.max(0, max - n))}
      </span>
    </span>
  );
}

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const p = lessonProgress(lesson.id);
  const unlocked = isLessonUnlocked(lesson.id);
  const meta = L[lesson.id] ?? { title: lesson.id, desc: "" };

  const cta =
    p.completion >= 100
      ? { label: t.dars.review, variant: "ghost" as const }
      : p.completion > 0
        ? { label: t.dars.resume, variant: "primary" as const }
        : { label: t.dars.start, variant: "primary" as const };

  return (
    <div className="flex flex-col gap-3 border-t border-hair py-4 first:border-t-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="font-mono text-sm tabular-nums text-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold tracking-tight text-foreground">
              {meta.title}
            </p>
            {lesson.focus && <Badge tone="muted">{lesson.focus}</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-muted">{meta.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-5 sm:w-[46%] sm:justify-end">
        <div className="w-28">
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>{p.completion}%</span>
            <Stars n={p.stars} max={p.maxStars} />
          </div>
          <ProgressBar value={p.completion} max={100} />
        </div>
        {unlocked ? (
          <Button
            href={lessonHref(lesson)}
            variant={cta.variant}
            className="shrink-0"
          >
            {cta.label}
          </Button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm text-faint">
            🔒 {t.dars.locked}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DarsPage() {
  const stars = curriculumStars();

  // "Sizning zaif joyingiz" — jarayondagi (0<comp<100) yoki keyingi ochiq dars
  const weak =
    ALL_LESSONS.find((l) => {
      const c = lessonProgress(l.id).completion;
      return c > 0 && c < 100;
    }) ?? ALL_LESSONS.find((l) => lessonProgress(l.id).completion === 0);

  return (
    <PageShell title={t.dars.title} lead={t.dars.subtitle}>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted">
          {stars.earned}/{stars.total} {t.dars.starsTotal}
        </span>
      </div>

      {weak && (
        <div className="ink mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-xl">
              🎯
            </span>
            <div>
              <div className="text-lg font-semibold">{t.dars.weakTitle}</div>
              <p className="mt-1 max-w-md text-sm text-[color:var(--on-ink-muted)]">
                {t.dars.weakLead}
              </p>
            </div>
          </div>
          <Link href={lessonHref(weak)} className="shrink-0">
            <span className="inline-flex items-center justify-center rounded-full bg-[color:var(--on-ink)] px-6 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:opacity-90">
              {t.dars.weakCta}
            </span>
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {CURRICULUM.map((unit) => {
          const u = U[unit.id] ?? { title: unit.id, desc: "" };
          return (
            <Card key={unit.id}>
              <div className="mb-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {u.title}
                </h2>
                <p className="mt-0.5 text-sm text-muted">{u.desc}</p>
              </div>
              <div>
                {unit.lessons.map((lesson) => {
                  const globalIndex = ALL_LESSONS.findIndex(
                    (l) => l.id === lesson.id,
                  );
                  return (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={globalIndex}
                    />
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
