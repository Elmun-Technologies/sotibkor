"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { Card, Button } from "@/components/ui";
import { getUser, register, type Role } from "@/lib/auth";

const t = getMessages();

function nextUrl(): string {
  if (typeof window === "undefined") return "/dars";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/dars";
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
  const [company, setCompany] = useState("");
  const [team, setTeam] = useState("");

  // Allaqachon ro'yxatdan o'tган bo'lsa — o'tkazib yuboramiz
  useEffect(() => {
    if (getUser()) router.replace(nextUrl());
  }, [router]);

  const submit = () => {
    const nm = name.trim() || (role === "rop" ? "ROP" : "Menejer");
    register({
      role,
      name: nm,
      company: company.trim() || undefined,
      team: role === "rop" ? team.trim() || undefined : undefined,
    });
    router.push(nextUrl());
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
              className={`rounded-full py-2.5 text-sm font-medium transition ${
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

        <form
          className="mt-6 space-y-4"
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
            placeholder="+998 90 123 45 67"
            inputMode="tel"
          />
          <Field
            label={t.boshlash.email}
            placeholder="siz@kompaniya.uz"
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
              ← Bosh sahifa
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
