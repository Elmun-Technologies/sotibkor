import { test, expect } from "@playwright/test";
import { registerMock } from "./helpers";

test.describe("Ro'yxatdan o'tish → onboarding → bosh sahifa", () => {
  test("mock rejimda to'liq foydalanuvchi yo'li ishlaydi", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await registerMock(page, "Ali");

    // Bosh sahifa yuklandi va salomlashish + trening CTA ko'rinadi.
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText(/Xayrli/)).toBeVisible();
    await expect(page.getByText("Trening boshlash")).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
