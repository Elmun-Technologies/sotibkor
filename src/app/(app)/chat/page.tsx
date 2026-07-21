"use client";

import { useEffect, useRef, useState } from "react";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button, AppLoading } from "@/components/ui";
import { useAuthGate } from "@/lib/useAuthGate";
import { getUser } from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/config";
import {
  CHANNELS,
  channelMessages,
  channelCount,
  postMessage,
  currentChatUserId,
  fetchChannelMessagesRemote,
  channelCountsRemote,
  postMessageRemote,
  subscribeChannel,
  type ChannelId,
  type ChatMessage,
} from "@/lib/chat";

const LIVE = hasSupabaseAuth();

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
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelId>("umumiy");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) setName(getUser()?.name ?? t.chat.you);
  }, [ready]);

  useEffect(() => {
    if (!ready || !LIVE) return;
    void currentChatUserId().then(setMyUserId);
  }, [ready]);

  // Kanal xabarlarini o'qiymiz + kanal sonlarini yangilaymiz. Live rejimda
  // Supabase'dan o'qiladi va yangi xabarlarga real vaqtli obuna bo'linadi.
  useEffect(() => {
    if (!ready) return;

    if (!LIVE) {
      setMessages(channelMessages(channel));
      const c: Record<string, number> = {};
      for (const ch of CHANNELS) c[ch] = channelCount(ch);
      setCounts(c);
      return;
    }

    let active = true;
    void fetchChannelMessagesRemote(channel, myUserId).then((msgs) => {
      if (active) setMessages(msgs);
    });
    void channelCountsRemote().then((c) => {
      if (active) setCounts((prev) => ({ ...prev, ...c }));
    });
    const unsubscribe = subscribeChannel(channel, myUserId, (m) => {
      setMessages((prev) =>
        prev.some((p) => p.id === m.id) ? prev : [...prev, m],
      );
      setCounts((prev) => ({ ...prev, [channel]: (prev[channel] ?? 0) + 1 }));
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [ready, channel, myUserId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (!LIVE) {
      const next = postMessage(channel, name, text, new Date().toISOString());
      setMessages(next);
      setCounts((prev) => ({ ...prev, [channel]: (prev[channel] ?? 0) + 1 }));
      return;
    }

    void postMessageRemote(channel, name, text).then((msg) => {
      if (!msg) return;
      setMessages((prev) =>
        prev.some((p) => p.id === msg.id) ? prev : [...prev, msg],
      );
    });
  };

  if (!ready) return <AppLoading />;

  return (
    <PageShell title={t.chat.title} lead={t.chat.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* Kanallar */}
        <div className="flex flex-col gap-2">
          <div className="eyebrow px-1">{t.chat.channelsTitle}</div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {CHANNELS.map((ch) => {
              const active = ch === channel;
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition lg:w-full lg:shrink ${
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
                      className={`hidden truncate text-xs lg:block ${active ? "text-[color:var(--on-ink-muted)]" : "text-muted"}`}
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
              <div className="flex flex-col items-center gap-2 py-14 text-center">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full bg-surface2 text-lg"
                  aria-hidden
                >
                  💬
                </span>
                <p className="text-sm text-muted">{t.chat.empty}</p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.mine ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                    style={{
                      background: m.mine ? "var(--ink)" : "var(--surface2)",
                      color: m.mine ? "var(--on-ink)" : "var(--foreground)",
                    }}
                  >
                    {initials(m.author)}
                  </span>
                  <div
                    className={`flex min-w-0 max-w-[80%] flex-col gap-1 sm:max-w-[70%] ${m.mine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`flex items-baseline gap-2 ${m.mine ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {m.mine ? t.chat.you : m.author}
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {timeLabel(m.at)}
                      </span>
                    </div>
                    <p
                      className={`min-w-0 rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed ${
                        m.mine
                          ? "rounded-tr-sm bg-ink text-onink"
                          : "rounded-tl-sm bg-surface2 text-foreground"
                      }`}
                      style={{ overflowWrap: "anywhere" }}
                    >
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
