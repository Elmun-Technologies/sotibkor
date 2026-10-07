import { getMessages } from "@/i18n";

const t = getMessages();

/** Visible disclosure for screens that still render fixture/demo statistics. */
export function SampleDataNotice() {
  return (
    <div
      role="note"
      className="mb-5 flex gap-3 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-sm text-foreground"
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-warn/40 font-semibold text-warn"
      >
        i
      </span>
      <div>
        <p className="font-semibold">{t.common.sampleDataTitle}</p>
        <p className="mt-0.5 text-muted">{t.common.sampleDataDescription}</p>
      </div>
    </div>
  );
}
