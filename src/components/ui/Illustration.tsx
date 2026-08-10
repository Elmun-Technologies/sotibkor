import type { ReactNode } from "react";

export type IllustrationName =
  | "calls"
  | "team"
  | "trophy"
  | "clipboard"
  | "chart"
  | "mic"
  | "spark";

export interface IllustrationProps {
  name: IllustrationName;
  size?: number;
  className?: string;
}

/**
 * Chiziqli (line-art) illyustratsiyalar — rasm-generatsiya kalitisiz,
 * CSP-safe inline SVG. Bo'sh holatlar, qahramon-karta va bo'lim ajratgichlari
 * uchun. Ranglar currentColor orqali meros bo'lib o'tadi (ota-element rangiga).
 */
export function Illustration({ name, size = 96, className }: IllustrationProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  switch (name) {
    case "calls":
      return (
        <svg {...common}>
          <circle cx="60" cy="60" r="40" opacity="0.25" />
          <path d="M44 38c-2 0-3.5 1.5-3.5 3.5v5c0 1.4.9 2.6 2.2 3.1l4 1.3c1.1.4 2.3 0 3-.9l2-2.6c5 2.6 9.4 7 12 12l-2.6 2c-.9.7-1.3 1.9-.9 3l1.3 4c.5 1.3 1.7 2.2 3.1 2.2h5c2 0 3.5-1.5 3.5-3.5 0-18-14.6-32.6-32.6-32.6Z" />
          <path d="M48 78v8M60 82v4M72 78v8" opacity="0.5" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="44" cy="46" r="11" />
          <path d="M24 92c0-12 9-20 20-20s20 8 20 20" />
          <circle cx="84" cy="52" r="9" />
          <path d="M70 92c0-10 7-16 14-16 4 0 7 1.6 9 4" />
          <circle cx="84" cy="30" r="7" />
          <path d="M74 44c6-2 12-2 18 0" opacity="0.5" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M44 34h32v14c0 11-8 19-16 19s-16-8-16-19V34Z" />
          <path d="M44 40c-10 0-16 4-16 12 0 5 4 8 9 8" />
          <path d="M76 40c10 0 16 4 16 12 0 5-4 8-9 8" />
          <path d="M60 67v10M50 94h20M54 87h12v7H54z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="38" y="28" width="44" height="64" rx="6" />
          <rect x="50" y="22" width="20" height="14" rx="4" />
          <path d="M48 54h24M48 66h24M48 78h16" opacity="0.6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M30 92V28M30 92h64" />
          <rect x="40" y="62" width="12" height="24" rx="2" opacity="0.7" />
          <rect x="58" y="48" width="12" height="38" rx="2" opacity="0.85" />
          <rect x="76" y="36" width="12" height="50" rx="2" />
          <path d="M36 52l14-12 12 9 18-20" opacity="0.6" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="50" y="30" width="20" height="40" rx="10" />
          <path d="M42 56c0 12 8 20 18 20s18-8 18-20" />
          <path d="M60 90v8M50 98h20" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M62 24l10 28 28 10-28 10-10 28-10-28-28-10 28-10 10-28Z" />
        </svg>
      );
  }
}

/** Bo'sh holat uchun tayyor qobiq: illyustratsiya + sarlavha + matn + ixtiyoriy CTA. */
export function EmptyState({
  art,
  title,
  children,
  className,
}: {
  art: IllustrationName;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-10 text-center ${className ?? ""}`}
    >
      <span className="text-[color:var(--accent)]/70">
        <Illustration name={art} size={84} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children && (
        <p className="mx-auto max-w-sm text-sm text-muted">{children}</p>
      )}
    </div>
  );
}
