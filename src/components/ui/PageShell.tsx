import type { ReactNode } from "react";

export interface PageShellProps {
  children: ReactNode;
  title?: string;
  lead?: string;
}

/**
 * Sahifa kontenti uchun umumiy o'rovchi (markazlangan, max-width, padding).
 * Global <Nav/> layout.tsx da render qilinadi — PageShell uni takrorlamaydi.
 */
export function PageShell({ children, title, lead }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {title && (
        <header className="mb-8 sm:mb-10">
          <h1 className="display text-5xl sm:text-6xl">{title}</h1>
          {lead && <p className="mt-3 max-w-xl text-lg text-muted">{lead}</p>}
        </header>
      )}
      {children}
    </main>
  );
}
