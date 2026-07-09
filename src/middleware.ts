/**
 * Middleware — himoyalangan (app) bo'limini qo'riqlaydi.
 *
 * Sessiya cookie'sini JWT bilan tekshiradi (jose — Edge runtime'da ishlaydi).
 * Sessiya yo'q/yaroqsiz bo'lsa /boshlash?next=... ga yo'naltiradi.
 *
 * DIQQAT: bu yerda auth-server.ts import QILINMAYDI, chunki u "server-only"
 * (next/headers, bcryptjs) — Edge middleware'da ishlamaydi. Shuning uchun
 * jwtVerify to'g'ridan-to'g'ri chaqiriladi.
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "sotibkor_session";

// Himoyalangan yo'llar (src/app/(app)/* URL segmentlari).
const PROTECTED = [
  "/home",
  "/trener",
  "/dars",
  "/analitika",
  "/etirozlar",
  "/muzokaralar",
  "/profil",
  "/qongiroq",
  "/reyting",
  "/tariflar",
  "/vazifalar",
  "/yutuqlar",
];

function secret(): Uint8Array | null {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const key = secret();
  let ok = false;
  if (token && key) {
    try {
      await jwtVerify(token, key);
      ok = true;
    } catch {
      ok = false;
    }
  }

  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/boshlash";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/home/:path*",
    "/trener/:path*",
    "/dars/:path*",
    "/analitika/:path*",
    "/etirozlar/:path*",
    "/muzokaralar/:path*",
    "/profil/:path*",
    "/qongiroq/:path*",
    "/reyting/:path*",
    "/tariflar/:path*",
    "/vazifalar/:path*",
    "/yutuqlar/:path*",
  ],
};
