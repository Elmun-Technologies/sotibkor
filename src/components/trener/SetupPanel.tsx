"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Card, Chip, Button, Badge, PersonaAvatar, Reveal } from "@/components/ui";
import {
  PERSONA_KEYS,
  SOHA_KEYS,
  REJIM_KEYS,
  TIL_REJIM_KEYS,
  type PersonaKey,
  type SohaKey,
  type RejimKey,
  type TilRejimKey,
} from "@/lib/content";

const t = getMessages();
const LEVELS = [1, 2, 3, 4, 5, 6];

const REJIM_LABEL: Record<RejimKey, string> = {
  qongiroq: t.trener.rejimQongiroq,
  yuzma_yuz: t.trener.rejimYuzmaYuz,
};

const TIL_REJIM_LABEL: Record<TilRejimKey, string> = {
  sof_ozbek: t.trener.tilSofOzbek,
  aralash: t.trener.tilAralash,
  rus: t.trener.tilRus,
};

const FIELD_ICON: Record<string, string> = {
  soha: "🏢",
  persona: "🎭",
  level: "📊",
  rejim: "📞",
  tilRejimi: "🌐",
};

export interface SetupPanelProps {
  soha: SohaKey;
  persona: PersonaKey;
  level: number;
  rejim: RejimKey;
  tilRejimi: TilRejimKey;
  onSoha: (k: SohaKey) => void;
  onPersona: (k: PersonaKey) => void;
  onLevel: (l: number) => void;
  onRejim: (r: RejimKey) => void;
  onTilRejimi: (r: TilRejimKey) => void;
  onStart: () => void;
  /** Spaced-repetition: oxirgi zaif e'tirozga mos tavsiya qilingan persona. */
  recommendedPersona?: PersonaKey | null;
  /** Sessiya boshlanayotganda (server so'rovi kutilmoqda). */
  starting?: boolean;
  /** Boshlashda xato (masalan sinov limiti tugagan) — xabar + ixtiyoriy havola. */
  errorHint?: string | null;
  errorCta?: { label: string; href: string } | null;
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        id={id}
        className="mb-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted"
      >
        <span aria-hidden className="text-sm leading-none">
          {icon}
        </span>
        {label}
      </div>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  );
}

export function SetupPanel({
  soha,
  persona,
  level,
  rejim,
  tilRejimi,
  onSoha,
  onPersona,
  onLevel,
  onRejim,
  onTilRejimi,
  onStart,
  recommendedPersona,
  starting,
  errorHint,
  errorCta,
}: SetupPanelProps) {
  const sohaId = useId();
  const personaId = useId();
  const levelId = useId();
  const rejimId = useId();
  const tilId = useId();

  return (
    <Reveal>
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="display text-5xl sm:text-6xl">{t.setup.title}</h1>
          <p className="max-w-xl text-base text-muted">{t.setup.intro}</p>
        </div>

        <Card className="space-y-6">
          <Field id={sohaId} label={t.setup.soha} icon={FIELD_ICON.soha}>
            <div className="flex flex-wrap gap-2">
              {SOHA_KEYS.map((k) => (
                <Chip key={k} active={soha === k} onClick={() => onSoha(k)}>
                  {t.sohalar[k]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field
            id={personaId}
            label={t.setup.persona}
            icon={FIELD_ICON.persona}
          >
            <div className="flex flex-wrap gap-2">
              {PERSONA_KEYS.map((k) => (
                <Chip key={k} active={persona === k} onClick={() => onPersona(k)}>
                  <span className="inline-flex items-center gap-1.5">
                    <PersonaAvatar persona={k} size={18} />
                    {t.personalar[k]}
                    {k === recommendedPersona ? " ★" : ""}
                  </span>
                </Chip>
              ))}
            </div>
            {recommendedPersona && (
              <p className="mt-2 text-xs text-muted">
                {t.trener.recommendedHint}
              </p>
            )}
          </Field>

          <Field id={levelId} label={t.setup.level} icon={FIELD_ICON.level}>
            <div className="flex flex-wrap items-center gap-2">
              {LEVELS.map((l) => (
                <Chip key={l} active={level === l} onClick={() => onLevel(l)}>
                  {l}
                </Chip>
              ))}
              <span className="ml-1">
                <Badge tone="neon">L{level}</Badge>
              </span>
            </div>
          </Field>

          <Field id={rejimId} label={t.trener.rejim} icon={FIELD_ICON.rejim}>
            <div className="flex flex-wrap gap-2">
              {REJIM_KEYS.map((r) => (
                <Chip key={r} active={rejim === r} onClick={() => onRejim(r)}>
                  {REJIM_LABEL[r]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field
            id={tilId}
            label={t.trener.tilRejimi}
            icon={FIELD_ICON.tilRejimi}
          >
            <div className="flex flex-wrap gap-2">
              {TIL_REJIM_KEYS.map((r) => (
                <Chip
                  key={r}
                  active={tilRejimi === r}
                  onClick={() => onTilRejimi(r)}
                >
                  {TIL_REJIM_LABEL[r]}
                </Chip>
              ))}
            </div>
          </Field>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={onStart}
            disabled={starting}
            className="w-full sm:w-auto"
          >
            {t.setup.start}
          </Button>
        </motion.div>
        {errorHint && (
          <p role="alert" className="text-sm text-[color:var(--bad)]">
            {errorHint}{" "}
            {errorCta && (
              <a
                href={errorCta.href}
                className="underline underline-offset-2"
              >
                {errorCta.label}
              </a>
            )}
          </p>
        )}
      </div>
    </Reveal>
  );
}
