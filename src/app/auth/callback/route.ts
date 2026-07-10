/**
 * GET /auth/callback — Google OAuth muvaffaqiyatli bo'lgach Supabase shu yerga
 * qaytaradi (`code` bilan). Kodni sessiyaga almashtiramiz, so'ng foydalanuvchi
 * holatiga qarab keyingi qadamga yo'naltiramiz:
 *  - `users` qatori yo'q (birinchi marta Google bilan kirdi) -> rol tanlash
 *  - qator bor, lekin onboarding tugamagan -> /onboarding
 *  - hammasi tayyor -> so'ralgan "next" (yoki /home)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Faqat ilova ichidagi nisbiy yo'lni ruxsat etadi (ochiq redirect'dan himoya). */
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/home";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/boshlash?error=auth`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/boshlash?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/boshlash?error=auth`);
  }

  const { data: row } = await supabase
    .from("users")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(
      `${origin}/boshlash?step=role&next=${encodeURIComponent(next)}`,
    );
  }
  if (!row.onboarded) {
    return NextResponse.redirect(
      `${origin}/onboarding?next=${encodeURIComponent(next)}`,
    );
  }
  return NextResponse.redirect(`${origin}${next}`);
}
