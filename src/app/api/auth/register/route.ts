/**
 * POST /api/auth/register — ro'yxatdan o'tish (self-hosted).
 *
 * Body: { email, password, name, role: "menejer"|"rop", company?, team? }
 * - Parol bcrypt bilan hash qilinadi (ochiq parol saqlanmaydi).
 * - Email band bo'lsa 409 qaytadi.
 * - Muvaffaqiyatda: JWT sessiya cookie o'rnatiladi va user (parolsiz) qaytadi.
 */

import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db/users";
import {
  hashPassword,
  signSession,
  setSessionCookie,
} from "@/lib/auth-server";
import type { Role } from "@/lib/auth";

export const runtime = "nodejs";

interface Body {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  role?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role: Role = body.role === "rop" ? "rop" : "menejer";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email noto'g'ri" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Parol kamida 8 belgi bo'lishi kerak" },
      { status: 400 },
    );
  }
  if (!name) {
    return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        { error: "Bu email allaqachon ro'yxatdan o'tgan" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      fullName: name,
      role,
    });
    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi yaratilmadi" },
        { status: 409 },
      );
    }

    const token = await signSession({
      uid: user.id,
      role: user.role,
      name: user.full_name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server xatosi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
