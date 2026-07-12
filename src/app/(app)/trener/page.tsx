"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getMessages } from "@/i18n";
import { useAuthGate } from "@/lib/useAuthGate";
import {
  isPersonaKey,
  isRejimKey,
  isSohaKey,
  type PersonaKey,
  type SohaKey,
  type RejimKey,
} from "@/lib/content";
import { SentenceStreamer } from "@/lib/sentence";
import { interestScore } from "@/lib/coach";
import type { ScoreResult } from "@/lib/scoring";
import { PageShell, AppLoading } from "@/components/ui";
import { SetupPanel } from "@/components/trener";

// Faqat "setup" bosqichida ko'rinadigan sahifa uchun CallView/ResultView'ni
// ilk yuklamaga qo'shmaymiz — ovoz-aylana kodi (mikrofon/audio) va natija
// ekrani foydalanuvchi darrov kerak qilmaguncha alohida chunk'da kutadi.
const CallView = dynamic(
  () => import("@/components/trener/CallView").then((m) => m.CallView),
  { ssr: false, loading: () => <AppLoading /> },
);
const ResultView = dynamic(
  () => import("@/components/trener/ResultView").then((m) => m.ResultView),
  { ssr: false, loading: () => <AppLoading /> },
);

const t = getMessages();

type Turn = { role: "user" | "assistant"; content: string };
type Stage = "setup" | "chat" | "result";
type Metrics = {
  llmFirst: number | null;
  ttsFirst: number | null;
  total: number | null;
};

export default function TrenerPage() {
  const ready = useAuthGate(undefined, { requireOnboarded: false });
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
  const [metrics, setMetrics] = useState<Metrics>({
    llmFirst: null,
    ttsFirst: null,
    total: null,
  });
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [sttHint, setSttHint] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);

  const ttsModeRef = useRef<"probe" | "aisha" | "web">("probe");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef(false); // barge-in: joriy nutqni bekor qilish
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dars sahifasidan preset (/trener?soha=..&persona=..&level=..&rejim=..):
  // to'g'ri parametrlar bo'lsa sozlash tayyor va suhbat darrov boshlanadi.
  // Dars sahifasidan preset (/trener?soha=..&persona=..&level=..&rejim=..):
  // auth tasdiqlangach query'ni o'qib, to'g'ri bo'lsa suhbatni darrov boshlaydi.
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams(window.location.search);
    const qs = p.get("soha");
    const qp = p.get("persona");
    if (!qs || !qp || !isSohaKey(qs) || !isPersonaKey(qp)) return;
    setSoha(qs);
    setPersona(qp);
    const ql = Number(p.get("level"));
    if (Number.isFinite(ql) && ql >= 1 && ql <= 6) setLevel(Math.floor(ql));
    const qr = p.get("rejim");
    if (qr && isRejimKey(qr)) setRejim(qr);
    setStage("chat");
  }, [ready]);

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
        setRecognizing(true); // STT javobini kutayapmiz — foydalanuvchiga feedback
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
        } finally {
          setRecognizing(false);
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
      // Xato javob (502/400) yoki noto'g'ri shakl bo'lsa — result ekraniga
      // o'tmaymiz (aks holda ResultView undefined breakdown'da qulaydi).
      const data = res.ok ? ((await res.json()) as Partial<ScoreResult>) : null;
      if (!data || typeof data.total !== "number" || !data.breakdown) {
        setSttHint(t.trener.scoreError);
        return;
      }
      setScore(data as ScoreResult);
      setStage("result");
    } catch {
      setSttHint(t.trener.scoreError);
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
    setMetrics({ llmFirst: null, ttsFirst: null, total: null });
    ttsModeRef.current = "probe";
  };

  // ---------- render ----------
  if (!ready) return <AppLoading />;

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
        <CallView
          personaLabel={t.personalar[persona]}
          sohaLabel={t.sohalar[soha]}
          rejimLabel={
            rejim === "qongiroq"
              ? t.trener.rejimQongiroq
              : t.trener.rejimYuzmaYuz
          }
          level={level}
          interest={interest}
          cycleMs={metrics.total}
          turns={turns}
          streaming={streaming}
          input={input}
          busy={busy}
          recording={recording}
          recognizing={recognizing}
          speaking={speaking}
          scoring={scoring}
          onInput={setInput}
          onSend={() => void sendSeller(input)}
          onMic={() => void toggleMic()}
          onType={() => {
            if (speaking) stopSpeaking();
          }}
          onFinish={finish}
        />
        {sttHint && (
          <p className="mt-3 text-center text-xs text-[color:var(--warn)]">
            {sttHint}
          </p>
        )}
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
