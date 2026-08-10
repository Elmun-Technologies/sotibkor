/**
 * Mahalliy (mock rejim) suhbatlar tarixi — localStorage'ga saqlanadi.
 *
 * Haqiqiy Supabase yo'q bo'lganda ham foydalanuvchi o'z mashqlari tarixini
 * ko'radi ("Mening qo'ng'iroqlarim", /reyting, /arxiv kabi joylarda).
 * Supabase sozlanganida bu fonda yoziladi va haqiqiy sessiyalar bilan
 * birga ko'rsatilishi uchun mo'ljallangan (keyingi bosqich).
 */

export interface LocalSession {
  id: string;
  at: number; // epoch ms
  soha: string;
  persona: string;
  level: number;
  total: number;
  /** Eng zaif bo'lim (breakdown'dan hisoblangan) — maslahat uchun. */
  weak?: string | null;
}

const KEY = "sotibkor_sessions";

function read(): LocalSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LocalSession[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: LocalSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    /* localStorage to'la yoki yo'q — e'tiborsiz */
  }
}

/** Oxirgi suhbatlar (yangidan eskiga), cheklangan soni. */
export function getSessions(limit?: number): LocalSession[] {
  const all = read().sort((a, b) => b.at - a.at);
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

/** Suhbatni qo'shadi va saqlangan ro'yxatni qaytaradi. */
export function addSession(s: LocalSession): LocalSession[] {
  const next = [s, ...read()];
  write(next);
  return next;
}

/** Eng zaif bo'limni breakdown'dan topadi (eng past ball). */
export function weakestBreakdown(b: Record<string, number>): string | null {
  let minKey: string | null = null;
  let min = Infinity;
  for (const [k, v] of Object.entries(b)) {
    if (v < min) {
      min = v;
      minKey = k;
    }
  }
  return minKey;
}
