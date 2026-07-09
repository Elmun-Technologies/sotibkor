/**
 * POST /api/auth/login — kirish (self-hosted).
 *
 * Body: { email, password }
 * - Email bo'yicha user topiladi, parol bcrypt bilan tekshiriladi.
 * - Xato bo'lsa 401 (email yoki parol noto'g'ri — qaysi biri aytilmaydi).
 * - Muvaffaqiyatda: JWT sessiya cookie o'rnatiladi.
 */

import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/users";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
} from "@/lib/auth-server";

export const runtime = "nodejs";

interface Body {
  email?: unknown;
  password?: unknown;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email va parol kiritilishi shart" },
      { status: 400 },
    );
  }

  try {
    const user = await findUserByEmail(email);
    const ok = user
      ? await verifyPassword(password, user.password_hash)
      : false;

    if (!user || !ok) {
      return NextResponse.json(
        { error: "Email yoki parol noto'g'ri" },
        { status: 401 },
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
