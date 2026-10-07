/**
 * GET /api/leaderboard — preview fixture only.
 * Weekly ranking is not yet backed by persisted organization/user activity.
 */

import { MOCK_LEADERBOARD } from "@/lib/mock";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ entries: MOCK_LEADERBOARD, demo: true });
}
