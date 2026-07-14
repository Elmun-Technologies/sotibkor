"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import { Button, PersonaAvatar } from "@/components/ui";
import type { LiveHint } from "@/lib/coach";
import type { PersonaKey } from "@/lib/content";

const t = getMessages();

type Turn = { role: "user" | "assistant"; content: string };

export interface CallViewProps {
  /** Mijozning real ismi (ssenariy yoki persona standart ismi) — sarlavhada ko'rinadi. */
  clientName: string;
  /** Mijozning lavozimi/roli — bo'lsa sarlavha ostida ko'rinadi. */
  clientLavozim?: string | null;
  /** Xarakter kaliti — illyustrativ avatar shu bo'yicha tanlanadi. */
  persona: PersonaKey;
  personaLabel: string;
  sohaLabel: string;
  rejimLabel: string;
  level: number;
  interest: number | null;
  /** Jonli murabbiy (10x-2) — suhbat DAVOMIDA ko'rinadigan evristik maslahat. */
  coachHint?: LiveHint | null;
  cycleMs?: number | null;
  turns: Turn[];
  streaming: string;
  input: string;
  busy: boolean;
  recording: boolean;
  recognizing: boolean;
  speaking: boolean;
  scoring: boolean;
  onInput: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
  onType: () => void;
  onFinish: () => void;
}

function toneVar(v: number | null): string {
  if (v == null) return "var(--muted)";
  if (v >= 66) return "var(--good)";
  if (v >= 40) return "var(--warn)";
  return "var(--bad)";
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Ekvalayzer — gapirish/tinglash paytida jonli to'lqin. */
function Waveform({ active, color }: { active: boolean; color: string }) {
  const reduce = useReducedMotion();
  const bars = [0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.75];
  return (
    <div className="flex h-6 items-center justify-center gap-1" aria-hidden>
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ height: 24, background: color, transformOrigin: "center" }}
          initial={{ scaleY: 0.28 }}
          animate={
            active && !reduce
              ? { scaleY: [0.28, h, 0.35, h * 0.8, 0.28] }
              : { scaleY: 0.22 }
          }
          transition={
            active && !reduce
              ? {
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

export function CallView(p: CallViewProps) {
  const reduce = useReducedMotion();
  const [sec, setSec] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [p.turns.length, p.streaming]);

  const state = p.recording
    ? "listening"
    : p.recognizing
      ? "recognizing"
      : p.speaking
        ? "speaking"
        : p.busy
          ? "thinking"
          : "ready";
  const stateLabel =
    state === "speaking"
      ? t.trener.callSpeaking
      : state === "listening"
        ? t.trener.callListening
        : state === "recognizing"
          ? t.trener.callRecognizing
          : state === "thinking"
            ? t.trener.callThinking
            : t.trener.callReady;

  const tone = toneVar(p.interest);
  const auraActive = state === "speaking" || state === "listening";

  return (
    <div className="relative flex min-h-[calc(100dvh-9rem)] flex-col gap-4">
      {p.scoring && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[var(--r-card)] bg-surface/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-foreground/40"
                animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-foreground">
            {t.natija.evaluating}
          </p>
        </div>
      )}
      {/* Yuqori: kontekst + timer + yakunlash */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
          <span className="flex items-center gap-1.5 text-[color:var(--live)]">
            <motion.span
              className="h-2 w-2 rounded-full bg-[color:var(--live)]"
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            {t.trener.callLive}
          </span>
          <span className="tabular-nums text-foreground">{fmt(sec)}</span>
          {p.cycleMs != null && (
            <>
              <span className="text-faint">·</span>
              <span
                className="tabular-nums"
                style={{
                  color: p.cycleMs > 2000 ? "var(--bad)" : "var(--good)",
                }}
              >
                {(p.cycleMs / 1000).toFixed(1)}s
              </span>
            </>
          )}
          <span className="text-faint">·</span>
          <span>{p.sohaLabel}</span>
          <span className="text-faint">·</span>
          <span>{p.personaLabel}</span>
          <span className="text-faint">·</span>
          <span>L{p.level}</span>
          <span className="text-faint">·</span>
          <span>{p.rejimLabel}</span>
        </div>
        <button
          type="button"
          onClick={p.onFinish}
          disabled={p.turns.length === 0 || p.scoring}
          className="rounded-full border border-[color:var(--bad)]/50 px-4 py-2 text-sm font-medium text-[color:var(--bad)] transition hover:bg-[color:var(--bad)]/10 disabled:opacity-40"
        >
          {p.scoring ? t.natija.evaluating : t.trener.finish}
        </button>
      </div>

      {/* Avatar + holat */}
      <div className="card flex flex-col items-center gap-4 py-8">
        <div className="relative grid h-36 w-36 place-items-center">
          {/* Aura halqalari */}
          {auraActive &&
            !reduce &&
            [0, 0.6].map((d) => (
              <motion.span
                key={d}
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${tone}` }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: d,
                }}
              />
            ))}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: `color-mix(in srgb, ${tone} 14%, transparent)`,
            }}
            animate={
              auraActive && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }
            }
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            <PersonaAvatar persona={p.persona} size={96} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold tracking-tight">
            {p.clientName}
          </div>
          {p.clientLavozim && (
            <div className="-mt-1.5 text-xs text-muted">{p.clientLavozim}</div>
          )}
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: state === "ready" ? "var(--muted)" : tone }}
            role="status"
            aria-live="polite"
          >
            {(state === "speaking" || state === "listening") && (
              <Waveform active color={tone} />
            )}
            <span>{stateLabel}</span>
          </div>
          {state === "speaking" && (
            <p className="text-xs text-faint">{t.trener.bargeInHint}</p>
          )}
        </div>

        {/* Qiziqish o'lchagichi — rang holatga bog'liq */}
        {p.interest != null && (
          <div className="mt-1 flex w-full max-w-xs items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              {t.trener.interest}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/[.08]">
              {/* scaleX (transform) — width EMAS: GPU kompozitor, main thread'ni
                  band qilmaydi (kritik ovoz ekranida turadi). */}
              <motion.div
                className="h-full w-full rounded-full"
                style={{ background: tone, transformOrigin: "left" }}
                animate={{ scaleX: p.interest / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span
              className="font-mono text-sm font-semibold tabular-nums"
              style={{ color: tone }}
            >
              {p.interest}
            </span>
          </div>
        )}

        {/* Jonli murabbiy (10x-2): closeme faqat suhbatdan keyin baho beradi —
            biz suhbat davomida jonli maslahat ko'rsatamiz. */}
        {p.coachHint && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex w-full max-w-xs items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
            style={{
              background: `color-mix(in srgb, ${
                p.coachHint.tone === "bad"
                  ? "var(--bad)"
                  : p.coachHint.tone === "good"
                    ? "var(--good)"
                    : "var(--warn)"
              } 12%, transparent)`,
              color:
                p.coachHint.tone === "bad"
                  ? "var(--bad)"
                  : p.coachHint.tone === "good"
                    ? "var(--good)"
                    : "var(--warn)",
            }}
          >
            <span aria-hidden>
              {p.coachHint.tone === "bad"
                ? "⚠️"
                : p.coachHint.tone === "good"
                  ? "✓"
                  : "💡"}
            </span>
            <span>{t.trener.hints[p.coachHint.key]}</span>
          </div>
        )}

        {/* Kontekst chiplari — suhbat davomida kim bilan gaplashayotganini eslatib turadi */}
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <div className="inset flex items-center gap-2 px-4 py-2.5 text-sm">
            <span aria-hidden>🏠</span>
            <span className="text-muted">{t.trener.chipSoha}:</span>
            <span className="font-medium text-foreground">{p.sohaLabel}</span>
          </div>
          <div className="inset flex items-center gap-2 px-4 py-2.5 text-sm">
            <span aria-hidden>👤</span>
            <span className="text-muted">{t.trener.chipMijoz}:</span>
            <span className="font-medium text-foreground">
              {p.personaLabel}
            </span>
          </div>
          {p.clientLavozim && (
            <div className="inset flex items-center gap-2 px-4 py-2.5 text-sm">
              <span aria-hidden>💼</span>
              <span className="text-muted">{t.trener.chipLavozim}:</span>
              <span className="font-medium text-foreground">
                {p.clientLavozim}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Jonli transkript (qo'ng'iroq yozib borilishi) */}
      <div className="flex items-center gap-1.5 px-1 text-xs text-faint">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--live)]"
          aria-hidden
        />
        {t.trener.transcriptTitle} — {t.trener.transcriptNote}
      </div>
      <div
        ref={scrollRef}
        className="inset flex-1 space-y-2 overflow-y-auto p-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {p.turns.length === 0 && !p.streaming && !p.busy && (
          <p className="py-8 text-center text-sm text-muted">
            {t.trener.callHint}
          </p>
        )}
        {p.turns.map((turn, i) => {
          const isSeller = turn.role === "user";
          return (
            // Faqat YAKUNLANGAN turn'lar animatsiyalanadi (streaming buferi emas —
            // u har token'da qayta render bo'ladi). key={i} — yangi turn yangi
            // indeks bilan bir marta mount bo'lib kiradi, eskisi qayta animatsiyalanmaydi.
            <motion.div
              key={i}
              className="flex gap-2 text-[15px] leading-relaxed"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <span
                className={`shrink-0 font-mono text-[10px] uppercase tracking-wider ${
                  isSeller ? "text-foreground/50" : "text-[color:var(--accent)]"
                }`}
                style={{ width: 56, paddingTop: 3 }}
              >
                {isSeller ? t.trener.you : t.trener.client}
              </span>
              <span
                className={isSeller ? "text-foreground/75" : "text-foreground"}
              >
                {turn.content}
              </span>
            </motion.div>
          );
        })}
        {p.streaming && (
          // Har token'da yangilanadi — jonli hudud spam bo'lmasin uchun
          // ekran o'quvchisidan yashiramiz; yakunlangan turn (yuqorida)
          // qo'shilganda o'qiladi.
          <div
            className="flex gap-2 text-[15px] leading-relaxed"
            aria-hidden="true"
          >
            <span
              className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[color:var(--accent)]"
              style={{ width: 56, paddingTop: 3 }}
            >
              {t.trener.client}
            </span>
            <span>
              {p.streaming}
              <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-[color:var(--accent)]" />
            </span>
          </div>
        )}
      </div>

      {/* Boshqaruv: katta mikrofon + ikkilamchi matn */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={p.onMic}
          aria-pressed={p.recording}
          aria-label={p.recording ? t.trener.micRecording : t.trener.micIdle}
          disabled={p.recognizing}
          className="relative grid h-16 w-16 place-items-center rounded-full text-2xl transition disabled:opacity-60"
          style={{
            background: p.recording ? "var(--bad)" : "var(--ink)",
            color: p.recording ? "#fff" : "var(--on-ink)",
          }}
        >
          {p.recording && !reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid var(--bad)" }}
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
          {p.recognizing && !reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid var(--accent)" }}
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          <span aria-hidden>
            {p.recording ? "■" : p.recognizing ? "…" : "🎙"}
          </span>
        </button>
        <span className="text-xs text-muted">
          {p.recording
            ? t.trener.callStop
            : p.recognizing
              ? t.trener.callRecognizing
              : t.trener.callTalk}
        </span>

        <div className="mt-1 flex w-full items-center gap-2">
          <input
            value={p.input}
            onChange={(e) => {
              p.onType();
              p.onInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                p.onSend();
              }
            }}
            aria-label={t.trener.placeholder}
            placeholder={`${t.trener.callOrType}...`}
            className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40"
          />
          <Button onClick={p.onSend} disabled={p.busy || !p.input.trim()}>
            {t.trener.send}
          </Button>
        </div>
      </div>
    </div>
  );
}
