/**
 * GET /api/team-stats — preview fixture only.
 * Real organization-scoped analytics are not implemented; callers must honor
 * `demo: true` and must never present these rows as customer/team results.
 */

import { MOCK_TEAM } from "@/lib/mock";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ team: MOCK_TEAM, demo: true });
}
