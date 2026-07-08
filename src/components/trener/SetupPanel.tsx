"use client";

import { getMessages } from "@/i18n";
import { Card, Chip, Button, Badge } from "@/components/ui";
import {
  PERSONA_KEYS,
  SOHA_KEYS,
  type PersonaKey,
  type SohaKey,
} from "@/lib/content";

const t = getMessages();
const LEVELS = [1, 2, 3, 4, 5, 6];

export interface SetupPanelProps {
  soha: SohaKey;
  persona: PersonaKey;
  level: number;
  onSoha: (k: SohaKey) => void;
  onPersona: (k: PersonaKey) => void;
  onLevel: (l: number) => void;
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
  onSoha,
  onPersona,
  onLevel,
  onStart,
}: SetupPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">
          <span className="neon-text">{t.setup.title}</span>
        </h1>
        <p className="text-sm text-muted">{t.setup.mockNote}</p>
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
      </Card>

      <Button onClick={onStart} className="w-full sm:w-auto">
        {t.setup.start}
      </Button>
    </div>
  );
}
