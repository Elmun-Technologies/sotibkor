/**
 * GET /api/archive/[id] — bitta suhbatning to'liq tafsiloti (transkript +
 * baho + audio klip URL'lari). Faqat egasi ko'ra oladi (`getSessionDetail`
 * `user_id` bo'yicha filtrlaydi).
 */

import { NextRequest } from "next/server";
import { currentUserId } from "@/lib/supabase/user";
import { getSessionDetail } from "@/lib/db/sessions";
import { getSessionAudioClips } from "@/lib/audioStorage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const detail = await getSessionDetail(id, userId);
  if (!detail) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const audio = await getSessionAudioClips(id);
  return Response.json({ ...detail, audio });
}
