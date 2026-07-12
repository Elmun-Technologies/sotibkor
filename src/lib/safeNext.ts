/**
 * Auth-dan keyingi redirect manzilini tekshiradi (open-redirect himoyasi).
 * Faqat ilova ichidagi mutlaq yo'l ruxsat etiladi — "//evil.com" kabi
 * protokol-nisbiy manzillar (brauzer buni tashqi hostga yo'naltiradi deb
 * o'qiydi) rad etiladi.
 */
export function safeNext(
  raw: string | null | undefined,
  fallback = "/home",
): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}
