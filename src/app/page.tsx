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
        <p className="mt-4 text-lg text-white/60 sm:text-xl">
          — {t.app.comingSoon} —
        </p>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/50">
          {t.app.comingSoonDesc}
        </p>
      </div>
    </main>
  );
}
