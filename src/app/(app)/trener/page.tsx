"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getMessages } from "@/i18n";
import { useAuthGate } from "@/lib/useAuthGate";
import { useVoiceActivity } from "@/lib/useVoiceActivity";
import {
  PERSONALAR,
  isPersonaKey,
  isRejimKey,
  isSohaKey,
  isTilRejimKey,
  personaForObjection,
  type PersonaKey,
  type SohaKey,
  type RejimKey,
  type TilRejimKey,
} from "@/lib/content";
import { SentenceStreamer } from "@/lib/sentence";
import {
  fetchWithTimeout,
  firstTokenWatchdog,
  isTimeoutError,
  VOICE_TIMEOUTS,
} from "@/lib/fetchDeadline";
import { uploadClip } from "@/lib/archiveClient";
import { markFirstSessionDone, markPlanDayDone } from "@/lib/progress";
import { recordChallengeScore } from "@/lib/challenge";
import {
  interestScore,
  liveHint,
  type LiveHint,
  type ObjectionType,
} from "@/lib/coach";
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
const MicCheck = dynamic(
  () => import("@/components/trener/MicCheck").then((m) => m.MicCheck),
  { ssr: false, loading: () => <AppLoading /> },
);

const t = getMessages();

type Turn = { role: "user" | "assistant"; content: string };
type Stage = "setup" | "miccheck" | "chat" | "result";
type Metrics = {
  /** Sotuvchi gapirib bo'lgach STT matni tayyor bo'lguncha (faqat ovoz kirishida). */
  stt: number | null;
  /** So'rov ketgandan LLM birinchi tokeniga qadar. */
  llmFirst: number | null;
  /** Birinchi gap tayyor bo'lgach birinchi tovushga qadar (TTS). */
  ttsFirst: number | null;
  /** To'liq aylana: sotuvchi gapirib bo'lgandan birinchi tovushgacha (TTFB). */
  total: number | null;
};

export default function TrenerPage() {
  const ready = useAuthGate(undefined, { requireOnboarded: false });
  const [stage, setStage] = useState<Stage>("setup");
  const [soha, setSoha] = useState<SohaKey>("mebel");
  const [persona, setPersona] = useState<PersonaKey>("qimmatchi");
  const [level, setLevel] = useState(2);
  const [rejim, setRejim] = useState<RejimKey>("qongiroq");
  const [tilRejimi, setTilRejimi] = useState<TilRejimKey>("aralash");
  // Ssenariy presetidan kelgan mijoz ismi/lavozimi (masalan /qongiroq'dan) —
  // bo'lmasa persona standart ismiga (defaultName) tushamiz.
  const [clientName, setClientName] = useState<string | null>(null);
  const [clientLavozim, setClientLavozim] = useState<string | null>(null);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interest, setInterest] = useState<number | null>(null);
  const [coachHint, setCoachHint] = useState<LiveHint | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    stt: null,
    llmFirst: null,
    ttsFirst: null,
    total: null,
  });
  // Zaxira (fallback) rejimi haqida qisqa signal — sekin ulanish/VPN'da nima
  // bo'lganini foydalanuvchiga ko'rsatadi (dialog jim qolmaydi).
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [sttHint, setSttHint] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [trialExhausted, setTrialExhausted] = useState(false);
  const [recommendedPersona, setRecommendedPersona] =
    useState<PersonaKey | null>(null);

  // Ssenariy nomi bo'lmasa personaning standart ismiga tushamiz — shu bilan
  // AI doim jonli ism bilan tanishtiradi (CloseMe-solishtiruv #4).
  const effectiveClientName = clientName ?? PERSONALAR[persona].defaultName;

  const ttsModeRef = useRef<"probe" | "aisha" | "web">("probe");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelRef = useRef(false); // barge-in: joriy nutqni bekor qilish
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Arxiv (Batch C): audio klip yuklash uchun — ref orqali o'qiladi (playSentence/
  // toggleMic'ning stabil identity'siga sessionId'ni dep sifatida qo'shmaslik uchun).
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  const mijozClipRef = useRef(0);
  const sotuvchiClipRef = useRef(0);
  // Haftalik challenge (10x-5): shu sessiya challenge bo'lsa, yakunda ball
  // lokal eng yaxshi challenge baliga yoziladi.
  const isChallengeRef = useRef(false);

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
    const qt = p.get("tilRejimi");
    if (qt && isTilRejimKey(qt)) setTilRejimi(qt);
    const qn = p.get("name");
    if (qn) setClientName(qn);
    const qlz = p.get("lavozim");
    if (qlz) setClientLavozim(qlz);
    isChallengeRef.current = p.get("challenge") === "1";
    setStage("miccheck");
  }, [ready]);

  // Spaced-repetition tavsiyasi (issue #9): oxirgi safar eng ko'p qiynagan
  // e'tiroz turiga mos personani oldindan tanlaymiz. Dars sahifasidan aniq
  // preset kelgan bo'lsa (?persona=...) — bunga tegmaymiz.
  useEffect(() => {
    if (!ready) return;
    if (new URLSearchParams(window.location.search).get("persona")) return;
    fetch("/api/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { weakObjection?: ObjectionType | null } | null) => {
        if (!data) return;
        const rec = personaForObjection(data.weakObjection ?? null);
        if (rec) {
          setRecommendedPersona(rec);
          setPersona(rec);
        }
      })
      .catch(() => {});
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
      // pause() "ended" hodisasini chaqirmaydi — playSentence ichidagi kutayotgan
      // Promise'ni shu bilan darrov yechamiz (aks holda barge-in'da doim osilib qoladi).
      audioRef.current.dispatchEvent(new Event("ended"));
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  // To'liq barge-in (issue #7): mijoz gapirayotganda sotuvchi tugma bosmasdan
  // shunchaki gapirsa ham, ovoz faolligi (VAD) aniqlab persona nutqini darrov
  // to'xtatadi. Faqat "chat" bosqichida va persona haqiqatan gapirayotganda
  // (push-to-talk yozib olish bilan to'qnashmasin uchun) faollashadi.
  useVoiceActivity({
    enabled: stage === "chat",
    listening: speaking && !recording,
    onVoice: stopSpeaking,
  });

  const playSentence = useCallback(
    async (text: string, onStart: () => void): Promise<void> => {
      if (cancelRef.current) return;
      if (ttsModeRef.current !== "web") {
        try {
          const res = await fetchWithTimeout(
            "/api/tts",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            },
            VOICE_TIMEOUTS.tts,
          );
          if (res.ok) {
            ttsModeRef.current = "aisha";
            if (cancelRef.current) return;
            const buf = await res.arrayBuffer();
            const mimeType = res.headers.get("Content-Type") ?? "audio/mpeg";
            // Arxiv (Batch C): mijoz ovozini fon rejimida saqlaymiz — kutmaymiz,
            // audio pleyer kritik yo'liga (STT→LLM→TTS) hech qanday ta'sir qilmaydi.
            if (sessionIdRef.current) {
              uploadClip(
                sessionIdRef.current,
                "mijoz",
                mijozClipRef.current++,
                new Blob([buf], { type: mimeType }),
              );
            }
            const url = URL.createObjectURL(new Blob([buf]));
            const audio = new Audio(url);
            audioRef.current = audio;
            const done = (resolve: () => void) => {
              URL.revokeObjectURL(url);
              resolve();
            };
            return await new Promise<void>((resolve) => {
              audio.onplay = onStart;
              audio.onended = () => done(resolve);
              audio.onerror = () => done(resolve);
              void audio.play().catch(() => done(resolve));
            });
          }
          // Aisha xato qaytardi (501/502) — brauzer ovoziga o'tamiz.
          ttsModeRef.current = "web";
          setFallbackNote(t.trener.fallbackWeb);
        } catch (err) {
          // Deadline oshdi yoki tarmoq uzildi (sekin ulanish/VPN) — dialog
          // osilib qolmasligi uchun darrov brauzer ovoziga o'tamiz.
          ttsModeRef.current = "web";
          setFallbackNote(
            isTimeoutError(err) ? t.trener.fallbackSlow : t.trener.fallbackWeb,
          );
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
          // `onstart` ba'zi muhitlarda (ovozsiz/headless) ishlamaydi — TTFB
          // o'lchovi yo'qolmasligi uchun boshlanishni shu yerda ham belgilaymiz
          // (chaqiruvchi firstAudio==null bilan takrorlanishdan himoyalangan).
          onStart();
        });
      }
      onStart();
    },
    [],
  );

  const sendSeller = useCallback(
    async (text: string, loop?: { start: number; sttMs: number }) => {
      const clean = text.trim();
      if (!clean || busy) return;
      stopSpeaking();
      cancelRef.current = false;
      setFallbackNote(null);

      const history: Turn[] = [...turns, { role: "user", content: clean }];
      setTurns(history);
      setInput("");
      setBusy(true);
      setStreaming("");
      // Qiziqishni sotuvchi replikasidan darrov yangilaymiz
      setInterest(interestScore(history));
      // Jonli murabbiy (10x-2): sof evristika, LLM chaqiruvi yo'q — ovoz
      // aylanasiga kechikish qo'shmaydi (CLAUDE.md §4).
      setCoachHint(liveHint(history));

      const sendStart = performance.now();
      // TTFB'ni sotuvchi GAPIRIB BO'LGAN paytdan o'lchaymiz (ovoz kirishida
      // STT vaqti ham to'liq aylanaga kiradi). Matn kiritishda loop yo'q —
      // hisob so'rov ketgan paytdan boshlanadi.
      const loopStart = loop?.start ?? sendStart;
      const sttMs = loop?.sttMs ?? null;
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
                stt: sttMs != null ? Math.round(sttMs) : null,
                llmFirst:
                  firstToken != null
                    ? Math.round(firstToken - sendStart)
                    : null,
                ttsFirst:
                  firstSentenceReady != null
                    ? Math.round(firstAudio - firstSentenceReady)
                    : null,
                total: Math.round(firstAudio - loopStart),
              });
            }
          });
        }
        draining = false;
        setSpeaking(false);
      };

      // Birinchi token watchdog: LLM oqimi belgilangan vaqtda birinchi baytni
      // bermasa (osilgan ulanish/VPN), so'rovni uzamiz — dialog muzlab qolmaydi.
      const chatController = new AbortController();
      const watchdog = firstTokenWatchdog(VOICE_TIMEOUTS.llmFirstToken, () =>
        chatController.abort(),
      );

      let acc = "";
      try {
        setSttHint(null);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soha,
            persona,
            level,
            rejim,
            tilRejimi,
            mijozIsmi: effectiveClientName,
            history,
          }),
          signal: chatController.signal,
        });
        if (!res.ok) throw new Error(`chat_failed_${res.status}`);
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        const sp = new SentenceStreamer({ earlyFirst: true });
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = dec.decode(value, { stream: true });
            if (firstToken == null) {
              firstToken = performance.now();
              watchdog.armed(); // birinchi token keldi — watchdog o'chadi
            }
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
        // Tarmoq xatosisiz, lekin javob bo'sh kelsa ham foydalanuvchiga
        // tushunarli signal beramiz (masalan stream boshlanib, darrov uzilsa).
        if (!acc.trim()) setSttHint(t.trener.chatError);
      } catch {
        // Watchdog uzgan (osilish) yoki tarmoq xatosi — bir xil signal.
        setSttHint(t.trener.chatError);
      } finally {
        watchdog.clear();
        const full: Turn[] = [
          ...history,
          { role: "assistant", content: acc.trim() || "..." },
        ];
        setTurns(full);
        setStreaming("");
        setBusy(false);
      }
    },
    [
      busy,
      turns,
      soha,
      persona,
      level,
      rejim,
      tilRejimi,
      effectiveClientName,
      playSentence,
      stopSpeaking,
    ],
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
        // Arxiv (Batch C): sotuvchi ovozini fon rejimida saqlaymiz.
        if (sessionIdRef.current) {
          uploadClip(
            sessionIdRef.current,
            "sotuvchi",
            sotuvchiClipRef.current++,
            blob,
          );
        }
        const form = new FormData();
        form.append("audio", blob, "rec.webm");
        // To'liq aylana (TTFB) shu paytdan boshlanadi — sotuvchi gapirib bo'ldi.
        const micStop = performance.now();
        try {
          const res = await fetchWithTimeout(
            "/api/stt",
            { method: "POST", body: form },
            VOICE_TIMEOUTS.stt,
          );
          if (res.ok) {
            const data = (await res.json()) as { text?: string };
            const sttMs = performance.now() - micStop;
            if (data.text)
              await sendSeller(data.text, { start: micStop, sttMs });
          } else {
            setSttHint(t.trener.sttUnavailable);
          }
        } catch (err) {
          // Deadline oshdi (sekin ulanish/VPN) yoki tarmoq xatosi — matn rejimiga.
          setSttHint(
            isTimeoutError(err)
              ? t.trener.fallbackStt
              : t.trener.sttUnavailable,
          );
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
      // Onboarding checklist uchun HAQIQIY signal (mock rejimda ham jonli):
      // birinchi yakunlangan suhbatni lokal belgilaymiz.
      markFirstSessionDone();
      // Haftalik reja (10x-4): bugungi kun mashqi bajarildi deb belgilaymiz
      // (dushanba=0 asosli). Bugun qaysi persona bo'lishidan qat'i nazar —
      // "bugun mashq qilding" signali.
      markPlanDayDone((new Date().getDay() + 6) % 7);
      // Haftalik challenge (10x-5): challenge sessiyasi bo'lsa ballni yozamiz.
      if (isChallengeRef.current) recordChallengeScore(data.total);
      // Sessiyani orqa fonda saqlaymiz — Supabase sozlanmagan bo'lsa
      // route jimgina no-op qiladi, natija ekraniga bu bog'liq emas.
      void fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          sessionId,
          soha,
          persona,
          level,
          transcript: turns,
          score: data,
          status: "finished",
        }),
      }).catch(() => {});
    } catch {
      setSttHint(t.trener.scoreError);
    } finally {
      setScoring(false);
    }
  }, [turns, soha, persona, level, rejim, sessionId, stopSpeaking]);

  /** Yangi suhbatni serverda ochadi — sinov limiti shu yerda bir marta tekshiriladi. */
  const startSession = useCallback(async () => {
    setStarting(true);
    setSttHint(null);
    setTrialExhausted(false);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", soha, persona, level }),
      });
      if (res.status === 402) {
        setTrialExhausted(true);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as { sessionId?: string | null };
        setSessionId(data.sessionId ?? null);
      }
      setStage("chat");
    } catch {
      // Tarmoq xatosi — kartasiz/mock oqimni bloklamaymiz, shunchaki davom etamiz.
      setStage("chat");
    } finally {
      setStarting(false);
    }
  }, [soha, persona, level]);

  const reset = () => {
    stopSpeaking();
    setStage("setup");
    setTurns([]);
    setStreaming("");
    setScore(null);
    setInterest(null);
    setCoachHint(null);
    setSessionId(null);
    setClientName(null);
    setClientLavozim(null);
    setMetrics({ stt: null, llmFirst: null, ttsFirst: null, total: null });
    setFallbackNote(null);
    ttsModeRef.current = "probe";
    mijozClipRef.current = 0;
    sotuvchiClipRef.current = 0;
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
          tilRejimi={tilRejimi}
          onSoha={setSoha}
          onPersona={setPersona}
          onLevel={setLevel}
          onRejim={setRejim}
          onTilRejimi={setTilRejimi}
          onStart={() => setStage("miccheck")}
          recommendedPersona={recommendedPersona}
          starting={starting}
          errorHint={trialExhausted ? t.trener.trialExhausted : null}
          errorCta={
            trialExhausted
              ? { label: t.trener.trialExhaustedCta, href: "/tariflar" }
              : null
          }
        />
      </PageShell>
    );
  }

  if (stage === "miccheck") {
    return (
      <PageShell>
        <MicCheck
          onBack={() => setStage("setup")}
          onContinue={() => void startSession()}
          starting={starting}
        />
        {trialExhausted && (
          <p role="alert" className="mt-3 text-sm text-[color:var(--bad)]">
            {t.trener.trialExhausted}{" "}
            <a href="/tariflar" className="underline underline-offset-2">
              {t.trener.trialExhaustedCta}
            </a>
          </p>
        )}
      </PageShell>
    );
  }

  if (stage === "chat") {
    return (
      <PageShell>
        <CallView
          clientName={effectiveClientName}
          clientLavozim={clientLavozim}
          persona={persona}
          personaLabel={t.personalar[persona]}
          sohaLabel={t.sohalar[soha]}
          rejimLabel={
            rejim === "qongiroq"
              ? t.trener.rejimQongiroq
              : t.trener.rejimYuzmaYuz
          }
          level={level}
          interest={interest}
          coachHint={coachHint}
          metrics={metrics}
          fallbackNote={fallbackNote}
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
          <p
            role="alert"
            className="mt-3 text-center text-xs text-[color:var(--warn)]"
          >
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
