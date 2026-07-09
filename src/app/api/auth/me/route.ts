/**
 * GET /api/auth/me — joriy sessiyani qaytaradi.
 * Sessiya yo'q bo'lsa 401. Frontend auth.ts shu orqali user'ni oladi.
 */

import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const s = await currentSession();
  if (!s) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: s.uid, role: s.role, name: s.name },
  });
}
