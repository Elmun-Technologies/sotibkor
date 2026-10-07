/**
 * GET /api/stats — preview fixture only.
 * User XP, sessions and streak are not yet aggregated from persisted sessions.
 */

import { MOCK_USER } from "@/lib/mock";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ...MOCK_USER, demo: true });
}
