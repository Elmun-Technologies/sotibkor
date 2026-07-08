import Link from "next/link";
import { getMessages } from "@/i18n";

export default function Home() {
  const t = getMessages();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="neon-glow rounded-2xl border border-white/10 bg-white/[.02] px-8 py-12 sm:px-16 sm:py-16">
        <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.3em] text-white/50">
          {t.app.tagline}
        </p>
        <h1 className="text-4xl font-bold sm:text-6xl">
          <span className="neon-text">{t.app.name}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/50">
          {t.app.comingSoonDesc}
        </p>
        <Link
          href="/trener"
          className="neon-glow mt-8 inline-block rounded-xl border border-[color:var(--neon)]/40 bg-[color:var(--neon)]/10 px-6 py-3 font-semibold transition hover:bg-[color:var(--neon)]/20"
        >
          {t.app.startTraining}
        </Link>
      </div>
    </main>
  );
}
