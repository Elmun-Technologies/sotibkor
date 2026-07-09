"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button, Eyebrow } from "@/components/ui";
import {
  getUser,
  register,
  isOnboarded,
  signInWithGoogle,
  completeGoogleSignup,
  type Role,
} from "@/lib/auth";
import { hasSupabaseAuth } from "@/lib/config";

const t = getMessages();

function nextUrl(): string {
  if (typeof window === "undefined") return "/home";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/home";
}

/** Ro'yxatdan keyin: onboarding tugamagan bo'lsa avval /onboarding. */
function afterAuthDest(): string {
  if (isOnboarded()) return nextUrl();
  return `/onboarding?next=${encodeURIComponent(nextUrl())}`;
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

/** Google bilan birinchi marta kirgan foydalanuvchi rol tanlaydigan qadam. */
function RoleStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("menejer");
  const [company, setCompany] = useState("");
  const [team, setTeam] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isRop = role === "rop";

  const finish = async () => {
    setBusy(true);
    setError("");
    try {
      await completeGoogleSignup(role, {
        company: company.trim() || undefined,
        team: isRop ? team.trim() || undefined : undefined,
      });
      const next = searchParams.get("next") ?? "/home";
      router.push(`/onboarding?next=${encodeURIComponent(next)}`);
    } catch {
      setError(t.boshlash.roleStepError);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card className="w-full">
        <Eyebrow>{t.boshlash.roleStepEyebrow}</Eyebrow>
        <h1 className="display mt-2 text-3xl">{t.boshlash.roleStepTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.boshlash.roleStepLead}</p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-surface2 p-1">
          {(["menejer", "rop"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                role === r
                  ? "bg-ink text-onink"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r === "menejer" ? t.boshlash.roleMenejer : t.boshlash.roleRop}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {isRop && (
            <Field
              label={t.boshlash.team}
              hint={t.boshlash.teamHint}
              placeholder={t.boshlash.teamPlaceholder}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          )}
          <Field
            label={t.boshlash.company}
            placeholder={t.boshlash.companyPlaceholder}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-[color:var(--bad)]">{error}</p>
        )}

        <Button className="mt-6 w-full" onClick={finish} disabled={busy}>
          {busy ? t.boshlash.roleStepBusy : t.boshlash.roleStepContinue}
        </Button>
      </Card>
    </main>
  );
}

function BoshlashForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";

  const [role, setRole] = useState<Role>("menejer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [team, setTeam] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  // Allaqachon ro'yxatdan o'tган bo'lsa — o'tkazib yuboramiz
  useEffect(() => {
    if (getUser()) router.replace(afterAuthDest());
  }, [router]);

  const submit = () => {
    const nm =
      name.trim() ||
      (role === "rop"
        ? t.boshlash.defaultNameRop
        : t.boshlash.defaultNameMenejer);
    register({
      role,
      name: nm,
      company: company.trim() || undefined,
      team: role === "rop" ? team.trim() || undefined : undefined,
    });
    router.push(afterAuthDest());
  };

  const google = async () => {
    setGoogleBusy(true);
    try {
      await signInWithGoogle(nextUrl());
    } catch {
      setGoogleBusy(false);
    }
  };

  const isRop = role === "rop";
  const benefits = isRop ? t.boshlash.benefitsRop : t.boshlash.benefitsMenejer;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center">
      {/* Chap: hero + foydalar */}
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

      {/* O'ng: forma */}
      <Card className="w-full">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-surface2 p-1">
          {(["menejer", "rop"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                role === r
                  ? "bg-ink text-onink"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r === "menejer" ? t.boshlash.roleMenejer : t.boshlash.roleRop}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-semibold tracking-tight">
          {isRop ? t.boshlash.formTitleRop : t.boshlash.formTitleMenejer}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t.boshlash.haveAccount}{" "}
          <span className="font-medium text-foreground underline">
            {t.boshlash.login}
          </span>
        </p>

        {hasSupabaseAuth() && (
          <div className="mt-6">
            <button
              type="button"
              onClick={google}
              disabled={googleBusy}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border py-3 text-sm font-medium text-foreground transition-all duration-150 hover:bg-foreground/[.04] active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleIcon />
              {googleBusy ? t.boshlash.googleBusy : t.boshlash.googleCta}
            </button>
            {authError && (
              <p className="mt-2 text-center text-xs text-[color:var(--bad)]">
                {t.boshlash.googleError}
              </p>
            )}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-hair" />
              <span className="text-xs text-faint">{t.boshlash.orDivider}</span>
              <span className="h-px flex-1 bg-hair" />
            </div>
          </div>
        )}

        <form
          className={hasSupabaseAuth() ? "space-y-4" : "mt-6 space-y-4"}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {isRop && (
            <Field
              label={t.boshlash.team}
              hint={t.boshlash.teamHint}
              placeholder={t.boshlash.teamPlaceholder}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          )}
          <Field
            label={t.boshlash.name}
            placeholder={t.boshlash.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label={t.boshlash.phone}
            placeholder={t.boshlash.phonePlaceholder}
            inputMode="tel"
          />
          <Field
            label={t.boshlash.email}
            placeholder={t.boshlash.emailPlaceholder}
            type="email"
          />
          <Field
            label={t.boshlash.company}
            placeholder={t.boshlash.companyPlaceholder}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Field
            label={t.boshlash.password}
            hint={t.boshlash.passwordHint}
            type="password"
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full">
            {isRop ? t.boshlash.createRop : t.boshlash.createMenejer}
          </Button>
          <p className="text-center text-xs text-muted">{t.boshlash.agree}</p>
          <p className="text-center text-xs text-faint">
            <Link href="/" className="underline">
              ← {t.boshlash.backHome}
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}

function BoshlashRouter() {
  const searchParams = useSearchParams();
  if (searchParams.get("step") === "role") return <RoleStep />;
  return <BoshlashForm />;
}

export default function BoshlashPage() {
  return (
    <Suspense fallback={null}>
      <BoshlashRouter />
    </Suspense>
  );
}
