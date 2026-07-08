"use client";

import { useCallback, useRef, useState } from "react";
import { getMessages } from "@/i18n";
import {
  PERSONA_KEYS,
  SOHA_KEYS,
  type PersonaKey,
  type SohaKey,
} from "@/lib/content";
import { SentenceStreamer } from "@/lib/sentence";
import type { ScoreResult } from "@/lib/scoring";

const t = getMessages();

type Turn = { role: "user" | "assistant"; content: string };
type Stage = "setup" | "chat" | "result";
type Metrics = { llmFirst: number | null; ttsFirst: number | null; total: number | null };

const LEVELS = [1, 2, 3, 4, 5, 6];

export default function TrenerPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [soha, setSoha] = useState<SohaKey>("mebel");
  const [persona, setPersona] = useState<PersonaKey>("qimmatchi");
  const [level, setLevel] = useState(2);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({ llmFirst: null, ttsFirst: null, total: null });
  const [recording, setRecording] = useState(false);
  const [sttHint, setSttHint] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);

  const ttsModeRef = useRef<"probe" | "aisha" | "web">("probe");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const playSentence = useCallback(
    async (text: string, onStart: () => void): Promise<void> => {
      if (ttsModeRef.current !== "web") {
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (res.ok) {
            ttsModeRef.current = "aisha";
            const buf = await res.arrayBuffer();
            const audio = new Audio(URL.createObjectURL(new Blob([buf])));
            return await new Promise<void>((resolve) => {
              audio.onplay = onStart;
              audio.onended = () => resolve();
              audio.onerror = () => resolve();
              void audio.play().catch(() => resolve());
            });
          }
          ttsModeRef.current = "web";
        } catch {
          ttsModeRef.current = "web";
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        return await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "uz-UZ";
          u.rate = 1.02;
          u.onstart = onStart;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          window.speechSynthesis.speak(u);
        });
      }
      onStart();
    },
    [],
  );

  const sendSeller = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      const history: Turn[] = [...turns, { role: "user", content: clean }];
      setTurns(history);
      setInput("");
      setBusy(true);
      setStreaming("");

      const sendStart = performance.now();
      let firstToken: number | null = null;
      let firstSentenceReady: number | null = null;
      let firstAudio: number | null = null;

      const queue: string[] = [];
      let draining = false;
      const drain = async () => {
        if (draining) return;
        draining = true;
        while (queue.length) {
          const s = queue.shift()!;
          await playSentence(s, () => {
            if (firstAudio == null) {
              firstAudio = performance.now();
              setMetrics({
                llmFirst: firstToken != null ? Math.round(firstToken - sendStart) : null,
                ttsFirst:
                  firstSentenceReady != null ? Math.round(firstAudio - firstSentenceReady) : null,
                total: Math.round(firstAudio - sendStart),
              });
            }
          });
        }
        draining = false;
      };

      let acc = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soha, persona, level, history }),
        });
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        const sp = new SentenceStreamer();
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = dec.decode(value, { stream: true });
            if (firstToken == null) firstToken = performance.now();
            acc += chunk;
            setStreaming(acc);
            for (const sentence of sp.push(chunk)) {
              if (firstSentenceReady == null) firstSentenceReady = performance.now();
              queue.push(sentence);
              void drain();
            }
          }
        }
        for (const sentence of sp.flush()) {
          if (firstSentenceReady == null) firstSentenceReady = performance.now();
          queue.push(sentence);
          void drain();
        }
      } finally {
        setTurns([...history, { role: "assistant", content: acc.trim() || "..." }]);
        setStreaming("");
        setBusy(false);
      }
    },
    [busy, turns, soha, persona, level, playSentence],
  );

  const toggleMic = useCallback(async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(mediaStream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        mediaStream.getTracks().forEach((tr) => tr.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "rec.webm");
        try {
          const res = await fetch("/api/stt", { method: "POST", body: form });
          if (res.ok) {
            const data = (await res.json()) as { text?: string };
            if (data.text) await sendSeller(data.text);
          } else {
            setSttHint(t.trener.sttUnavailable);
          }
        } catch {
          setSttHint(t.trener.sttUnavailable);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setSttHint(null);
    } catch {
      setSttHint(t.trener.sttUnavailable);
    }
  }, [recording, sendSeller]);

  const finish = useCallback(async () => {
    if (turns.length === 0) return;
    setScoring(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soha, persona, level, transcript: turns }),
      });
      const data = (await res.json()) as ScoreResult;
      setScore(data);
      setStage("result");
    } finally {
      setScoring(false);
    }
  }, [turns, soha, persona, level]);

  const reset = () => {
    setStage("setup");
    setTurns([]);
    setStreaming("");
    setScore(null);
    setMetrics({ llmFirst: null, ttsFirst: null, total: null });
    ttsModeRef.current = "probe";
  };

  // ---------- render ----------
  if (stage === "setup") {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold">
          <span className="neon-text">{t.app.name}</span>
        </h1>
        <p className="text-sm text-white/50">{t.setup.mockNote}</p>

        <Field label={t.setup.soha}>
          <div className="flex flex-wrap gap-2">
            {SOHA_KEYS.map((k) => (
              <Chip key={k} active={soha === k} onClick={() => setSoha(k)}>
                {t.sohalar[k]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={t.setup.persona}>
          <div className="flex flex-wrap gap-2">
            {PERSONA_KEYS.map((k) => (
              <Chip key={k} active={persona === k} onClick={() => setPersona(k)}>
                {t.personalar[k]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={`${t.setup.level}: ${level}`}>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
                {l}
              </Chip>
            ))}
          </div>
        </Field>

        <button
          onClick={() => setStage("chat")}
          className="neon-glow mt-2 rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-6 py-3 font-semibold transition hover:bg-[color:var(--neon)]/20"
        >
          {t.setup.start}
        </button>
      </main>
    );
  }

  if (stage === "chat") {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-4">
        <header className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-sm text-white/60">
            {t.sohalar[soha]} · {t.personalar[persona]} · L{level}
          </div>
          <button
            onClick={finish}
            disabled={turns.length === 0 || scoring}
            className="rounded-lg border border-[color:var(--neon-2)]/40 px-3 py-1.5 text-sm text-white/80 transition hover:bg-[color:var(--neon-2)]/15 disabled:opacity-40"
          >
            {scoring ? t.natija.evaluating : t.trener.finish}
          </button>
        </header>

        <LatencyBar metrics={metrics} />

        <div className="flex-1 space-y-3 overflow-y-auto py-3">
          {turns.map((turn, i) => (
            <Bubble key={i} role={turn.role}>
              {turn.content}
            </Bubble>
          ))}
          {streaming && <Bubble role="assistant">{streaming}</Bubble>}
          {busy && !streaming && <p className="text-sm text-white/40">{t.trener.thinking}</p>}
        </div>

        {sttHint && <p className="mb-2 text-xs text-amber-400/80">{sttHint}</p>}

        <div className="flex items-end gap-2 border-t border-white/10 pt-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendSeller(input);
              }
            }}
            rows={2}
            placeholder={t.trener.placeholder}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]/50"
          />
          <button
            onClick={toggleMic}
            title={t.trener.mic}
            className={`rounded-xl border px-3 py-2 text-sm transition ${
              recording
                ? "border-red-500/60 bg-red-500/20 text-red-300"
                : "border-white/10 hover:bg-white/5"
            }`}
          >
            {recording ? "■" : "🎙"}
          </button>
          <button
            onClick={() => void sendSeller(input)}
            disabled={busy || !input.trim()}
            className="rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-4 py-2 text-sm font-semibold transition hover:bg-[color:var(--neon)]/20 disabled:opacity-40"
          >
            {t.trener.send}
          </button>
        </div>
      </main>
    );
  }

  // result
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">{t.natija.title}</h1>
      {score && <ScoreView score={score} onAgain={reset} />}
    </main>
  );
}

// ---------- small components ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-widest text-white/40">{label}</div>
      {children}
    </div>
  );
}

function Chip({
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
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-[color:var(--neon)]/60 bg-[color:var(--neon)]/15 text-white"
          : "border-white/10 text-white/60 hover:border-white/25"
      }`}
    >
      {children}
    </button>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isSeller = role === "user";
  return (
    <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isSeller
            ? "bg-[color:var(--neon)]/15 text-white"
            : "border border-white/10 bg-white/[.03] text-white/90"
        }`}
      >
        <div className="mb-0.5 text-[10px] uppercase tracking-wider text-white/40">
          {isSeller ? t.trener.you : t.trener.client}
        </div>
        {children}
      </div>
    </div>
  );
}

function LatencyBar({ metrics }: { metrics: Metrics }) {
  const item = (label: string, v: number | null) => {
    const over = v != null && v > 2000;
    return (
      <span className={`rounded px-2 py-0.5 ${over ? "text-red-400" : "text-white/50"}`}>
        {label}: {v != null ? `${v} ${t.trener.ms}` : "—"}
      </span>
    );
  };
  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-white/[.02] px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[11px]">
      {item(t.trener.llmFirst, metrics.llmFirst)}
      {item(t.trener.ttsFirst, metrics.ttsFirst)}
      {item(t.trener.totalCycle, metrics.total)}
    </div>
  );
}

function ScoreView({ score, onAgain }: { score: ScoreResult; onAgain: () => void }) {
  const rows: [string, number, number][] = [
    [t.natija.salomlashish, score.breakdown.salomlashish, 10],
    [t.natija.ehtiyoj_aniqlash, score.breakdown.ehtiyoj_aniqlash, 20],
    [t.natija.otkazlarga_ishlov, score.breakdown.otkazlarga_ishlov, 30],
    [t.natija.closing, score.breakdown.closing, 20],
    [t.natija.ohang, score.breakdown.ohang, 20],
  ];
  return (
    <div className="space-y-6">
      <div className="neon-glow rounded-2xl border border-white/10 p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-white/40">{t.natija.total}</div>
        <div className="neon-text text-6xl font-bold">{score.total}</div>
        <div className="mt-1 text-sm text-white/50">
          {t.natija.xp}: +{score.xp_awarded}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white/70">{t.natija.breakdown}</h2>
        <div className="space-y-2">
          {rows.map(([label, val, max]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs text-white/60">
                <span>{label}</span>
                <span>
                  {val}/{max}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[color:var(--neon)]"
                  style={{ width: `${(val / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white/70">{t.natija.mistakes}</h2>
        <div className="space-y-3">
          {score.mistakes.map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-3 text-sm">
              <p className="italic text-white/70">“{m.quote}”</p>
              <p className="mt-1 text-red-300/80">
                <span className="text-white/40">{t.natija.why}: </span>
                {m.why}
              </p>
              <p className="mt-1 text-emerald-300/80">
                <span className="text-white/40">{t.natija.better}: </span>
                {m.better}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-white/70">{t.natija.strengths}</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-emerald-300/80">
          {score.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={onAgain}
        className="neon-glow w-full rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-6 py-3 font-semibold transition hover:bg-[color:var(--neon)]/20"
      >
        {t.natija.again}
      </button>
    </div>
  );
}
