/**
 * GET /api/health — process liveness va konfiguratsiya holati.
 * Maxfiy qiymatlarni qaytarmaydi; `ok` faqat server tirikligini bildiradi.
 */

import {
  hasAisha,
  hasOpenAI,
  hasSupabase,
  hasSupabaseAuth,
  vendorReadiness,
} from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  const readiness = vendorReadiness();
  return Response.json(
    {
      ok: true,
      mode: readiness.voice ? "live" : "mock",
      providers: {
        openai: hasOpenAI(),
        aisha: hasAisha(),
        supabase: hasSupabase(),
        supabaseAuth: hasSupabaseAuth(),
      },
      readiness: {
        voice: readiness.voice,
        database: readiness.db,
        auth: readiness.auth,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
