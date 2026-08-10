import { afterEach, describe, expect, it } from "vitest";
import {
  defaultLocale,
  hasAisha,
  hasOpenAI,
  hasSupabase,
  hasSupabaseAuth,
  vadConfig,
  vendorReadiness,
} from "../config";

const SAVED = { ...process.env };

afterEach(() => {
  process.env = { ...SAVED };
});

describe("vadConfig", () => {
  it("env sozlanmaganida sensible default qaytaradi", () => {
    delete process.env.NEXT_PUBLIC_VAD_THRESHOLD_RMS;
    delete process.env.NEXT_PUBLIC_VAD_SUSTAIN_MS;
    expect(vadConfig()).toEqual({ thresholdRms: 30, sustainMs: 220 });
  });

  it("env qiymatlarini o'qiydi, noto'g'ri/manfiy qiymatlarni inkor etadi", () => {
    process.env.NEXT_PUBLIC_VAD_THRESHOLD_RMS = "50";
    process.env.NEXT_PUBLIC_VAD_SUSTAIN_MS = "300";
    expect(vadConfig()).toEqual({ thresholdRms: 50, sustainMs: 300 });

    process.env.NEXT_PUBLIC_VAD_THRESHOLD_RMS = "not-a-number";
    process.env.NEXT_PUBLIC_VAD_SUSTAIN_MS = "-5";
    expect(vadConfig()).toEqual({ thresholdRms: 30, sustainMs: 220 });
  });
});

describe("vendorReadiness", () => {
  const clear = () => {
    for (const k of [
      "OPENAI_API_KEY",
      "AISHA_API_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "PAYME_MERCHANT_ID",
      "CLICK_MERCHANT_ID",
      "CLICK_SERVICE_ID",
    ]) {
      delete process.env[k];
    }
  };

  it("mock doim true; qolganlari env ga bog'liq", () => {
    clear();
    const r = vendorReadiness();
    expect(r).toEqual({
      mock: true,
      voice: false,
      db: false,
      auth: false,
      payment: false,
    });
    expect(hasOpenAI()).toBe(false);
    expect(hasAisha()).toBe(false);
    expect(hasSupabase()).toBe(false);
    expect(hasSupabaseAuth()).toBe(false);
  });

  it("barcha real providerlar sozlanganida true", () => {
    process.env.OPENAI_API_KEY = "x";
    process.env.AISHA_API_KEY = "y";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SERVICE_KEY = "svc";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.PAYME_MERCHANT_ID = "pm";
    const r = vendorReadiness();
    expect(r.voice).toBe(true);
    expect(r.db).toBe(true);
    expect(r.auth).toBe(true);
    expect(r.payment).toBe(true);
  });

  it("Click to'lov faqat merchant+service mavjud bo'lsa true", () => {
    clear();
    process.env.CLICK_MERCHANT_ID = "cm";
    process.env.CLICK_SERVICE_ID = "cs";
    expect(vendorReadiness().payment).toBe(true);
  });
});

describe("defaultLocale", () => {
  it("standart uz", () => {
    delete process.env.NEXT_PUBLIC_LOCALE;
    expect(defaultLocale()).toBe("uz");
  });
  it("ru sozlansa ru qaytaradi", () => {
    process.env.NEXT_PUBLIC_LOCALE = "ru";
    expect(defaultLocale()).toBe("ru");
  });
});
