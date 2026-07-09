"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button } from "@/components/ui";
import {
  getUser,
  registerAccount,
  isOnboarded,
  type Role,
} from "@/lib/auth";

const t = getMessages();

function nextUrl(): string {
  if (typeof window === "undefined") return "/home";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/home";
}

function afterAuthDest(): string {
  if (isOnboarded()) return nextUrl();
  return "/onboarding?next=" + encodeURIComponent(nextUrl());
}

function Field({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm text-foreground">
        {label}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] text-foreground outline-none transition placeholder:text-faint focus:border-foreground/40"
      />
    </label>
  );
}

export default function BoshlashPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("menejer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getUser()) router.replace(afterAuthDest());
  }, [router]);

  const submit = async () => {
    setError(null);
    const nm =
      name.trim() ||
      (role === "rop"
        ? t.boshlash.defaultNameRop
        : t.boshlash.defaultNameMenejer);
    setLoading(true);
    const res = await registerAccount({
      email: email.trim(),
      password,
      name: nm,
      role,
      company: company.trim() || undefined,
      team: role === "rop" ? team.trim() || undefined : undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? t.boshlash.registerError);
      return;
    }
    router.push(afterAuthDest());
  };

  const isRop = role === "rop";
  const benefits = isRop ? t.boshlash.benefitsRop : t.boshlash.benefitsMenejer;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center">
      <div className="space-y-8">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--good)]/40 px-4 py-1.5 text-sm font-medium text-[color:var(--good)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--good)]" />
            {t.boshlash.eyebrow}
          </span>
          <h1 className="display text-4xl sm:text-5xl">
            {isRop ? t.boshlash.heroRop : t.boshlash.heroMenejer}
          </h1>
        </div>
        <div className="space-y-5">
          {benefits.map((b, i) => (
            <div key={b.t} className="flex gap-4">
              <span className="font-mono text-sm tabular-nums text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="font-semibold text-foreground">{b.t}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {b.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-surface2 p-1">
          {(["menejer", "rop"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={
                "rounded-full py-2.5 text-sm font-medium transition " +
                (role === r
                  ? "bg-ink text-onink"
                  : "text-muted hover:text-foreground")
              }
            >
              {r === "menejer" ? t.boshlash.roleMenejer : t.boshlash.roleRop}
            </button>
          ))}
        </div>

        <h2 className="mb-5 text-xl font-semibold text-foreground">
          {isRop ? t.boshlash.formTitleRop : t.boshlash.formTitleMenejer}
        </h2>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) void submit();
          }}
        >
          <Field
            label={t.boshlash.name}
            placeholder={t.boshlash.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Field
            label={t.boshlash.email}
            type="email"
            placeholder={t.boshlash.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Field
            label={t.boshlash.password}
            hint={t.boshlash.passwordHint}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          {isRop ? (
            <Field
              label={t.boshlash.team}
              hint={t.boshlash.teamHint}
              placeholder={t.boshlash.teamPlaceholder}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          ) : (
            <Field
              label={t.boshlash.company}
              placeholder={t.boshlash.companyPlaceholder}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
            />
          )}

          {error && (
            <p className="text-sm text-[color:var(--bad)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {isRop ? t.boshlash.createRop : t.boshlash.createMenejer}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">{t.boshlash.agree}</p>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="text-muted hover:text-foreground">
            {t.boshlash.backHome}
          </Link>
          <span className="text-muted">
            {t.boshlash.haveAccount}{" "}
            <Link
              href="/kirish"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t.boshlash.login}
            </Link>
          </span>
        </div>
      </Card>
    </main>
  );
}
