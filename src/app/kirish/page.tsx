"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button } from "@/components/ui";
import { getUser, loginAccount } from "@/lib/auth";

const t = getMessages();

function nextUrl(): string {
  if (typeof window === "undefined") return "/home";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/home";
}

export default function KirishPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getUser()) router.replace(nextUrl());
  }, [router]);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const res = await loginAccount({ email: email.trim(), password });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? t.kirish.error);
      return;
    }
    router.push(nextUrl());
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="display text-3xl sm:text-4xl">{t.kirish.title}</h1>
        <p className="text-sm text-muted">{t.kirish.subtitle}</p>
      </div>

      <Card className="w-full">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) void submit();
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">
              {t.boshlash.email}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.boshlash.emailPlaceholder}
              autoComplete="email"
              required
              className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] text-foreground outline-none transition placeholder:text-faint focus:border-foreground/40"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-foreground">
              {t.boshlash.password}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] text-foreground outline-none transition placeholder:text-faint focus:border-foreground/40"
            />
          </label>

          {error && (
            <p className="text-sm text-[color:var(--bad)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {t.kirish.submit}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="text-muted hover:text-foreground">
            {t.boshlash.backHome}
          </Link>
          <span className="text-muted">
            {t.kirish.noAccount}{" "}
            <Link
              href="/boshlash"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t.kirish.register}
            </Link>
          </span>
        </div>
      </Card>
    </main>
  );
}
