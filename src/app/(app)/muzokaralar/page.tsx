"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { PageShell, Card, Button } from "@/components/ui";
import { isRegistered, isOnboarded } from "@/lib/auth";
import {
  NEGOTIATIONS,
  negotiationHref,
  type NegotiationIcon,
  type NegotiationScenario,
} from "@/lib/negotiations";

const t = getMessages();

function ScenarioIcon({ icon }: { icon: NegotiationIcon }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "percent":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="4" y="5.5" width="16" height="15" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 3.5v4M16 3.5v4" />
        </svg>
      );
    case "split":
      return (
        <svg {...common}>
          <path d="M12 3v18" strokeDasharray="2.5 2.5" />
          <rect x="3" y="7" width="7" height="10" rx="1.5" />
          <rect x="14" y="7" width="7" height="10" rx="1.5" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <rect x="2.5" y="8" width="11" height="8" rx="1" />
          <path d="M13.5 11h4l3 3v2h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="16.5" cy="18" r="1.6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M9.5 3.5h5" />
          <path d="M10.5 3.5v6.2L5.8 18a1.5 1.5 0 0 0 1.3 2.2h9.8a1.5 1.5 0 0 0 1.3-2.2L13.5 9.7V3.5" />
          <path d="M8.2 15h7.6" />
        </svg>
      );
    case "swap":
      return (
        <svg {...common}>
          <path d="M4 8h13" />
          <path d="M13 4l4 4-4 4" />
          <path d="M20 16H7" />
          <path d="M11 12l-4 4 4 4" />
        </svg>
      );
  }
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

function ScenarioCard({ s }: { s: NegotiationScenario }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      interactive={!s.locked}
      className={`flex flex-col gap-4 ${s.locked ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            s.locked
              ? "bg-foreground/[.06] text-faint"
              : "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
          }`}
        >
          <ScenarioIcon icon={s.locked ? "lock" : s.icon} />
        </span>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted">
          {t.muzokaralar.badge}
        </span>
      </div>

      <div>
        <h3 className="font-semibold tracking-tight text-foreground">
          {s.title}
        </h3>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-semibold">
            {initials(s.clientName)}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-foreground">
              {s.clientName}
            </div>
            <div className="truncate text-xs text-muted">
              {s.clientRole} · {s.clientCompany}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted">{s.description}</p>

      {expanded && (
        <div className="inset p-3">
          <div className="eyebrow">{t.muzokaralar.objectiveLabel}</div>
          <p className="mt-1 text-sm text-foreground">{s.objective}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {s.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-hair pt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mr-auto text-sm text-muted underline-offset-2 transition hover:text-foreground hover:underline"
        >
          {t.muzokaralar.details}
        </button>
        {s.locked ? (
          <span className="text-xs text-faint">
            {t.muzokaralar.levelLabel} {s.level} {t.muzokaralar.lockedLabel}
          </span>
        ) : (
          <Link href={negotiationHref(s)}>
            <Button>▶ {t.muzokaralar.start}</Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

export default function MuzokaralarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [query, setQuery] = useState("");
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState<string[]>([]);

  useEffect(() => {
    if (!isRegistered()) {
      router.replace("/boshlash?next=/muzokaralar");
      return;
    }
    if (!isOnboarded()) {
      router.replace("/onboarding?next=/muzokaralar");
      return;
    }
    setReady(true);
  }, [router]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NEGOTIATIONS;
    return NEGOTIATIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query]);

  if (!ready) return null;

  return (
    <PageShell title={t.muzokaralar.title} lead={t.muzokaralar.subtitle}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex gap-1 rounded-full bg-surface2 p-1">
          {(
            [
              ["all", `${t.muzokaralar.tabAll} · ${NEGOTIATIONS.length}`],
              ["mine", `${t.muzokaralar.tabMine} · ${created.length}`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
                tab === k
                  ? "bg-ink text-onink"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "all" && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.muzokaralar.searchPlaceholder}
            className="w-full rounded-full border border-border bg-surface2 px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-foreground/40 sm:w-80"
          />
        )}
      </div>

      {tab === "all" ? (
        list.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted">
            {t.muzokaralar.resultEmpty}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <ScenarioCard key={s.id} s={s} />
            ))}
            <Card className="flex flex-col items-center justify-center gap-2 border-dashed py-10 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--accent)]/10 text-lg text-[color:var(--accent)]">
                +
              </span>
              <div className="font-semibold text-foreground">
                {t.muzokaralar.createBtn}
              </div>
              <p className="max-w-[220px] text-xs text-muted">
                {t.muzokaralar.createLead}
              </p>
            </Card>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6">
          {created.length === 0 ? (
            <Card className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="text-3xl" aria-hidden>
                🤝
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {t.muzokaralar.emptyMineTitle}
              </h2>
              <p className="mx-auto max-w-sm text-sm text-muted">
                {t.muzokaralar.emptyMineLead}
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {created.map((c, i) => (
                <Card key={i} className="text-sm text-foreground">
                  {c}
                </Card>
              ))}
            </div>
          )}

          <Card className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {t.muzokaralar.createTitle}
            </h2>
            <p className="text-sm text-muted">{t.muzokaralar.createLead}</p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder={t.muzokaralar.createLead}
              className="w-full resize-none rounded-lg2 border border-border bg-surface2 px-4 py-3 text-[15px] leading-relaxed outline-none transition placeholder:text-faint focus:border-foreground/40"
            />
            <div>
              <Button
                onClick={() => {
                  if (!desc.trim()) return;
                  setCreated((c) => [...c, desc.trim()]);
                  setDesc("");
                }}
                disabled={!desc.trim()}
              >
                {t.muzokaralar.createBtnCard}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
