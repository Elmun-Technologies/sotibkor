"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import {
  SCENARIOS,
  DIFFICULTIES,
  scenarioHref,
  type Difficulty,
} from "@/lib/scenarios";
import {
  SOHA_KEYS,
  PERSONA_KEYS,
  type SohaKey,
  type PersonaKey,
} from "@/lib/content";

const t = getMessages();

const DIFF_COLOR: Record<Difficulty, string> = {
  oson: "var(--good)",
  orta: "var(--warn)",
  qiyin: "var(--live)",
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return (p[0]?.[0] ?? "?").toUpperCase();
}

function DiffBadge({ d }: { d: Difficulty }) {
  const c = DIFF_COLOR[d];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        color: `color-mix(in srgb, ${c} 85%, var(--foreground))`,
        backgroundColor: `color-mix(in srgb, ${c} 10%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c }}
      />
      {t.qongiroq.difficulty[d]}
    </span>
  );
}

interface CustomClient {
  id: string;
  name: string;
  company: string;
  soha: SohaKey;
  persona: PersonaKey;
  desc: string;
}

function customHref(c: CustomClient): string {
  const q = new URLSearchParams({
    soha: c.soha,
    persona: c.persona,
    level: "3",
    rejim: "qongiroq",
  });
  return `/trener?${q.toString()}`;
}

export default function QongiroqPage() {
  const [soha, setSoha] = useState<SohaKey | "all">("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [customSoha, setCustomSoha] = useState<SohaKey>(SOHA_KEYS[0]);
  const [customPersona, setCustomPersona] = useState<PersonaKey>(
    PERSONA_KEYS[0],
  );
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState<CustomClient[]>([]);

  const ready = useAuthGate("/qongiroq");

  const list = useMemo(
    () =>
      SCENARIOS.filter(
        (s) =>
          (soha === "all" || s.soha === soha) &&
          (diff === "all" || s.difficulty === diff),
      ),
    [soha, diff],
  );

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.qongiroq.title} lead={t.qongiroq.subtitle}>
      {/* Filtrlar */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Pill active={soha === "all"} onClick={() => setSoha("all")}>
            {t.qongiroq.allSoha}
          </Pill>
          {SOHA_KEYS.map((k) => (
            <Pill key={k} active={soha === k} onClick={() => setSoha(k)}>
              {t.sohalar[k]}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill active={diff === "all"} onClick={() => setDiff("all")} subtle>
            {t.qongiroq.allDiff}
          </Pill>
          {DIFFICULTIES.map((d) => (
            <Pill key={d} active={diff === d} onClick={() => setDiff(d)} subtle>
              {t.qongiroq.difficulty[d]}
            </Pill>
          ))}
        </div>
      </div>

      {/* Ssenariylar */}
      {list.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted">
          {t.qongiroq.resultEmpty}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <Card key={s.id} interactive className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-base font-semibold text-onink">
                    {initials(s.name)}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-foreground">
                      {s.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {t.sohalar[s.soha]} · {t.personalar[s.persona]}
                    </p>
                  </div>
                </div>
                <DiffBadge d={s.difficulty} />
              </div>

              <p className="text-sm leading-relaxed text-muted">
                {t.qongiroq.personaHint[s.persona]}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"
                    aria-hidden
                  />
                  {s.rejim === "qongiroq"
                    ? t.trener.rejimQongiroq
                    : t.trener.rejimYuzmaYuz}
                </span>
                <span aria-hidden>·</span>
                <span>
                  {t.qongiroq.focusLabel}: {t.qongiroq.focus[s.focus]}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-hair pt-4">
                <span className="mr-auto font-mono text-xs tabular-nums text-faint">
                  {t.qongiroq.levelLabel} {s.level}
                </span>
                <Link href={scenarioHref(s)}>
                  <Button variant="ghost">{t.qongiroq.setup}</Button>
                </Link>
                <Link href={scenarioHref(s)}>
                  <Button>{t.qongiroq.call}</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Yaratilgan mijozlar */}
      {created.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            {t.qongiroq.createdTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((c) => (
              <Card key={c.id} interactive className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-base font-semibold text-onink">
                    {initials(c.name)}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-foreground">
                      {c.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {t.sohalar[c.soha]} · {t.personalar[c.persona]}
                      {c.company ? ` · ${c.company}` : ""}
                    </p>
                  </div>
                </div>
                {c.desc && (
                  <p className="text-sm leading-relaxed text-muted">{c.desc}</p>
                )}
                <div className="mt-auto flex items-center justify-end border-t border-hair pt-4">
                  <Link href={customHref(c)}>
                    <Button>▶ {t.qongiroq.call}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* O'z mijozingni yarat */}
      <div className="mt-10">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span aria-hidden>➕</span>
            <h2 className="text-xl font-semibold tracking-tight">
              {t.qongiroq.customTitle}
            </h2>
          </div>
          <p className="text-sm text-muted">{t.qongiroq.customLead}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.qongiroq.customName}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.qongiroq.customNamePh}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.qongiroq.customCompany}
              </span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t.qongiroq.customCompanyPh}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.qongiroq.customSoha}
              </span>
              <select
                value={customSoha}
                onChange={(e) => setCustomSoha(e.target.value as SohaKey)}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition focus:border-foreground/40"
              >
                {SOHA_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t.sohalar[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.qongiroq.customXarakter}
              </span>
              <select
                value={customPersona}
                onChange={(e) => setCustomPersona(e.target.value as PersonaKey)}
                className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] outline-none transition focus:border-foreground/40"
              >
                {PERSONA_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {t.personalar[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-foreground">
                {t.qongiroq.customDesc}
              </span>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder={t.qongiroq.customDescPh}
                className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (!name.trim()) return;
                setCreated((list) => [
                  ...list,
                  {
                    id: `${Date.now()}-${list.length}`,
                    name: name.trim(),
                    company: company.trim(),
                    soha: customSoha,
                    persona: customPersona,
                    desc: desc.trim(),
                  },
                ]);
                setName("");
                setCompany("");
                setDesc("");
              }}
              disabled={!name.trim()}
            >
              {t.qongiroq.customBtn}
            </Button>
            <span className="text-xs text-faint">{t.qongiroq.customHint}</span>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Pill({
  active,
  onClick,
  subtle,
  children,
}: {
  active: boolean;
  onClick: () => void;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
        active
          ? subtle
            ? "bg-foreground/[.08] text-foreground"
            : "bg-ink text-onink"
          : "border border-border text-muted hover:bg-foreground/[.04] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
