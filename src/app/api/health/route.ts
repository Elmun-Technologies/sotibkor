/**
 * GET /api/health — provayder tayyorligi (real kalitlar ulanganini tekshirish).
 * Maxfiy qiymatlarni QAYTARMAYDI — faqat sozlangan/sozlanmagan holati.
 */

import { hasAnthropic, hasAisha, hasSupabase } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  return Response.json({
    ok: true,
    providers: {
      anthropic: hasAnthropic(),
      aisha: hasAisha(),
      supabase: hasSupabase(),
    },
    mode: hasAnthropic() && hasAisha() ? "live" : "mock",
  });
}
