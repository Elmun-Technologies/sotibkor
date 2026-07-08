/**
 * Gamifikatsiya mantig'i — sof, deterministik funksiyalar (TS strict).
 * Bu yerda I/O, DB yoki tashqi kutubxona yo'q — faqat matematika/sana hisobi.
 * XP chegaralari va darajalar src/lib/levels.ts da (bu yerda takrorlanmaydi).
 */

/** Bir kunning millisekundlari — sana farqini hisoblash uchun. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface XpOptions {
  /** Suhbat sotuv bilan yopilgan bo'lsa — bonus XP. */
  closed?: boolean;
  /** Persona qiyinlik darajasi (1..N); yuqori bo'lsa bonus. */
  personaLevel?: number;
}

/**
 * Suhbat balliga (0..100 kutiladi) qarab olingan XP.
 * Formula: total + (yopilgan ? 50 : 0) + (qiyin persona >= 6 ? 30 : 0).
 * Manfiy yoki noto'g'ri qiymatlar 0 ga qisiladi; natija butun son, >= 0.
 */
export function xpForScore(total: number, opts?: XpOptions): number {
  const base = Number.isFinite(total) && total > 0 ? total : 0;

  const closedBonus = opts?.closed ? 50 : 0;

  const personaLevel =
    opts && Number.isFinite(opts.personaLevel)
      ? (opts.personaLevel as number)
      : 0;
  const hardBonus = personaLevel >= 6 ? 30 : 0;

  return Math.round(base + closedBonus + hardBonus);
}

/**
 * ISO 'YYYY-MM-DD' sanani UTC yarim tunga qisilgan Date'ga aylantiradi.
 * Noto'g'ri format bo'lsa null qaytaradi.
 */
function parseDay(iso: string | null): number | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const ms = Date.UTC(year, month - 1, day);
  const d = new Date(ms);
  // Amaldagi sana kiritilgan qiymatga mos kelishini tekshirish (masalan 02-31 rad etiladi).
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

/**
 * Ketma-ket kunlar (streak) hisobini yangilaydi.
 * - lastActive yo'q yoki noto'g'ri bo'lsa: bugun birinchi faol kun -> 1.
 * - lastActive == bugun: streak allaqachon hisoblangan -> o'zgarmaydi (>=1).
 * - lastActive == kecha: davomi -> prevStreak + 1.
 * - farq > 1 kun (yoki kelajak sana): uzilgan -> 1.
 *
 * Sanalar ISO 'YYYY-MM-DD'. prevStreak manfiy bo'lsa 0 deb qaraladi.
 */
export function nextStreak(
  prevStreak: number,
  lastActiveISO: string | null,
  todayISO: string,
): number {
  const prev =
    Number.isFinite(prevStreak) && prevStreak > 0 ? Math.floor(prevStreak) : 0;

  const today = parseDay(todayISO);
  if (today === null) {
    // Bugungi sana noto'g'ri — xavfsiz fallback: kamida 1.
    return Math.max(prev, 1);
  }

  const last = parseDay(lastActiveISO);
  if (last === null) {
    // Hali hech qachon faol bo'lmagan — bugun birinchi kun.
    return 1;
  }

  const diffDays = Math.round((today - last) / MS_PER_DAY);

  if (diffDays === 0) {
    // Bugun allaqachon hisoblangan.
    return Math.max(prev, 1);
  }
  if (diffDays === 1) {
    // Ketma-ket kun — davom etadi.
    return prev + 1;
  }
  // Uzilish (>1 kun) yoki kelajakdagi lastActive — qaytadan boshlanadi.
  return 1;
}
