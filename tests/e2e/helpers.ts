import { type BrowserContext, type Page } from "@playwright/test";

/**
 * Mock-rejimda (kalitsiz) ro'yxatdan o'tgan foydalanuvchini localStorage'ga
 * yozadi. Barcha sahifalarga `addInitScript` orqali qo'llaniladi — har bir
 * navigatsiyadan oldin ishlaydi, shuning uchun auth-gate hech qachon
 * /boshlash'ga uloqtirmaydi.
 *
 * Shuningdech brauzerning `speechSynthesis`ini stub qilamiz: headless muhitda
 * haqiqiy ovoz yo'q, `onend` hech qachon chaqirilmasligi mumkin (audio Promise
 * osilib qolishi xavfi). Stub `speak()` ni darrov `onstart`/`onend` bilan
 * yakunlaydi — E2E'da ovoz aylanasi kutmasdan transcript'ga e'tibor qaratamiz.
 */
export async function seedAuth(
  context: BrowserContext,
  role: "menejer" | "rop" = "menejer",
  name = "Test",
): Promise<void> {
  await context.addInitScript(
    ([r, n]) => {
      try {
        localStorage.setItem(
          "sotibkor_user",
          JSON.stringify({ role: r, name: n }),
        );
        localStorage.setItem(
          "sotibkor_profile",
          JSON.stringify({ spheres: [], onboarded: true }),
        );
      } catch {
        /* e'tiborsiz */
      }
      // speechSynthesis stub (faqat mavjud bo'lsa)
      try {
        const w = window as unknown as {
          speechSynthesis?: { speak: (u: { onstart?: () => void; onend?: () => void }) => void; cancel: () => void };
        };
        if (w.speechSynthesis) {
          w.speechSynthesis = {
            speak: (u) => {
              u.onstart?.();
              u.onend?.();
            },
            cancel: () => {},
          };
        }
      } catch {
        /* e'tiborsiz */
      }
    },
    [role, name] as const,
  );
}

/**
 * To'liq ro'yxatdan o'tish oqimi (mock): /boshlash formasi → onboarding (2 qadam)
 * → /home. Real foydalanuvchi yo'li sinovi uchun.
 */
export async function registerMock(page: Page, name = "Test"): Promise<void> {
  await page.goto("/boshlash");

  await page
    .getByPlaceholder("Sizga qanday murojaat qilaylik")
    .fill(name);
  await page.getByPlaceholder("+998 90 123 45 67").fill("901234567");
  await page.getByPlaceholder("siz@kompaniya.uz").fill("test@example.com");
  await page
    .getByPlaceholder('MChJ "Sizning kompaniya"')
    .fill("Test LLC");
  await page.locator('input[type="password"]').fill("password123");

  await page.getByRole("button", { name: "Akkaunt yaratish" }).click();

  // Onboarding qadam 1
  await page
    .getByPlaceholder("CRM-tizim, yuk tashish, ulgurji mebel...")
    .fill("Test mahsulot");
  await page.getByRole("button", { name: "Keyingi" }).click();

  // Onboarding qadam 2 — bitta soha tanlab, yakunlaymiz
  await page.getByRole("button", { name: "Ta'lim" }).click();
  await page.getByRole("button", { name: "Tayyor" }).click();

  await page.waitForURL("**/home");
}
