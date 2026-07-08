"use client";

import { getMessages } from "@/i18n";
import { classifyObjection, type Turn, type ObjectionType } from "@/lib/coach";
import { Badge } from "@/components/ui";

const t = getMessages();

export interface TranscriptReviewProps {
  transcript: Turn[];
}

/**
 * Suhbat tahlili — har replikani ko'rsatadi, mijoz e'tirozlarini turi bo'yicha
 * belgilaydi (inline murabbiylik). closeme faqat yakuniy bahoni beradi; biz
 * transkriptni qayta ko'rib chiqish imkonini beramiz.
 */
export function TranscriptReview({ transcript }: TranscriptReviewProps) {
  if (transcript.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {transcript.map((turn, i) => {
        const isSeller = turn.role === "user";
        const obj: ObjectionType | null = isSeller
          ? null
          : classifyObjection(turn.content);
        return (
          <div
            key={i}
            className={`flex ${isSeller ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                isSeller ? "bg-ink text-onink" : "inset text-foreground"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    isSeller ? "text-onink/60" : "text-muted"
                  }`}
                >
                  {isSeller ? t.trener.you : t.trener.client}
                </span>
                {obj && <Badge tone="warn">{t.natija.objType[obj]}</Badge>}
              </div>
              {turn.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
