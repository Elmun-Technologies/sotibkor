/**
 * GET /api/stats — joriy foydalanuvchi statistikasi (XP, daraja, streak).
 * Supabase sozlanmagan bo'lsa (kalitsiz demo) — MOCK_USER qaytadi.
 * Kalit bo'lsa keyinchalik DB'dan o'qiladi (TODO).
 */

import { MOCK_USER } from "@/lib/mock";
import { hasSupabase } from "@/lib/config";
import type { UserStats } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  let stats: UserStats = MOCK_USER;

  if (hasSupabase()) {
    // TODO: Supabase'dan haqiqiy foydalanuvchi statistikasini o'qish.
    stats = MOCK_USER;
  }

  return Response.json(stats);
}
