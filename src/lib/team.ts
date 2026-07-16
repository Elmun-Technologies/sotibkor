/**
 * Jamoa (ROP paneli) uchun sof, testlanadigan agregat funksiyalar.
 * Menejerlar ro'yxati, jamoa leaderboardi va umumiy statistikani (o'rtacha
 * voronka, eng zaif e'tiroz turlari) hisoblaydi. LLM/tarmoq YO'Q.
 */

import type { TeamRow } from "./types";
import { FUNNEL_STAGES, type FunnelStage, type ObjectionType } from "./coach";

/** Jamoa o'rtacha balli (0 a'zo bo'lsa 0). */
export function teamAvgScore(team: TeamRow[]): number {
  if (team.length === 0) return 0;
  return Math.round(team.reduce((s, m) => s + m.avg, 0) / team.length);
}

/** Jamoa bo'yicha bajarilgan/maqsad yig'indisi. */
export function teamProgress(team: TeamRow[]): {
  done: number;
  target: number;
} {
  return team.reduce(
    (acc, m) => ({ done: acc.done + m.done, target: acc.target + m.target }),
    { done: 0, target: 0 },
  );
}

/** Har voronka bosqichi bo'yicha jamoa o'rtacha qamrovi (0-100). */
export function teamFunnelAverage(
  team: TeamRow[],
): Record<FunnelStage, number> {
  const out = {} as Record<FunnelStage, number>;
  for (const stage of FUNNEL_STAGES) {
    out[stage] =
      team.length === 0
        ? 0
        : Math.round(
            team.reduce((s, m) => s + (m.funnel[stage] ?? 0), 0) / team.length,
          );
  }
  return out;
}

/** Jamoada eng past o'rtacha qamrovli voronka bosqichi (umumiy zaif nuqta). */
export function teamWeakestStage(team: TeamRow[]): FunnelStage | null {
  if (team.length === 0) return null;
  const avg = teamFunnelAverage(team);
  return FUNNEL_STAGES.reduce((a, b) => (avg[a] <= avg[b] ? a : b));
}

/**
 * Eng zaif e'tiroz turlari reytingi — nechta menejer shu turda qiynalayotgani
 * bo'yicha kamayish tartibida. `null` (zaif nuqtasi yo'q) hisobga olinmaydi.
 */
export function weakObjectionRanking(
  team: TeamRow[],
): { type: ObjectionType; count: number }[] {
  const counts = new Map<ObjectionType, number>();
  for (const m of team) {
    if (m.weakObjection) {
      counts.set(m.weakObjection, (counts.get(m.weakObjection) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/** O'rtacha ball kamayishi bo'yicha tartiblangan jamoa (leaderboard). */
export function rankByScore(team: TeamRow[]): TeamRow[] {
  return [...team].sort((a, b) => b.avg - a.avg);
}

export type ActivityBucket =
  | { key: "hozir"; n: 0 }
  | { key: "soat"; n: number }
  | { key: "kecha"; n: 1 }
  | { key: "kun"; n: number };

/**
 * Oxirgi faollik soatini inson o'qiydigan guruhga aylantiradi (sof — i18n
 * matni komponentda). <1s "hozir", <24s "N soat", <48s "kecha", aks holda "N kun".
 */
export function activityBucket(hours: number): ActivityBucket {
  const h = Math.max(0, Math.floor(hours));
  if (h < 1) return { key: "hozir", n: 0 };
  if (h < 24) return { key: "soat", n: h };
  if (h < 48) return { key: "kecha", n: 1 };
  return { key: "kun", n: Math.floor(h / 24) };
}
