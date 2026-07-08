/**
 * i18n — minimal skelet. CLAUDE.md qoidasi: barcha UI matnlari shu yerdan,
 * komponentga hardcode QILINMAYDI. Asosiy til: uz. ru keyingi bosqichda.
 *
 * TODO: to'liq i18n yechimi (next-intl yoki shunga o'xshash), til almashtirish,
 * server/klient tarjima kontexti. Hozircha oddiy statik yuklash.
 */

import uz from "./uz.json";

export type Locale = "uz" | "ru";
export const DEFAULT_LOCALE: Locale = "uz";

const messages = { uz } as const;

export type Messages = typeof uz;

export function getMessages(_locale: Locale = DEFAULT_LOCALE): Messages {
  // TODO: locale bo'yicha tanlash (ru qo'shilganda).
  return messages.uz;
}
