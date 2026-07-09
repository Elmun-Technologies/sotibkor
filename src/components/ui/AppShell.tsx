"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getMessages } from "@/i18n";
import { getUser, logout, syncSession, type AuthUser } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SupportWidget } from "./SupportWidget";

const t = getMessages();

type IconKey =
  | "home"
  | "vazifalar"
  | "qongiroq"
  | "muzokaralar"
  | "etirozlar"
  | "dars"
  | "analitika"
  | "reyting"
  | "yutuqlar"
  | "profil";

/** Yengil chiziqli ikonlar (editorial, neytral) — currentColor. */
function Icon({ name }: { name: IconKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      );
    case "vazifalar":
      return (
        <svg {...common}>
          <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
          <rect x="4" y="6" width="16" height="15" rx="2" />
          <path d="m8.5 13 2 2 4-4" />
        </svg>
      );
    case "qongiroq":
      return (
        <svg {...common}>
          <path d="M4.5 5.5c0 8 6 14 14 14 .9 0 1.5-.7 1.5-1.5v-2.3c0-.7-.5-1.3-1.2-1.5l-2.6-.6c-.6-.1-1.2.1-1.5.6l-.6.9c-2-1-3.6-2.6-4.6-4.6l.9-.6c.5-.3.7-.9.6-1.5l-.6-2.6C10.1 5 9.5 4.5 8.8 4.5H6.5C5.7 4.5 5 5.1 5 6l-.5-.5Z" />
        </svg>
      );
    case "muzokaralar":
      return (
        <svg {...common}>
          <path d="M8 12h2l1.5-2 3 4L16 12h2" />
          <path d="M4 12a8 8 0 0 1 14.8-4.2" />
          <path d="M20 12a8 8 0 0 1-14.8 4.2" />
          <path d="M17 5.5 18.8 7.8 16.5 8.5" />
          <path d="M7 18.5 5.2 16.2 7.5 15.5" />
        </svg>
      );
    case "etirozlar":
      return (
        <svg {...common}>
          <path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l5-4h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
        </svg>
      );
    case "dars":
      return (
        <svg {...common}>
          <path d="M12 4 3 8l9 4 9-4-9-4Z" />
          <path d="M7 10.5V15c0 1.1 2.2 2 5 2s5-.9 5-2v-4.5" />
        </svg>
      );
    case "analitika":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M4 16 9 10l3.5 3L20 6" />
          <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12.5" cy="13" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="20" cy="6" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "reyting":
      return (
        <svg {...common}>
          <path d="M7 21V11" />
          <path d="M12 21V4" />
          <path d="M17 21v-7" />
        </svg>
      );
    case "yutuqlar":
      return (
        <svg {...common}>
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
          <path d="M7 5.5H4.5a1 1 0 0 0-1 1.3 4 4 0 0 0 3.5 2.7" />
          <path d="M17 5.5h2.5a1 1 0 0 1 1 1.3 4 4 0 0 1-3.5 2.7" />
          <path d="M12 14v3" />
          <path d="M9 20.5h6" />
          <path d="M10 17.5h4v3h-4z" />
        </svg>
      );
    case "profil":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
        </svg>
      );
  }
}

interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}

const NAV: NavItem[] = [
  { href: "/home", label: t.nav.home, icon: "home" },
  { href: "/vazifalar", label: t.nav.vazifalar, icon: "vazifalar" },
  { href: "/qongiroq", label: t.nav.qongiroq, icon: "qongiroq" },
  { href: "/muzokaralar", label: t.nav.muzokaralar, icon: "muzokaralar" },
  { href: "/etirozlar", label: t.nav.etirozlar, icon: "etirozlar" },
  { href: "/dars", label: t.nav.dars, icon: "dars" },
  { href: "/analitika", label: t.nav.analitika, icon: "analitika" },
  { href: "/reyting", label: t.nav.reyting, icon: "reyting" },
  { href: "/yutuqlar", label: t.nav.yutuqlar, icon: "yutuqlar" },
  { href: "/profil", label: t.nav.profil, icon: "profil" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function SidebarInner({
  user,
  onNavigate,
  onLogout,
}: {
  user: AuthUser | null;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const roleLabel = user?.role === "rop" ? t.nav.roleRop : t.nav.roleMenejer;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Brend */}
      <Link
        href="/home"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-onink">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4.5 5.5c0 8 6 14 14 14" />
            <path d="M14 3c3.9 0 7 3.1 7 7" />
            <path d="M14 7c1.7 0 3 1.3 3 3" />
          </svg>
        </span>
        <span className="font-mono text-[12px] font-bold uppercase leading-tight tracking-[0.08em]">
          {t.nav.brand}
        </span>
      </Link>

      {/* Navigatsiya */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                active
                  ? "bg-ink text-onink"
                  : "text-muted hover:bg-foreground/[.05] hover:text-foreground"
              }`}
            >
              <span
                className={
                  active
                    ? "text-onink"
                    : "text-faint transition group-hover:text-foreground"
                }
              >
                <Icon name={item.icon} />
              </span>
              {item.label}
              {item.href === "/qongiroq" && (
                <span
                  className={`ml-auto h-1.5 w-1.5 rounded-full ${
                    active ? "bg-onink/70" : "bg-[color:var(--good)]"
                  }`}
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bepul suhbatlar karta */}
      <div className="rounded-2xl border border-[color:var(--good)]/30 bg-[color:var(--good)]/[.06] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--good)]">
            {t.nav.free}
          </span>
          <span className="font-mono text-xs tabular-nums text-muted">5/5</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/[.08]">
          <div
            className="h-full rounded-full bg-[color:var(--good)]"
            style={{ width: "100%" }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{t.nav.freeCalls}</p>
        <Link
          href="/tariflar"
          onClick={onNavigate}
          className="mt-3 flex w-full items-center justify-center rounded-full bg-ink px-4 py-2 text-xs font-medium text-onink transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          {t.nav.plan}
        </Link>
      </div>

      {/* Foydalanuvchi karta */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface2 p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-onink">
          {initials(user?.name ?? "?")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {user?.name ?? "—"}
          </div>
          <div className="truncate text-xs text-muted">{roleLabel}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label={t.nav.logout}
          className="grid h-8 w-8 place-items-center rounded-full text-faint transition-all duration-150 hover:bg-foreground/[.05] hover:text-foreground active:scale-[0.93]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
            <path d="M10 8 6 12l4 4" />
            <path d="M6 12h11" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <ThemeToggle />
      </div>
    </div>
  );
}

/**
 * Autentifikatsiyalangan ilova qobig'i: chapda doimiy sidebar (desktop),
 * mobilda drawer + top-bar. Kontent o'ng ustunда.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Avval keshdan (tez), keyin serverdan (haqiqiy sessiya) hidratsiya.
    setUser(getUser());
    void syncSession().then((u) => setUser(u));
  }, []);

  // Marshrut o'zgarsa drawer yopiladi
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 border-r border-border bg-surface px-3 py-4 lg:block">
        <SidebarInner user={user} onNavigate={() => {}} onLogout={onLogout} />
      </aside>

      {/* Mobil top-bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link
          href="/home"
          className="font-mono text-[12px] font-bold uppercase tracking-[0.08em]"
        >
          {t.nav.brand}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t.nav.menu}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-all duration-150 hover:bg-foreground/[.05] active:scale-[0.93]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobil drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t.nav.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85%] border-r border-border bg-surface px-3 py-4 shadow-xl">
            <SidebarInner
              user={user}
              onNavigate={() => setOpen(false)}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}

      {/* Kontent */}
      <div className="min-w-0 flex-1">{children}</div>

      <SupportWidget />
    </div>
  );
}
