"use client";

/**
 * Community chat — o'zbek sotuvchilar bir-biriga yordam beradigan umumiy
 * chat + kanallar. Xabarlar localStorage'da saqlanadi (jonli, real Supabase
 * ulanmaguncha lokal — auth keshi bilan bir xil yondashuv). Seed xabarlar
 * (boshqa sotuvchilardan) demo ma'lumot — kanallar bo'sh ko'rinmasin uchun.
 */

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
