/**
 * Server-only autentifikatsiya yordamchisi — self-hosted (Supabase Auth' SIZ).
 *
 * - Parol: bcrypt bilan hash/verify (ochiq parol HECH QAChON saqlanmaydi).
 * - Sessiya: JWT (jose bilan HS256), httpOnly + secure + sameSite=lax cookie.
 * - JWT_SECRET faqat process.env dan (server-only). Sozlanmagan bo'lsa xato tashlaydi
 *   — auth uchun sir majburiy (mock emas).
 *
 * DIQQAT: bu fayl faqat server (route handler / middleware) tomonda import qilinadi.
 */

import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sotibkor_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 kun

export interface SessionClaims extends JWTPayload {
  uid: string;
  role: "menejer" | "rop";
  name: string;
}

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "JWT_SECRET sozlanmagan yoki juda qisqa (kamida 16 belgi). .env ni tekshiring.",
    );
  }
  return new TextEncoder().encode(s);
}

/** Parolni bcrypt bilan hash qiladi. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/** Ochiq parolni saqlangan hash bilan solishtiradi. */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** JWT sessiya tokenini imzolaydi. */
export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());
}

/** Tokenni tekshiradi. Yaroqsiz bo'lsa null. */
export async function verifySession(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.uid === "string" &&
      (payload.role === "menejer" || payload.role === "rop") &&
      typeof payload.name === "string"
    ) {
      return payload as SessionClaims;
    }
    return null;
  } catch {
    return null;
  }
}

/** Sessiya cookie'sini o'rnatadi (login/register'dan keyin). */
export async function setSessionCookie(token: string): Promise<void> {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

/** Sessiya cookie'sini o'chiradi (logout). */
export async function clearSessionCookie(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

/** Joriy so'rovdagi sessiyani o'qiydi (server komponent / route). */
export async function currentSession(): Promise<SessionClaims | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}
