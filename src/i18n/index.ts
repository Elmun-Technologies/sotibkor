/**
 * i18n — namespace fayllarni bitta merged obyektga birlashtiradi.
 * CLAUDE.md qoidasi: barcha UI matnlari shu yerdan; komponentga hardcode QILINMAYDI.
 * Asosiy til: uz. ru keyingi bosqichda (locale bo'yicha tanlash qo'shiladi).
 *
 * Har namespace alohida JSON faylda (src/i18n/<name>.json). Feature agentlar
 * o'z namespace fayllarini kengaytiradi — bu yerga faqat yangi namespace qo'shiladi.
 */

import app from "./app.json";
import sohalar from "./sohalar.json";
import personalar from "./personalar.json";
import setup from "./setup.json";
import trener from "./trener.json";
import natija from "./natija.json";
import nav from "./nav.json";
import landing from "./landing.json";
import profil from "./profil.json";
import reyting from "./reyting.json";
import achievements from "./achievements.json";
import common from "./common.json";
import dars from "./dars.json";
import boshlash from "./boshlash.json";
import onboarding from "./onboarding.json";
import home from "./home.json";
import etirozlar from "./etirozlar.json";
import qongiroq from "./qongiroq.json";
import vazifalar from "./vazifalar.json";
import muzokaralar from "./muzokaralar.json";
import analitika from "./analitika.json";
import yutuqlar from "./yutuqlar.json";
import tariflar from "./tariflar.json";
import yordam from "./yordam.json";
import miccheck from "./miccheck.json";
import arxiv from "./arxiv.json";
import drill from "./drill.json";
import chat from "./chat.json";
import rop from "./rop.json";

export type Locale = "uz" | "ru";
export const DEFAULT_LOCALE: Locale = "uz";

const messages = {
  app,
  sohalar,
  personalar,
  setup,
  trener,
  natija,
  nav,
  landing,
  profil,
  reyting,
  achievements,
  common,
  dars,
  boshlash,
  onboarding,
  home,
  etirozlar,
  qongiroq,
  vazifalar,
  muzokaralar,
  analitika,
  yutuqlar,
  tariflar,
  yordam,
  miccheck,
  arxiv,
  drill,
  chat,
  rop,
} as const;

export type Messages = typeof messages;

/**
 * Barcha namespace'larni o'z ichiga olgan merged obyekt qaytaradi.
 * Mavjud kod (t.app.name, t.trener.*, t.natija.*) o'zgarishsiz ishlaydi.
 */
export function getMessages(_locale: Locale = DEFAULT_LOCALE): Messages {
  // TODO: locale bo'yicha tanlash (ru qo'shilganda).
  return messages;
}
