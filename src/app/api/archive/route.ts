/**
 * GET /api/archive — joriy foydalanuvchining yakunlangan suhbatlari ro'yxati.
 * Supabase Auth yo'q yoki foydalanuvchi aniqlanmasa — bo'sh ro'yxat (mock
 * rejimda suhbat tarixi umuman saqlanmaydi, CLAUDE.md §3).
 */

import { currentUserId } from "@/lib/supabase/user";
import { listSessions } from "@/lib/db/sessions";

export const runtime = "nodejs";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ sessions: [] });

  const sessions = await listSessions(userId);
  return Response.json({ sessions });
}
