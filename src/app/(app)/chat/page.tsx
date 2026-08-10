"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getMessages } from "@/i18n";
import {
  PageShell,
  Card,
  Button,
  AppLoading,
  Illustration,
  Reveal,
} from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { getUser } from "@/lib/auth";
import {
  CHANNELS,
  channelMessages,
  channelCount,
  postMessage,
  type ChannelId,
  type ChatMessage,
} from "@/lib/chat";

const t = getMessages();

const CHANNEL_ICON: Record<ChannelId, string> = {
  umumiy: "💬",
  narx: "💰",
  qongiroq: "📞",
  motivatsiya: "🔥",
  "savol-javob": "❓",
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return (p[0]?.[0] ?? "?").toUpperCase();
}

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatPage() {
  const ready = useAuthGate("/chat");
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ChannelId>("umumiy");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) setName(getUser()?.name ?? t.chat.you);
  }, [ready]);

  // Kanal xabarlarini o'qiymiz + kanal sonlarini yangilaymiz.
  useEffect(() => {
    if (!ready) return;
    setMessages(channelMessages(channel));
    const c: Record<string, number> = {};
    for (const ch of CHANNELS) c[ch] = channelCount(ch);
    setCounts(c);
  }, [ready, channel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const next = postMessage(channel, name, input, new Date().toISOString());
    setMessages(next);
    setCounts((prev) => ({ ...prev, [channel]: (prev[channel] ?? 0) + 1 }));
    setInput("");
  };

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.chat.title} lead={t.chat.subtitle}>
      {/* Jamoa tanishtiruv qismi — nima uchun va qanday ishtirok etish */}
      <Reveal>
        <Card className="mb-5 flex items-start gap-4 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--accent)]/12 text-[color:var(--accent)]">
            <Illustration name="team" size={26} className="text-[color:var(--accent)]" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t.chat.heroTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">{t.chat.heroLead}</p>
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Mavzular */}
        <Reveal>
          <div className="flex flex-col gap-2">
            <div className="eyebrow px-1">{t.chat.channelsTitle}</div>
            {CHANNELS.map((ch) => {
              const active = ch === channel;
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                    active
                      ? "border-transparent bg-ink text-onink"
                      : "border-border text-foreground hover:border-foreground/30"
                  }`}
                >
                  <span aria-hidden className="text-base leading-none">
                    {CHANNEL_ICON[ch]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {t.chat.channels[ch].name}
                    </span>
                    <span
                      className={`block truncate text-xs ${active ? "text-[color:var(--on-ink-muted)]" : "text-muted"}`}
                    >
                      {t.chat.channels[ch].desc}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 font-mono text-xs tabular-nums ${active ? "text-[color:var(--on-ink-muted)]" : "text-faint"}`}
                  >
                    {counts[ch] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Xabarlar */}
        <Reveal delay={0.05}>
          <Card className="flex min-h-[60vh] flex-col gap-3 p-0">
            <div className="flex items-center gap-2 border-b border-hair px-5 py-3">
              <span aria-hidden className="text-base leading-none">
                {CHANNEL_ICON[channel]}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  #{t.chat.channels[channel].name}
                </div>
                <div className="text-xs text-muted">
                  {t.chat.channels[channel].desc}
                </div>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-2"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <p className="text-sm text-muted">{t.chat.empty}</p>
                  <div className="flex flex-col items-stretch gap-2">
                    {t.chat.starters.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInput(s)}
                        className="rounded-full border border-border px-4 py-2 text-left text-xs text-muted transition hover:border-foreground/30 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) =>
                  reduce ? (
                    <div key={m.id} className="flex gap-3">
                      <Avatar m={m} name={name} />
                      <Bubble m={m} />
                    </div>
                  ) : (
                    <motion.div
                      key={m.id}
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Avatar m={m} name={name} />
                      <Bubble m={m} />
                    </motion.div>
                  ),
                )
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-hair px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t.chat.placeholder}
                aria-label={t.chat.placeholder}
                className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40"
              />
              <Button onClick={send} disabled={!input.trim()}>
                {t.chat.send}
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
      <p className="mt-3 text-xs text-faint">{t.chat.note}</p>
    </PageShell>
  );
}

function Avatar({ m, name }: { m: ChatMessage; name: string }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
      style={{
        background: m.mine ? "var(--ink)" : "var(--surface2)",
        color: m.mine ? "var(--on-ink)" : "var(--foreground)",
      }}
      aria-hidden
    >
      {initials(m.mine ? name : m.author)}
    </span>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-foreground">
          {m.mine ? t.chat.you : m.author}
        </span>
        <span className="font-mono text-[11px] text-faint">
          {timeLabel(m.at)}
        </span>
      </div>
      <p className="text-[15px] leading-relaxed text-foreground">{m.text}</p>
    </div>
  );
}
