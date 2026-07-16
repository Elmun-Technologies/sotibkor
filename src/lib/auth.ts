/**
 * Ro'yxatdan o'tish — localStorage keshi (sinxron o'qish uchun, UI gating)
 * + ixtiyoriy real Supabase Auth (Google OAuth) qatlami.
 *
 * Supabase sozlanmagan bo'lsa (`hasSupabaseAuth()` false) — hammasi avvalgidek
 * sof localStorage mock. Sozlangan bo'lsa — Google orqali kirilgach, real
 * `users` qatori localStorage keshiga ko'chiriladi (`syncFromSupabase`), shu
 * tufayli qolgan barcha sahifalar (sinxron `getUser()`/`isOnboarded()` o'qish)
 * o'zgarishsiz ishlayveradi. Manba haqiqati — Supabase; localStorage faqat kesh.
 */

import { hasSupabaseAuth } from "./config";

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

/**
 * Demo uchun rolni almashtiradi (menejer ↔ rop) — real auth'da rol
 * onboardingда belgilanadi. Kalitsiz demo'da ROP panelini ko'rish uchun.
 * Foydalanuvchi bo'lmasa jimgina no-op.
 */
export function setUserRole(role: Role): void {
  if (typeof window === "undefined") return;
  const u = getUser();
  if (!u) return;
  register({ ...u, role });
}

export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* e'tiborsiz */
  }
  if (hasSupabaseAuth()) {
    const { createClient } = await import("./supabase/browser");
    await createClient()
      .auth.signOut()
      .catch(() => {
        /* tarmoq xatosi — localStorage allaqachon tozalandi, yetarli */
      });
  }
}

/* ---- Onboarding profili (nima/kimga sotasan) ---- */

const PROFILE_KEY = "sotibkor_profile";

export interface Profile {
  product?: string; // nima sotasan
  usp?: string; // UTP / farq
  audience?: string; // maqsadli auditoriya
  spheres: string[]; // kimga sotasan (soha kalitlari/nomlari)
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
  if (hasSupabaseAuth()) {
    void pushProfileToSupabase(p);
  }
}

export function isOnboarded(): boolean {
  return getProfile()?.onboarded === true;
}

/* ---- Real Supabase Auth (Google) — faqat hasSupabaseAuth() true bo'lsa ---- */

interface UsersRow {
  id: string;
  email: string | null;
  avatar_url: string | null;
  full_name: string | null;
  role: Role;
  company: string | null;
  team_name: string | null;
  product: string | null;
  usp: string | null;
  audience: string | null;
  spheres: string[] | null;
  onboarded: boolean;
}

/** Google OAuth oynasini ochadi. Muvaffaqiyatli bo'lsa /auth/callback'ga qaytadi. */
export async function signInWithGoogle(next: string): Promise<void> {
  const { createClient } = await import("./supabase/browser");
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}

/**
 * Google bilan birinchi marta kirgan foydalanuvchi rolni tanlagach chaqiriladi.
 * `users` qatorini yaratadi (yoki yangilaydi) va localStorage keshiga ko'chiradi.
 */
export async function completeGoogleSignup(
  role: Role,
  extra?: { company?: string; team?: string },
): Promise<AuthUser> {
  const { createClient } = await import("./supabase/browser");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessiya topilmadi — qaytadan kiring.");

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Foydalanuvchi";

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    full_name: name,
    role,
    company: extra?.company ?? null,
    team_name: extra?.team ?? null,
  });
  if (error) throw error;

  const authUser: AuthUser = {
    role,
    name,
    company: extra?.company,
    team: extra?.team,
  };
  register(authUser);
  return authUser;
}

/**
 * Live Supabase sessiyasi bo'lsa, `users` qatorini localStorage keshiga
 * ko'chiradi (qaytgan foydalanuvchi, yangi brauzer/qurilma). Sessiya yoki
 * qator bo'lmasa — jimgina hech narsa qilmaydi (mock rejim buzilmaydi).
 */
export async function syncFromSupabase(): Promise<void> {
  if (!hasSupabaseAuth()) return;
  const { createClient } = await import("./supabase/browser");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("users")
    .select(
      "id,email,avatar_url,full_name,role,company,team_name,product,usp,audience,spheres,onboarded",
    )
    .eq("id", user.id)
    .maybeSingle<UsersRow>();
  if (!data) return;

  register({
    role: data.role,
    name: data.full_name ?? data.email ?? "Foydalanuvchi",
    company: data.company ?? undefined,
    team: data.team_name ?? undefined,
  });
  saveProfileLocalOnly({
    product: data.product ?? undefined,
    usp: data.usp ?? undefined,
    audience: data.audience ?? undefined,
    spheres: data.spheres ?? [],
    onboarded: data.onboarded,
  });
}

/** saveProfile'ning Supabase'ga qayta yozmaydigan versiyasi (sync paytida cheksiz tsikl bo'lmasin). */
function saveProfileLocalOnly(p: Profile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* e'tiborsiz */
  }
}

/** `saveProfile` chaqirilganda (masalan /profil tahriri) Supabase'dagi qatorni ham yangilaydi. */
async function pushProfileToSupabase(p: Profile): Promise<void> {
  try {
    const { createClient } = await import("./supabase/browser");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("users")
      .update({
        product: p.product ?? null,
        usp: p.usp ?? null,
        audience: p.audience ?? null,
        spheres: p.spheres,
        onboarded: p.onboarded,
      })
      .eq("id", user.id);
  } catch {
    /* tarmoq xatosi — localStorage kesh allaqachon yangilangan, foydalanuvchi to'xtamaydi */
  }
}
