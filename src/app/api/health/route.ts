/**
 * GET /api/health — provayder tayyorligi (real kalitlar ulanganini tekshirish).
 * Maxfiy qiymatlarni QAYTARMAYDI — faqat sozlangan/sozlanmagan holati.
 */

import { hasOpenAI, hasAisha, hasSupabase } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  return Response.json({
    ok: true,
    providers: {
      openai: hasOpenAI(),
      aisha: hasAisha(),
      supabase: hasSupabase(),
    },
    mode: hasOpenAI() && hasAisha() ? "live" : "mock",
  });
}
