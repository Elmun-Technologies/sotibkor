/**
 * POST /api/auth/logout — chiqish. Sessiya cookie'sini o'chiradi.
 */

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
