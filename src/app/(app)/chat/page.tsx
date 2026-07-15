"use client";

import { useEffect, useRef, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
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
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Kanallar */}
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
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-transparent bg-ink text-onink"
                    : "border-border text-foreground hover:border-foreground/30"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    #{t.chat.channels[ch].name}
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

        {/* Xabarlar */}
        <Card className="flex min-h-[60vh] flex-col gap-3 p-0">
          <div className="border-b border-hair px-5 py-3">
            <div className="text-sm font-semibold text-foreground">
              #{t.chat.channels[channel].name}
            </div>
            <div className="text-xs text-muted">
              {t.chat.channels[channel].desc}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-2"
          >
            {messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                {t.chat.empty}
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                    style={{
                      background: m.mine ? "var(--ink)" : "var(--surface2)",
                      color: m.mine ? "var(--on-ink)" : "var(--foreground)",
                    }}
                  >
                    {initials(m.author)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {m.mine ? t.chat.you : m.author}
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {timeLabel(m.at)}
                      </span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground">
                      {m.text}
                    </p>
                  </div>
                </div>
              ))
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
      </div>
      <p className="mt-3 text-xs text-faint">{t.chat.note}</p>
    </PageShell>
  );
}
