"use client";

import { getMessages } from "@/i18n";
import { Card, Chip, Button, Badge } from "@/components/ui";
import {
  PERSONA_KEYS,
  SOHA_KEYS,
  REJIM_KEYS,
  type PersonaKey,
  type SohaKey,
  type RejimKey,
} from "@/lib/content";

const t = getMessages();
const LEVELS = [1, 2, 3, 4, 5, 6];

const REJIM_LABEL: Record<RejimKey, string> = {
  qongiroq: t.trener.rejimQongiroq,
  yuzma_yuz: t.trener.rejimYuzmaYuz,
};

export interface SetupPanelProps {
  soha: SohaKey;
  persona: PersonaKey;
  level: number;
  rejim: RejimKey;
  onSoha: (k: SohaKey) => void;
  onPersona: (k: PersonaKey) => void;
  onLevel: (l: number) => void;
  onRejim: (r: RejimKey) => void;
  onStart: () => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        {label}
      </div>
      {children}
    </div>
  );
}

export function SetupPanel({
  soha,
  persona,
  level,
  rejim,
  onSoha,
  onPersona,
  onLevel,
  onRejim,
  onStart,
}: SetupPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="display text-5xl sm:text-6xl">{t.setup.title}</h1>
        <p className="max-w-xl text-base text-muted">{t.setup.mockNote}</p>
      </div>

      <Card className="space-y-6">
        <Field label={t.setup.soha}>
          <div className="flex flex-wrap gap-2">
            {SOHA_KEYS.map((k) => (
              <Chip key={k} active={soha === k} onClick={() => onSoha(k)}>
                {t.sohalar[k]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={t.setup.persona}>
          <div className="flex flex-wrap gap-2">
            {PERSONA_KEYS.map((k) => (
              <Chip key={k} active={persona === k} onClick={() => onPersona(k)}>
                {t.personalar[k]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={t.setup.level}>
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

        <Field label={t.trener.rejim}>
          <div className="flex flex-wrap gap-2">
            {REJIM_KEYS.map((r) => (
              <Chip key={r} active={rejim === r} onClick={() => onRejim(r)}>
                {REJIM_LABEL[r]}
              </Chip>
            ))}
          </div>
        </Field>
      </Card>

      <Button onClick={onStart} className="w-full sm:w-auto">
        {t.setup.start}
      </Button>
    </div>
  );
}
