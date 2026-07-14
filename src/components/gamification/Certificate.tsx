"use client";

import { useRef } from "react";
import { getMessages } from "@/i18n";

const t = getMessages();

export interface CertificateProps {
  name: string;
  levelLabel: string;
  xp: number;
  sessions: number;
  dateStr: string;
}

/**
 * Yutuq sertifikati (10x-8) — foydalanuvchining erishgan darajasi uchun
 * ulashiladigan SVG guvohnoma. Sof SVG (tashqi kutubxonasiz) — shu bilan
 * yuklab olish ham oson (SVG blob). closeme'da yo'q — gamifikatsiya+.
 */
export function Certificate({
  name,
  levelLabel,
  xp,
  sessions,
  dateStr,
}: CertificateProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const download = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', data], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sertifikat-${name.replace(/\s+/g, "-").toLowerCase()}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-auto w-full max-w-xl rounded-[var(--r-card)]"
          role="img"
          aria-label={`${t.profil.certTitle}: ${name}, ${levelLabel}`}
        >
          <defs>
            <linearGradient id="cert-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0b0b0d" />
              <stop offset="1" stopColor="#16181d" />
            </linearGradient>
          </defs>
          <rect width="600" height="400" rx="16" fill="url(#cert-bg)" />
          <rect
            x="14"
            y="14"
            width="572"
            height="372"
            rx="10"
            fill="none"
            stroke="#2ee27f"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />

          {/* Brend belgi (signal to'lqin) */}
          <g
            transform="translate(300, 74)"
            stroke="#2ee27f"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M-9 -8c0 12 9 21 21 21" transform="scale(0.9)" />
            <path d="M4 -12c5.9 0 10.5 4.6 10.5 10.5" transform="scale(0.9)" />
            <path d="M4 -6c2.5 0 4.5 2 4.5 4.5" transform="scale(0.9)" />
          </g>

          <text
            x="300"
            y="128"
            textAnchor="middle"
            fill="#f3f3f6"
            fontSize="13"
            fontFamily="monospace"
            letterSpacing="4"
          >
            {t.profil.certEyebrow.toUpperCase()}
          </text>
          <text
            x="300"
            y="168"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="30"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {t.profil.certTitle}
          </text>

          <text
            x="300"
            y="212"
            textAnchor="middle"
            fill="#a9adb8"
            fontSize="14"
            fontFamily="sans-serif"
          >
            {t.profil.certAwardedTo}
          </text>
          <text
            x="300"
            y="248"
            textAnchor="middle"
            fill="#2ee27f"
            fontSize="28"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {name}
          </text>
          <text
            x="300"
            y="282"
            textAnchor="middle"
            fill="#f3f3f6"
            fontSize="15"
            fontFamily="sans-serif"
          >
            «{levelLabel}» {t.profil.certReached}
          </text>

          {/* Statistikalar */}
          <g fontFamily="monospace" fontSize="13" fill="#a9adb8">
            <text x="150" y="330" textAnchor="middle">
              {t.profil.xpTotal}
            </text>
            <text
              x="150"
              y="352"
              textAnchor="middle"
              fill="#f3f3f6"
              fontSize="18"
              fontWeight="700"
            >
              {xp.toLocaleString("ru-RU")}
            </text>

            <text x="300" y="330" textAnchor="middle">
              {t.profil.sessions}
            </text>
            <text
              x="300"
              y="352"
              textAnchor="middle"
              fill="#f3f3f6"
              fontSize="18"
              fontWeight="700"
            >
              {sessions}
            </text>

            <text x="450" y="330" textAnchor="middle">
              {t.profil.certDate}
            </text>
            <text
              x="450"
              y="352"
              textAnchor="middle"
              fill="#f3f3f6"
              fontSize="15"
              fontWeight="700"
            >
              {dateStr}
            </text>
          </g>

          <text
            x="300"
            y="380"
            textAnchor="middle"
            fill="#6b6f7a"
            fontSize="11"
            fontFamily="sans-serif"
          >
            {t.app.name} — {t.app.tagline}
          </text>
        </svg>
      </div>

      <button
        type="button"
        onClick={download}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-onink transition hover:opacity-90 active:scale-[0.97]"
      >
        ↓ {t.profil.certDownload}
      </button>
    </div>
  );
}
