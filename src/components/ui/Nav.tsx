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
      className={`rounded-lg px-2.5 py-1.5 text-sm transition sm:px-3 ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-bold uppercase tracking-wider"
        >
          <span className="neon-text">{t.nav.brand}</span>
        </Link>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <NavLink href="/trener">{t.nav.trener}</NavLink>
          <NavLink href="/reyting">{t.nav.reyting}</NavLink>
          <NavLink href="/profil">{t.nav.profil}</NavLink>
          <div className="ml-1 sm:ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
