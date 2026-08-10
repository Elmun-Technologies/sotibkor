import { defineConfig, devices } from "@playwright/test";

/**
 * Sotuvchi Trainer — E2E (Playwright).
 * Mock rejimda (kalitsiz) asosiy foydalanuvchi oqimlarini tekshiradi:
 * landing → ro'yxatdan o'tish → onboarding → bosh sahifa, sahifalararo
 * navigatsiya, va to'liq ovoz aylanasi (matn rejimida) trener → baho.
 *
 * webServer avtomatik `next build && next start` ni ishga tushiradi; CI'da
 * yangi server ishlatiladi, lokalda mavjud server qayta ishlatiladi.
 */

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Mikrofon ruxsati headless'da yo'q — kod shunga tayyor (matn rejimi).
    permissions: [],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
