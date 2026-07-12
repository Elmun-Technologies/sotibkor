import { getMessages } from "@/i18n";
import { Card, Button, Eyebrow } from "@/components/ui";

const t = getMessages();

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">
          {t.common.notFoundTitle}
        </h1>
        <p className="mt-2 text-[15px] text-foreground/60">
          {t.common.notFoundDesc}
        </p>
        <Button href="/" className="mt-6">
          {t.common.notFoundHome}
        </Button>
      </Card>
    </main>
  );
}
