/**
 * Supabase sessiya (auth) tokenlarini har so'rovda yangilab turadi — @supabase/ssr
 * talab qiladigan standart pattern. Supabase sozlanmagan bo'lsa (mock rejim) —
 * hech narsa qilmaydi, oddiy `next()`.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Sessiya muddati tugagan bo'lsa — shu yerda yangilanadi (side effect).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // MUHIM (CLAUDE.md §4 — < 2s ovoz aylanasi): api/* bu yerdan ataylab
  // chetlashtirilgan. Hech bir route handler cookie orqali Supabase
  // sessiyasini o'qimaydi (faqat /auth/callback, u o'zi kod almashtiradi) —
  // shuning uchun middleware'ning sessiya-yangilash so'rovi STT/TTS/LLM
  // chaqiruvlariga foydasiz qo'shimcha latency qo'shardi.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
