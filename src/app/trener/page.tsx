"use client";

import { useCallback, useRef, useState } from "react";
import { getMessages } from "@/i18n";
import { type PersonaKey, type SohaKey, type RejimKey } from "@/lib/content";
import { SentenceStreamer } from "@/lib/sentence";
import { interestScore, interestSeries } from "@/lib/coach";
import type { ScoreResult } from "@/lib/scoring";
import { PageShell, Badge, Button } from "@/components/ui";
import {
  ChatBubble,
  Composer,
  LatencyBadge,
  ResultView,
  SetupPanel,
  InterestMeter,
} from "@/components/trener";

const t = getMessages();

type Turn = { role: "user" | "assistant"; content: string };
type Stage = "setup" | "chat" | "result";
type Metrics = {
  llmFirst: number | null;
  ttsFirst: number | null;
  total: number | null;
};

export default function TrenerPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [soha, setSoha] = useState<SohaKey>("mebel");
  const [persona, setPersona] = useState<PersonaKey>("qimmatchi");
  const [level, setLevel] = useState(2);
  const [rejim, setRejim] = useState<RejimKey>("qongiroq");

  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interest, setInterest] = useState<number | null>(null);
  const [series, setSeries] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    llmFirst: null,
    ttsFirst: null,
    total: null,
  });
  const [recording, setRecording] = useState(false);
  const [sttHint, setSttHint] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);

  const ttsModeRef = useRef<"probe" | "aisha" | "web">("probe");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef(false); // barge-in: joriy nutqni bekor qilish
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Barge-in: mijoz gapirayotganda uni darrov to'xtatadi (realizm). */
  const stopSpeaking = useCallback(() => {
    cancelRef.current = true;
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      /* e'tiborsiz */
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const playSentence = useCallback(
    async (text: string, onStart: () => void): Promise<void> => {
      if (cancelRef.current) return;
      if (ttsModeRef.current !== "web") {
        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (res.ok) {
            ttsModeRef.current = "aisha";
            if (cancelRef.current) return;
            const buf = await res.arrayBuffer();
            const audio = new Audio(URL.createObjectURL(new Blob([buf])));
            audioRef.current = audio;
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
      if (
        !cancelRef.current &&
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
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
      stopSpeaking();
      cancelRef.current = false;

      const history: Turn[] = [...turns, { role: "user", content: clean }];
      setTurns(history);
      setInput("");
      setBusy(true);
      setStreaming("");
      // Qiziqishni sotuvchi replikasidan darrov yangilaymiz
      setInterest(interestScore(history));
      setSeries(interestSeries(history));

      const sendStart = performance.now();
      let firstToken: number | null = null;
      let firstSentenceReady: number | null = null;
      let firstAudio: number | null = null;

      const queue: string[] = [];
      let draining = false;
      const drain = async () => {
        if (draining) return;
        draining = true;
        setSpeaking(true);
        while (queue.length && !cancelRef.current) {
          const s = queue.shift()!;
          await playSentence(s, () => {
            if (firstAudio == null) {
              firstAudio = performance.now();
              setMetrics({
                llmFirst:
                  firstToken != null
                    ? Math.round(firstToken - sendStart)
                    : null,
                ttsFirst:
                  firstSentenceReady != null
                    ? Math.round(firstAudio - firstSentenceReady)
                    : null,
                total: Math.round(firstAudio - sendStart),
              });
            }
          });
        }
        draining = false;
        setSpeaking(false);
      };

      let acc = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soha, persona, level, rejim, history }),
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
              if (firstSentenceReady == null)
                firstSentenceReady = performance.now();
              queue.push(sentence);
              void drain();
            }
          }
        }
        for (const sentence of sp.flush()) {
          if (firstSentenceReady == null)
            firstSentenceReady = performance.now();
          queue.push(sentence);
          void drain();
        }
      } finally {
        const full: Turn[] = [
          ...history,
          { role: "assistant", content: acc.trim() || "..." },
        ];
        setTurns(full);
        setStreaming("");
        setBusy(false);
      }
    },
    [busy, turns, soha, persona, level, rejim, playSentence, stopSpeaking],
  );

  const toggleMic = useCallback(async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    stopSpeaking();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const rec = new MediaRecorder(mediaStream);
      chunksRef.current = [];
      rec.ondataavailable = (e) =>
        e.data.size > 0 && chunksRef.current.push(e.data);
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
  }, [recording, sendSeller, stopSpeaking]);

  const finish = useCallback(async () => {
    if (turns.length === 0) return;
    stopSpeaking();
    setScoring(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soha,
          persona,
          level,
          rejim,
          transcript: turns,
        }),
      });
      const data = (await res.json()) as ScoreResult;
      setScore(data);
      setStage("result");
    } finally {
      setScoring(false);
    }
  }, [turns, soha, persona, level, rejim, stopSpeaking]);

  const reset = () => {
    stopSpeaking();
    setStage("setup");
    setTurns([]);
    setStreaming("");
    setScore(null);
    setInterest(null);
    setSeries([]);
    setMetrics({ llmFirst: null, ttsFirst: null, total: null });
    ttsModeRef.current = "probe";
  };

  // ---------- render ----------
  if (stage === "setup") {
    return (
      <PageShell>
        <SetupPanel
          soha={soha}
          persona={persona}
          level={level}
          rejim={rejim}
          onSoha={setSoha}
          onPersona={setPersona}
          onLevel={setLevel}
          onRejim={setRejim}
          onStart={() => setStage("chat")}
        />
      </PageShell>
    );
  }

  if (stage === "chat") {
    return (
      <PageShell>
        <div className="flex min-h-[calc(100vh-9rem)] flex-col gap-3">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neon">{t.sohalar[soha]}</Badge>
              <Badge tone="muted">{t.personalar[persona]}</Badge>
              <Badge tone="muted">L{level}</Badge>
              <Badge tone="muted">
                {rejim === "qongiroq"
                  ? t.trener.rejimQongiroq
                  : t.trener.rejimYuzmaYuz}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {speaking && (
                <Button variant="ghost" onClick={stopSpeaking}>
                  {t.trener.stopSpeaking}
                </Button>
              )}
              <Button onClick={finish} disabled={turns.length === 0 || scoring}>
                {scoring ? t.natija.evaluating : t.trener.finish}
              </Button>
            </div>
          </header>

          <div className="grid gap-2 sm:grid-cols-2">
            {interest != null && (
              <InterestMeter value={interest} series={series} />
            )}
            <LatencyBadge metrics={metrics} />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto py-2">
            {turns.length === 0 && !streaming && !busy && (
              <div className="flex h-full min-h-40 items-center justify-center px-6 text-center">
                <p className="max-w-sm text-muted">{t.trener.empty}</p>
              </div>
            )}
            {turns.map((turn, i) => (
              <ChatBubble key={i} role={turn.role}>
                {turn.content}
              </ChatBubble>
            ))}
            {streaming && (
              <ChatBubble role="assistant" live>
                {streaming}
              </ChatBubble>
            )}
            {busy && !streaming && (
              <p className="px-1 text-sm text-muted">{t.trener.thinking}</p>
            )}
          </div>

          {sttHint && (
            <p className="text-xs text-[color:var(--warn)]">{sttHint}</p>
          )}

          <Composer
            value={input}
            onChange={setInput}
            onSend={() => void sendSeller(input)}
            onMic={() => void toggleMic()}
            onType={() => {
              if (speaking) stopSpeaking();
            }}
            recording={recording}
            busy={busy}
          />
        </div>
      </PageShell>
    );
  }

  // result
  return (
    <PageShell title={t.natija.title}>
      {score && <ResultView score={score} transcript={turns} onAgain={reset} />}
    </PageShell>
  );
}
