"use client";

import { getMessages } from "@/i18n";
import { Button } from "@/components/ui";

const t = getMessages();

export interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
  recording: boolean;
  busy: boolean;
}

/** Suhbat kiritish paneli: matn + mikrofon + yuborish. */
export function Composer({
  value,
  onChange,
  onSend,
  onMic,
  recording,
  busy,
}: ComposerProps) {
  return (
    <div className="flex items-end gap-2 border-t border-border pt-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={2}
        placeholder={t.trener.placeholder}
        className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-[color:var(--neon)]/50"
      />
      <button
        type="button"
        onClick={onMic}
        aria-pressed={recording}
        title={recording ? t.trener.micRecording : t.trener.mic}
        className={`relative shrink-0 rounded-xl border px-3.5 py-2.5 text-sm transition ${
          recording
            ? "border-red-500/60 bg-red-500/15 text-red-400"
            : "border-border text-foreground/80 hover:bg-foreground/5"
        }`}
      >
        {recording && (
          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        )}
        <span aria-hidden>{recording ? "■" : "🎙"}</span>
      </button>
      <Button
        onClick={onSend}
        disabled={busy || !value.trim()}
        className="shrink-0"
      >
        {t.trener.send}
      </Button>
    </div>
  );
}
