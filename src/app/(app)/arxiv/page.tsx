"use client";

import { useCallback, useEffect, useState } from "react";
import { getMessages } from "@/i18n";
import { useAuthGate } from "@/lib/useAuthGate";
import { isPersonaKey, isSohaKey } from "@/lib/content";
import type { ArchiveScore, TranscriptRow } from "@/lib/db/sessions";
import {
  PageShell,
  Card,
  Badge,
  Button,
  PersonaAvatar,
  AppLoading,
} from "@/components/ui";

const t = getMessages();

interface SessionSummary {
  id: string;
  soha: string | null;
  persona: string | null;
  level: number | null;
  startedAt: string;
  endedAt: string | null;
  scoreTotal: number | null;
}

interface SessionAudioClip {
  clipIndex: number;
  speaker: "sotuvchi" | "mijoz";
  url: string;
}

interface SessionDetail extends SessionSummary {
  transcript: TranscriptRow[];
  score: ArchiveScore | null;
  audio: SessionAudioClip[];
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function scoreTone(v: number | null): "good" | "warn" | "muted" {
  if (v == null) return "muted";
  if (v >= 66) return "good";
  return "warn";
}

function SessionCard({
  session,
  onView,
}: {
  session: SessionSummary;
  onView: () => void;
}) {
  const persona =
    session.persona && isPersonaKey(session.persona) ? session.persona : null;
  return (
    <button type="button" onClick={onView} className="block w-full text-left">
      <Card interactive className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {persona && <PersonaAvatar persona={persona} size={44} />}
            <div>
              <p className="font-semibold tracking-tight text-foreground">
                {persona ? t.personalar[persona] : (session.persona ?? "—")}
              </p>
              <p className="text-xs text-muted">
                {session.soha && isSohaKey(session.soha)
                  ? t.sohalar[session.soha]
                  : session.soha}
                {session.level ? ` · L${session.level}` : ""}
              </p>
            </div>
          </div>
          <Badge tone={scoreTone(session.scoreTotal)}>
            {session.scoreTotal != null
              ? `${session.scoreTotal} ${t.arxiv.scoreLabel}`
              : t.arxiv.noScore}
          </Badge>
        </div>
        <div className="flex items-center justify-between border-t border-hair pt-3 text-xs text-muted">
          <span>{fmtDate(session.startedAt)}</span>
          <span className="font-medium text-foreground">{t.arxiv.view} →</span>
        </div>
      </Card>
    </button>
  );
}

function DetailPanel({
  detail,
  onClose,
}: {
  detail: SessionDetail;
  onClose: () => void;
}) {
  const persona =
    detail.persona && isPersonaKey(detail.persona) ? detail.persona : null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← {t.arxiv.backToList}
      </button>

      <div className="flex items-center gap-3">
        {persona && <PersonaAvatar persona={persona} size={56} />}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {persona ? t.personalar[persona] : detail.persona}
          </h2>
          <p className="text-sm text-muted">{fmtDate(detail.startedAt)}</p>
        </div>
        <span className="ml-auto">
          <Badge tone={scoreTone(detail.scoreTotal)}>
            {detail.scoreTotal != null
              ? `${detail.scoreTotal} ${t.arxiv.scoreLabel}`
              : t.arxiv.noScore}
          </Badge>
        </span>
      </div>

      {detail.score && (
        <Card className="space-y-3">
          {detail.score.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                {t.arxiv.strengthsTitle}
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {detail.score.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {detail.score.mistakes.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                {t.arxiv.mistakesTitle}
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {detail.score.mistakes.map((m, i) => (
                  <li key={i}>• {m.why}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-faint">
            {t.arxiv.xpLabel}: {detail.score.xp_awarded}
          </p>
        </Card>
      )}

      <Card className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
          {t.arxiv.audioTitle}
        </p>
        {detail.audio.length === 0 ? (
          <p className="text-sm text-muted">{t.arxiv.noAudio}</p>
        ) : (
          <div className="space-y-2">
            {detail.audio.map((clip) => (
              <div
                key={`${clip.speaker}-${clip.clipIndex}`}
                className="flex items-center gap-3"
              >
                <span className="w-28 shrink-0 text-xs text-muted">
                  {clip.speaker === "mijoz"
                    ? t.arxiv.audioClientLabel
                    : t.arxiv.audioSellerLabel}{" "}
                  #{clip.clipIndex + 1}
                </span>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption -- ovoz yozuvi, subtitr manbasi yo'q */}
                <audio controls src={clip.url} className="h-9 flex-1" />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-2">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-muted">
          {t.arxiv.transcriptTitle}
        </p>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {detail.transcript.map((turn) => (
            <div
              key={turn.turnIndex}
              className="flex gap-2 text-[15px] leading-relaxed"
            >
              <span
                className={`shrink-0 font-mono text-[10px] uppercase tracking-wider ${
                  turn.speaker === "sotuvchi"
                    ? "text-foreground/50"
                    : "text-[color:var(--accent)]"
                }`}
                style={{ width: 56, paddingTop: 3 }}
              >
                {turn.speaker === "sotuvchi" ? t.trener.you : t.trener.client}
              </span>
              <span
                className={
                  turn.speaker === "sotuvchi"
                    ? "text-foreground/75"
                    : "text-foreground"
                }
              >
                {turn.text}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function ArxivPage() {
  const ready = useAuthGate("/arxiv");
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [supabaseOn, setSupabaseOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { providers?: { supabase?: boolean } } | null) => {
        if (data) setSupabaseOn(Boolean(data.providers?.supabase));
      })
      .catch(() => {});
    fetch("/api/archive")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { sessions?: SessionSummary[] } | null) => {
        setSessions(data?.sessions ?? []);
      })
      .catch(() => setSessions([]));
  }, [ready]);

  const openDetail = useCallback((id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError(false);
    fetch(`/api/archive/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SessionDetail | null) => {
        if (!data) {
          setDetailError(true);
          return;
        }
        setDetail(data);
      })
      .catch(() => setDetailError(true));
  }, []);

  if (!ready) return <AppLoading />;

  if (selectedId) {
    return (
      <PageShell>
        {detail ? (
          <DetailPanel detail={detail} onClose={() => setSelectedId(null)} />
        ) : detailError ? (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="text-3xl" aria-hidden>
              ⚠️
            </span>
            <p className="text-sm text-[color:var(--bad)]">
              {t.arxiv.detailError}
            </p>
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              ← {t.arxiv.backToList}
            </Button>
          </Card>
        ) : (
          <AppLoading />
        )}
      </PageShell>
    );
  }

  return (
    <PageShell title={t.arxiv.title} lead={t.arxiv.subtitle}>
      {!supabaseOn && (
        <div className="mb-6 rounded-lg2 border border-hair bg-surface2 px-4 py-2.5 text-xs text-muted">
          {t.arxiv.mockNote}
        </div>
      )}
      {sessions === null ? (
        <AppLoading />
      ) : sessions.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-3xl" aria-hidden>
            📞
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t.arxiv.emptyTitle}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
              {t.arxiv.empty}
            </p>
          </div>
          <Button href="/qongiroq" variant="ghost">
            {t.arxiv.emptyCta}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onView={() => openDetail(s.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
