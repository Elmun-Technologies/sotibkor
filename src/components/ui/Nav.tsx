"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getMessages } from "@/i18n";
import { ThemeToggle } from "./ThemeToggle";

const t = getMessages();

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition sm:px-4 sm:text-sm ${
        active
          ? "bg-ink text-onink"
          : "text-muted hover:bg-foreground/[.05] hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav className="card mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-mono text-[12px] font-bold uppercase tracking-[0.08em] sm:text-sm sm:tracking-[0.14em]"
        >
          {t.nav.brand}
        </Link>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <NavLink href="/trener">{t.nav.trener}</NavLink>
          <NavLink href="/reyting">{t.nav.reyting}</NavLink>
          <NavLink href="/profil">{t.nav.profil}</NavLink>
          <div className="ml-0.5 sm:ml-1">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
