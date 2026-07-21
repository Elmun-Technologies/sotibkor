"use client";

/**
 * Foydalanuvchi yaratgan mijozlar — localStorage'da saqlanadi (jonli, reload'da
 * yo'qolmaydi) va, `hasSupabaseAuth()` yoqilgan bo'lsa, hisobga ham bog'lanadi
 * (`custom_clients` jadvali, RLS "faqat o'zini") — auth.ts/chat.ts bilan bir
 * xil naqsh: kesh sinxron o'qiladi, Supabase yozuvi fon rejimida (fire-and-forget).
 */

import type { SohaKey, PersonaKey } from "./content";
import { hasSupabaseAuth } from "./config";

export interface CustomClient {
  id: string;
  name: string;
  company: string;
  soha: SohaKey;
  persona: PersonaKey;
  desc: string;
}

const KEY = "sotibkor_custom_clients";

export function getCustomClients(): CustomClient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as CustomClient[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomClients(list: CustomClient[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* localStorage yo'q — e'tiborsiz */
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Yangi mijozni saqlaydi — localStorage keshga darrov, Supabase ulangan
 * bo'lsa hisobga ham fon rejimida yozadi. Yangilangan ro'yxatni qaytaradi.
 */
export function addCustomClient(
  input: Omit<CustomClient, "id">,
): CustomClient[] {
  const client: CustomClient = { ...input, id: newId() };
  const next = [...getCustomClients(), client];
  saveCustomClients(next);
  if (hasSupabaseAuth()) void pushCustomClientToSupabase(client);
  return next;
}

async function pushCustomClientToSupabase(c: CustomClient): Promise<void> {
  try {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("custom_clients").insert({
      id: c.id,
      user_id: user.id,
      name: c.name,
      company: c.company || null,
      soha: c.soha,
      persona: c.persona,
      description: c.desc || null,
    });
  } catch {
    /* tarmoq xatosi — localStorage kesh allaqachon yangilangan, foydalanuvchi to'xtamaydi */
  }
}

interface CustomClientRow {
  id: string;
  name: string;
  company: string | null;
  soha: SohaKey;
  persona: PersonaKey;
  description: string | null;
}

/**
 * Live Supabase sessiyasi bo'lsa, hisobga bog'langan mijozlarni localStorage
 * keshiga ko'chiradi (qaytgan foydalanuvchi, yangi qurilma) va yangilangan
 * ro'yxatni qaytaradi. Supabase yo'q yoki sessiya bo'lmasa — lokal keshni
 * o'zgartirmasdan qaytaradi (mock rejim buzilmaydi).
 */
export async function syncCustomClientsFromSupabase(): Promise<CustomClient[]> {
  if (!hasSupabaseAuth()) return getCustomClients();
  try {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return getCustomClients();

    const { data, error } = await supabase
      .from("custom_clients")
      .select("id,name,company,soha,persona,description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .returns<CustomClientRow[]>();
    if (error || !data) return getCustomClients();

    const remote: CustomClient[] = data.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company ?? "",
      soha: r.soha,
      persona: r.persona,
      desc: r.description ?? "",
    }));
    saveCustomClients(remote);
    return remote;
  } catch {
    return getCustomClients();
  }
}
