/**
 * GET /api/team-stats — ROP (jamoa boshlig'i) uchun jamoa statistikasi
 * (har sotuvchi bo'yicha voronka qamrovi + eng zaif e'tiroz turi).
 * Supabase sozlanmagan bo'lsa (kalitsiz demo) — MOCK_TEAM qaytadi.
 * Kalit bo'lsa keyinchalik DB'dan o'qiladi (TODO — users.org_id/team_name
 * bo'yicha guruhlash + sessions/scores'dan real voronka hisoblash kerak).
 */

import { MOCK_TEAM } from "@/lib/mock";
import { hasSupabase } from "@/lib/config";
import type { TeamRow } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  let team: TeamRow[] = MOCK_TEAM;

  if (hasSupabase()) {
    // TODO: users.org_id/team_name bo'yicha guruhlab, sessions/scores'dan
    // real voronka/e'tiroz statistikasini hisoblash.
    team = MOCK_TEAM;
  }

  return Response.json({ team });
}
