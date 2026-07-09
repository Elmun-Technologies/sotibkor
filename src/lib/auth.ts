/**
 * Autentifikatsiya (self-hosted) — frontend qatlami.
 *
 * O'ZGARISH: avval bu localStorage MOCK edi. Endi haqiqiy auth server orqali:
 *   - Sessiya httpOnly cookie'da (JWT) — bu yerda ko'rinmaydi/o'qilmaydi.
 *   - /api/auth/{register,login,logout,me} route'lari bilan ishlaydi.
 *   - localStorage faqat NON-SENSITIVE keshdir (id, role, name) — tez UX uchun.
 *     Haqiqiy himoya cookie + middleware'da. localStorage'da parol YO'Q.
 *
 * getUser()/isRegistered()/isOnboarded() sinxron qoladi (mavjud sahifalar
 * shunday chaqiradi) — ular keshdan o'qiydi. syncSession() serverdan hidratsiya.
 */

export type Role = "menejer" | "rop";

export interface AuthUser {
  id?: string;
  role: Role;
  name: string;
  company?: string;
  team?: string;
}

const KEY = "sotibkor_user";
const PROFILE_KEY = "sotibkor_profile";

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

function setUserCache(u: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  } catch {
    /* e'tiborsiz */
  }
}

export function isRegistered(): boolean {
  return getUser() !== null;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  name: string;
  role: Role;
  company?: string;
  team?: string;
}

interface ApiResult {
  ok: boolean;
  error?: string;
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function registerAccount(input: RegisterInput): Promise<ApiResult> {
  const res = await postJson("/api/auth/register", input);
  const data = (await res.json().catch(() => ({}))) as {
    user?: AuthUser;
    error?: string;
  };
  if (!res.ok || !data.user) {
    return { ok: false, error: data.error ?? "Ro'yxatdan o'tishda xato" };
  }
  setUserCache({
    id: data.user.id,
    role: data.user.role,
    name: data.user.name,
    company: input.company?.trim() || undefined,
    team: input.role === "rop" ? input.team?.trim() || undefined : undefined,
  });
  return { ok: true };
}

export async function loginAccount(creds: Credentials): Promise<ApiResult> {
  const res = await postJson("/api/auth/login", creds);
  const data = (await res.json().catch(() => ({}))) as {
    user?: AuthUser;
    error?: string;
  };
  if (!res.ok || !data.user) {
    return { ok: false, error: data.error ?? "Kirishda xato" };
  }
  setUserCache({
    id: data.user.id,
    role: data.user.role,
    name: data.user.name,
  });
  return { ok: true };
}

export async function syncSession(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) {
      setUserCache(null);
      return null;
    }
    const data = (await res.json()) as { user?: AuthUser | null };
    if (data.user) {
      const prev = getUser();
      setUserCache({ ...prev, ...data.user });
      return getUser();
    }
    setUserCache(null);
    return null;
  } catch {
    return getUser();
  }
}

export async function logout(): Promise<void> {
  try {
    await postJson("/api/auth/logout", {});
  } catch {
    /* e'tiborsiz */
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* e'tiborsiz */
    }
  }
}

export interface Profile {
  product?: string;
  usp?: string;
  audience?: string;
  spheres: string[];
  onboarded: boolean;
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* e'tiborsiz */
  }
}

export function isOnboarded(): boolean {
  return getProfile()?.onboarded === true;
}
//START
