"use client";

import { useEffect } from "react";
import { getMessages } from "@/i18n";

const t = getMessages();

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="uz">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100svh",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            background: "#0b0b0e",
            color: "#f5f5f5",
          }}
        >
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600 }}>
              {t.common.errorTitle}
            </h1>
            <p style={{ marginTop: 8, opacity: 0.6, fontSize: 15 }}>
              {t.common.errorDesc}
            </p>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <button
                onClick={reset}
                style={{
                  borderRadius: 999,
                  padding: "12px 24px",
                  border: "1px solid #333",
                  background: "transparent",
                  color: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                {t.common.retry}
              </button>
              <a
                href="/"
                style={{
                  borderRadius: 999,
                  padding: "12px 24px",
                  background: "#f5f5f5",
                  color: "#0b0b0f",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {t.common.errorHome}
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
