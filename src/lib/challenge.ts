/**
 * Haftalik challenge (10x-5) — "raqobat rejimi" / async duel.
 *
 * closeme'da yo'q: har hafta bitta tanlangan ssenariy hamma uchun bir xil —
 * foydalanuvchi uni o'ynaydi, eng yaxshi bali reyting bilan solishtiriladi.
 * Deterministik tanlov (hafta identifikatoriga bog'liq) — bir hafta ichida
 * hamma bir xil challenge'ni ko'radi (mock rejimda ham adolatli musobaqa).
 *
 * Sof funksiya + localStorage (kalitsiz ishlaydi). Real leaderboard Supabase
 * ulangach — interfeys o'zgarmaydi (hozircha lokal eng yaxshi ball).
 */

import { SCENARIOS, type Scenario } from "./scenarios";
import { currentWeekId } from "./progress";

/** Hafta identifikatoridan barqaror butun son (hash) — indeks tanlash uchun. */
function weekSeed(weekId: string): number {
  let h = 0;
  for (let i = 0; i < weekId.length; i++) {
    h = (h * 31 + weekId.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Joriy haftaning challenge ssenariysi (deterministik, hamma uchun bir xil). */
export function weeklyChallenge(weekId: string = currentWeekId()): Scenario {
  const idx = weekSeed(weekId) % SCENARIOS.length;
  return SCENARIOS[idx];
}

const BEST_KEY = "sotibkor_challenge_best";

interface ChallengeBest {
  week: string;
  score: number;
}

/** Joriy haftadagi challenge'da erishilgan eng yaxshi ball (bo'lmasa null). */
export function getChallengeBest(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return null;
    const b = JSON.parse(raw) as ChallengeBest;
    return b.week === currentWeekId() ? b.score : null;
  } catch {
    return null;
  }
}

/**
 * Challenge natijasini yozadi — faqat oldingi eng yaxshidan baland bo'lsa.
 * Yangi haftada avtomatik nolga tushadi (kalit hafta id'siga bog'langan).
 * Yangilangan eng yaxshi ballni qaytaradi.
 */
export function recordChallengeScore(score: number): number {
  const week = currentWeekId();
  const prev = getChallengeBest() ?? 0;
  const best = Math.max(prev, score);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BEST_KEY, JSON.stringify({ week, score: best }));
    } catch {
      /* e'tiborsiz */
    }
  }
  return best;
}
