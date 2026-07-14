"use client";

/**
 * Foydalanuvchi yaratgan mijozlar — localStorage'da saqlanadi (jonli, reload'da
 * yo'qolmaydi). Real Supabase ulangach serverga ko'chiriladi; hozircha lokal
 * (auth keshi bilan bir xil yondashuv).
 */

import type { SohaKey, PersonaKey } from "./content";

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
