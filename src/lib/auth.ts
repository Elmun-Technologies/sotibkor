/**
 * Ro'yxatdan o'tish (mock) — trening boshlashdan oldin majburiy.
 * Menejer (individual sotuvchi) va ROP (jamoa rahbari) uchun alohida.
 *
 * DIQQAT: bu localStorage MOCK — haqiqiy autentifikatsiya EMAS. Real auth
 * Supabase orqali (issue #8/#9). Parol saqlanmaydi.
 */

export type Role = "menejer" | "rop";

export interface AuthUser {
  role: Role;
  name: string;
  company?: string;
  team?: string; // ROP uchun jamoa nomi
}

const KEY = "sotibkor_user";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as AuthUser;
    if (u && (u.role === "menejer" || u.role === "rop") && u.name) return u;
    return null;
  } catch {
    return null;
  }
}

export function isRegistered(): boolean {
  return getUser() !== null;
}

export function register(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* localStorage yo'q — e'tiborsiz */
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* e'tiborsiz */
  }
}
