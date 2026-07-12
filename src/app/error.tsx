"use client";

import { useEffect } from "react";
import { getMessages } from "@/i18n";
import { Card, Button, Eyebrow } from "@/components/ui";

const t = getMessages();

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <Eyebrow>Xato</Eyebrow>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          {t.common.errorTitle}
        </h1>
        <p className="mt-2 text-[15px] text-foreground/60">
          {t.common.errorDesc}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={reset}>
            {t.common.retry}
          </Button>
          <Button href="/">{t.common.errorHome}</Button>
        </div>
      </Card>
    </main>
  );
}
