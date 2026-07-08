/**
 * GET /api/leaderboard — haftalik reyting jadvali.
 * Supabase sozlanmagan bo'lsa (kalitsiz demo) — MOCK_LEADERBOARD qaytadi.
 * Kalit bo'lsa keyinchalik DB'dan o'qiladi (TODO).
 */

import { MOCK_LEADERBOARD } from "@/lib/mock";
import { hasSupabase } from "@/lib/config";
import type { LeaderboardEntry } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  let entries: LeaderboardEntry[] = MOCK_LEADERBOARD;

  if (hasSupabase()) {
    // TODO: Supabase'dan haftalik XP bo'yicha reytingni o'qish (real user bilan isMe).
    entries = MOCK_LEADERBOARD;
  }

  return Response.json({ entries });
}
