"use client";

/**
 * Community chat — o'zbek sotuvchilar bir-biriga yordam beradigan umumiy
 * chat + kanallar.
 *
 * Ikki rejim:
 *  - Mock (Supabase yo'q): xabarlar localStorage'da (seed + saqlangan) —
 *    quyidagi sof funksiyalar (`channelMessages`/`postMessage`/`channelCount`).
 *  - Live (`hasSupabaseAuth()`): xabarlar `chat_messages` jadvalida, barcha
 *    foydalanuvchilar Supabase Realtime (`postgres_changes`) orqali jonli
 *    ko'radi — pastdagi `*Remote`/`subscribeChannel` funksiyalari.
 */

import { hasSupabaseAuth } from "./config";

export type ChannelId =
  "umumiy" | "narx" | "qongiroq" | "motivatsiya" | "savol-javob";

export const CHANNELS: ChannelId[] = [
  "umumiy",
  "narx",
  "qongiroq",
  "motivatsiya",
  "savol-javob",
];

export interface ChatMessage {
  id: string;
  channel: ChannelId;
  author: string;
  text: string;
  at: string; // ISO
  mine?: boolean;
}

/** Seed (demo) xabarlar — kanallar jonli ko'rinishi uchun. */
const SEED: ChatMessage[] = [
  {
    id: "s1",
    channel: "umumiy",
    author: "Dilshod A.",
    text: "Salom hammaga! Bugun 5 ta sovuq qo'ng'iroq qildim, 2 tasi uchrashuvga rozi bo'ldi 🔥",
    at: "2026-07-14T08:12:00Z",
  },
  {
    id: "s2",
    channel: "umumiy",
    author: "Nigora K.",
    text: "Zo'r-ku! Menga ham maslahat bering, mijoz 'o'ylab ko'raman' desa nima deysiz?",
    at: "2026-07-14T08:20:00Z",
  },
  {
    id: "s3",
    channel: "umumiy",
    author: "Sardor M.",
    text: "Men 'aniq nima to'xtatib turibdi — narxmi, muddatmi?' deb so'rayman. Ochiq savol yaxshi ishlaydi.",
    at: "2026-07-14T08:25:00Z",
  },
  {
    id: "n1",
    channel: "narx",
    author: "Kamola R.",
    text: "'Qimmat' deganda men narxni emas, qiymatni solishtiraman. Kafolat + xizmatni qo'shsam, arzon chiqadi.",
    at: "2026-07-14T09:00:00Z",
  },
  {
    id: "n2",
    channel: "narx",
    author: "Jasur T.",
    text: "Bo'lib to'lashni kuniga bir choy puliga aylantirsangiz — mijoz yumshaydi 😄",
    at: "2026-07-14T09:10:00Z",
  },
  {
    id: "q1",
    channel: "qongiroq",
    author: "Malika S.",
    text: "Birinchi 30 soniya eng muhim. Ismini aytib, bitta foydani darrov aytaman.",
    at: "2026-07-14T10:00:00Z",
  },
  {
    id: "m1",
    channel: "motivatsiya",
    author: "Bekzod X.",
    text: "'Yo'q' — bu shunchaki 'hozircha yetarli ma'lumot yo'q' degani. Davom etamiz! 💪",
    at: "2026-07-14T11:00:00Z",
  },
  {
    id: "sj1",
    channel: "savol-javob",
    author: "Feruza N.",
    text: "Mijoz raqobatchini ro'kach qilsa, siz qanday javob berasiz?",
    at: "2026-07-14T12:00:00Z",
  },
  {
    id: "sj2",
    channel: "savol-javob",
    author: "Otabek D.",
    text: "Bahslashmayman — farqni yonma-yon qo'yaman, o'zi solishtiradi. Ishlaydi 👍",
    at: "2026-07-14T12:05:00Z",
  },
];

const KEY = "sotibkor_chat_messages";

function loadStored(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveStored(list: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* e'tiborsiz */
  }
}

/** Kanaldagi barcha xabarlar (seed + saqlangan), vaqt bo'yicha tartiblangan. */
export function channelMessages(channel: ChannelId): ChatMessage[] {
  const all = [...SEED, ...loadStored()].filter((m) => m.channel === channel);
  return all.sort((a, b) => a.at.localeCompare(b.at));
}

/** Kanaldagi xabarlar soni (kanal ro'yxatida ko'rsatish uchun). */
export function channelCount(channel: ChannelId): number {
  return (
    SEED.filter((m) => m.channel === channel).length +
    loadStored().filter((m) => m.channel === channel).length
  );
}

/** Yangi xabar joylaydi (foydalanuvchi nomidan) — saqlab, ro'yxatni qaytaradi. */
export function postMessage(
  channel: ChannelId,
  author: string,
  text: string,
  atIso: string,
): ChatMessage[] {
  const clean = text.trim();
  if (!clean) return channelMessages(channel);
  const msg: ChatMessage = {
    id: `u-${atIso}-${Math.round(clean.length)}`,
    channel,
    author,
    text: clean,
    at: atIso,
    mine: true,
  };
  saveStored([...loadStored(), msg]);
  return channelMessages(channel);
}

/* ---- Live (Supabase Realtime) — `hasSupabaseAuth()` yoqilgan bo'lsa ---- */

interface ChatMessageRow {
  id: string;
  channel: ChannelId;
  user_id: string | null;
  author: string;
  text: string;
  created_at: string;
}

function rowToMessage(
  row: ChatMessageRow,
  myUserId: string | null,
): ChatMessage {
  return {
    id: row.id,
    channel: row.channel,
    author: row.author,
    text: row.text,
    at: row.created_at,
    mine: row.user_id !== null && row.user_id === myUserId,
  };
}

/** Joriy foydalanuvchi id'si (Supabase Auth). Sessiya yo'q bo'lsa `null`. */
export async function currentChatUserId(): Promise<string | null> {
  if (!hasSupabaseAuth()) return null;
  try {
    const { createClient } = await import("./supabase/browser");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Kanaldagi so'nggi xabarlarni Supabase'dan o'qiydi (eng ko'p 200 ta, eskisi birinchi). */
export async function fetchChannelMessagesRemote(
  channel: ChannelId,
  myUserId: string | null,
): Promise<ChatMessage[]> {
  if (!hasSupabaseAuth()) return [];
  try {
    const { createClient } = await import("./supabase/browser");
    const { data, error } = await createClient()
      .from("chat_messages")
      .select("id,channel,user_id,author,text,created_at")
      .eq("channel", channel)
      .order("created_at", { ascending: true })
      .limit(200)
      .returns<ChatMessageRow[]>();
    if (error || !data) return [];
    return data.map((r) => rowToMessage(r, myUserId));
  } catch {
    return [];
  }
}

/** Har kanal bo'yicha xabarlar soni (Supabase'dan). */
export async function channelCountsRemote(): Promise<
  Partial<Record<ChannelId, number>>
> {
  if (!hasSupabaseAuth()) return {};
  try {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    const entries = await Promise.all(
      CHANNELS.map(async (ch) => {
        const { count } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("channel", ch);
        return [ch, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

/** Yangi xabarni Supabase'ga yozadi. Muvaffaqiyatsiz bo'lsa `null`. */
export async function postMessageRemote(
  channel: ChannelId,
  author: string,
  text: string,
): Promise<ChatMessage | null> {
  const clean = text.trim().slice(0, 1000);
  if (!clean || !hasSupabaseAuth()) return null;
  try {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ channel, user_id: user.id, author, text: clean })
      .select("id,channel,user_id,author,text,created_at")
      .single<ChatMessageRow>();
    if (error || !data) return null;
    return rowToMessage(data, user.id);
  } catch {
    return null;
  }
}

/**
 * Kanaldagi yangi xabarlarga (INSERT) jonli obuna bo'ladi. Tozalash uchun
 * qaytarilgan funksiyani chaqiring (masalan `useEffect` cleanup'da).
 * Supabase yo'q bo'lsa — no-op obuna (jimgina hech narsa qilmaydi).
 */
export function subscribeChannel(
  channel: ChannelId,
  myUserId: string | null,
  onInsert: (message: ChatMessage) => void,
): () => void {
  if (!hasSupabaseAuth()) return () => {};

  let cancelled = false;
  let cleanup: (() => void) | null = null;

  void (async () => {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    if (cancelled) return;

    const rtChannel = supabase
      .channel(`chat-${channel}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel=eq.${channel}`,
        },
        (payload) => {
          onInsert(rowToMessage(payload.new as ChatMessageRow, myUserId));
        },
      )
      .subscribe();

    cleanup = () => void supabase.removeChannel(rtChannel);
    if (cancelled) cleanup();
  })();

  return () => {
    cancelled = true;
    cleanup?.();
  };
}
