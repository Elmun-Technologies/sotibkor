import type { ReactNode } from "react";

export interface PageShellProps {
  children: ReactNode;
  title?: string;
}

/**
 * Sahifa kontenti uchun umumiy o'rovchi (markazlangan, max-width, padding).
 * Global <Nav/> layout.tsx da render qilinadi — PageShell uni takrorlamaydi.
 */
export function PageShell({ children, title }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {title && (
        <h1 className="mb-6 text-3xl font-bold text-balance sm:text-4xl">
          {title}
        </h1>
      )}
      {children}
    </main>
  );
}
