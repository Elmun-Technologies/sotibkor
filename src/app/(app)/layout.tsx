import type { ReactNode } from "react";
import { AppShell } from "@/components/ui";

/**
 * Autentifikatsiyalangan bo'lim layouti — sidebar qobig'i.
 * Sahifalarning o'zi (home, trener, ...) ro'yxatdan o'tishni tekshiradi va
 * kerak bo'lsa /boshlash ga yo'naltiradi.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
