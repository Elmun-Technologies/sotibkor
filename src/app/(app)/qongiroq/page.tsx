"use client";

import { useEffect, useMemo, useState } from "react";
import { getMessages } from "@/i18n";
import {
  PageShell,
  Card,
  Button,
  AppLoading,
  PersonaAvatar,
} from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import {
  SCENARIOS,
  DIFFICULTIES,
  scenarioHref,
  type Difficulty,
  type Scenario,
  type ScenarioOverrides,
} from "@/lib/scenarios";
import {
  SOHA_KEYS,
  PERSONA_KEYS,
  REJIM_KEYS,
  TIL_REJIM_KEYS,
  type SohaKey,
  type PersonaKey,
  type RejimKey,
  type TilRejimKey,
} from "@/lib/content";
import {
  addCustomClient,
  syncCustomClientsFromSupabase,
  type CustomClient,
} from "@/lib/customClients";

const t = getMessages();

const DIFF_COLOR: Record<Difficulty, string> = {
  oson: "var(--good)",
  orta: "var(--warn)",
  qiyin: "var(--live)",
};

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

const REJIM_LABEL: Record<RejimKey, string> = {
  qongiroq: t.trener.rejimQongiroq,
  yuzma_yuz: t.trener.rejimYuzmaYuz,
};

const TIL_LABEL: Record<TilRejimKey, string> = {
  sof_ozbek: t.qongiroq.tilSofOzbek,
  aralash: t.qongiroq.tilAralash,
  rus: t.qongiroq.tilRus,
};

function customHref(c: CustomClient): string {
  const q = new URLSearchParams({
    soha: c.soha,
    persona: c.persona,
    level: "3",
    rejim: "qongiroq",
    name: c.name,
    ...(c.company ? { lavozim: c.company } : {}),
  });
  return `/trener?${q.toString()}`;
}

export default function QongiroqPage() {
  const [soha, setSoha] = useState<SohaKey | "all">("all");
  const [diff, setDiff] = useState<Difficulty | "all">("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openSettings, setOpenSettings] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ScenarioOverrides>>(
    {},
  );

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [customSoha, setCustomSoha] = useState<SohaKey>(SOHA_KEYS[0]);
  const [customPersona, setCustomPersona] = useState<PersonaKey>(
    PERSONA_KEYS[0],
  );
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState<CustomClient[]>([]);

  const ready = useAuthGate("/qongiroq");

  // Yaratilgan mijozlar localStorage'da saqlanadi va hisobga bog'lanadi
  // (Supabase ulangan bo'lsa) — reload'da va boshqa qurilmada yo'qolmaydi.
  useEffect(() => {
    if (!ready) return;
    void syncCustomClientsFromSupabase().then(setCreated);
  }, [ready]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCENARIOS.filter(
      (s) =>
        (soha === "all" || s.soha === soha) &&
        (diff === "all" || s.difficulty === diff) &&
        (q === "" ||
          s.name.toLowerCase().includes(q) ||
          s.lavozim.toLowerCase().includes(q) ||
          t.personalar[s.persona].toLowerCase().includes(q) ||
          t.qongiroq.personaHint[s.persona].toLowerCase().includes(q)),
    );
  }, [soha, diff, query]);

  if (!ready) return <AppLoading />;

  const setOverride = (id: string, patch: ScenarioOverrides) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  return (
    <PageShell title={t.qongiroq.title} lead={t.qongiroq.subtitle}>
      {/* Qidiruv + ko'rinish */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.qongiroq.searchPh}
          aria-label={t.qongiroq.searchPh}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40"
        />
        <div className="flex shrink-0 gap-1 rounded-full border border-border p-1">
          <ViewToggleBtn
            active={view === "grid"}
            onClick={() => setView("grid")}
          >
            {t.qongiroq.viewGrid}
          </ViewToggleBtn>
          <ViewToggleBtn
            active={view === "list"}
            onClick={() => setView("list")}
          >
            {t.qongiroq.viewList}
          </ViewToggleBtn>
        </div>
      </div>

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
        <div
          className={
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {list.map((s) => (
            <ScenarioCard
              key={s.id}
              s={s}
              view={view}
              override={overrides[s.id] ?? {}}
              settingsOpen={openSettings === s.id}
              onToggleSettings={() =>
                setOpenSettings((cur) => (cur === s.id ? null : s.id))
              }
              onOverride={(patch) => setOverride(s.id, patch)}
            />
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
                  <PersonaAvatar persona={c.persona} size={48} />
                  <div>
                    <p className="font-semibold tracking-tight text-foreground">
                      {c.name}
                    </p>
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
                  <Button href={customHref(c)}>▶ {t.qongiroq.call}</Button>
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
                <span className="text-[color:var(--bad)]"> *</span>
              </span>
              <input
                value={name}
                required
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
                setCreated(
                  addCustomClient({
                    name: name.trim(),
                    company: company.trim(),
                    soha: customSoha,
                    persona: customPersona,
                    desc: desc.trim(),
                  }),
                );
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

function ViewToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-ink text-onink" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** Kichik chip (sozlamalar panelidagi tanlovlar uchun). */
function MiniChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-ink text-onink"
          : "border border-border text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

const LEVELS = [1, 2, 3, 4, 5, 6];

function ScenarioCard({
  s,
  view,
  override,
  settingsOpen,
  onToggleSettings,
  onOverride,
}: {
  s: Scenario;
  view: "grid" | "list";
  override: ScenarioOverrides;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onOverride: (patch: ScenarioOverrides) => void;
}) {
  const level = override.level ?? s.level;
  const rejim: RejimKey = override.rejim ?? s.rejim;
  const til = (override.tilRejimi as TilRejimKey | undefined) ?? "aralash";

  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PersonaAvatar persona={s.persona} size={48} />
          <div>
            <p className="font-semibold tracking-tight text-foreground">
              {s.name}
            </p>
            <p className="text-xs text-muted">
              {s.lavozim} · {t.sohalar[s.soha]}
            </p>
          </div>
        </div>
        <DiffBadge d={s.difficulty} />
      </div>

      {view === "grid" && (
        <p className="text-sm leading-relaxed text-muted">
          {t.qongiroq.personaHint[s.persona]}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"
            aria-hidden
          />
          {REJIM_LABEL[rejim]}
        </span>
        <span aria-hidden>·</span>
        <span>
          {t.qongiroq.focusLabel}: {t.qongiroq.focus[s.focus]}
        </span>
      </div>

      {settingsOpen && (
        <div className="inset flex flex-col gap-3 p-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {t.qongiroq.settingsTitle}
          </span>
          <div>
            <span className="mb-1.5 block text-xs text-muted">
              {t.qongiroq.settingsLevel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <MiniChip
                  key={l}
                  active={level === l}
                  onClick={() => onOverride({ level: l })}
                >
                  {l}
                </MiniChip>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted">
              {t.qongiroq.settingsRejim}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REJIM_KEYS.map((r) => (
                <MiniChip
                  key={r}
                  active={rejim === r}
                  onClick={() => onOverride({ rejim: r })}
                >
                  {REJIM_LABEL[r]}
                </MiniChip>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted">
              {t.qongiroq.settingsTil}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TIL_REJIM_KEYS.map((r) => (
                <MiniChip
                  key={r}
                  active={til === r}
                  onClick={() => onOverride({ tilRejimi: r })}
                >
                  {TIL_LABEL[r]}
                </MiniChip>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-hair pt-4">
        <span className="mr-auto font-mono text-xs tabular-nums text-faint">
          {t.qongiroq.levelLabel} {level}
        </span>
        <button
          type="button"
          onClick={onToggleSettings}
          aria-pressed={settingsOpen}
          aria-label={t.qongiroq.settingsTitle}
          className="rounded-full border border-border px-3 py-2 text-sm text-muted transition hover:text-foreground"
        >
          ⚙
        </button>
        <Button href={scenarioHref(s, override)}>{t.qongiroq.call}</Button>
      </div>
    </Card>
  );
}
