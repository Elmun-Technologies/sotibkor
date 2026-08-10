import { test, expect } from "@playwright/test";
import { seedAuth } from "./helpers";

test.describe("Trener — to'liq ovoz aylanasi (matn rejimi, mock)", () => {
  test("setup → mikrofon tekshiruvi → suhbat → baho", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await seedAuth(page.context(), "menejer", "Ali");
    await page.goto("/trener");

    // 1) Sozlash ekrani
    await expect(page.getByText("Suhbatni sozlang")).toBeVisible();
    await page.getByRole("button", { name: "Suhbatni boshlash" }).first().click();

    // 2) Mikrofon tekshiruvi (headless'da ruxsat yo'q — matn rejimi davom etadi)
    await expect(page.getByText("Mikrofonni tekshiring")).toBeVisible();
    await page.getByRole("button", { name: "Suhbatni boshlash" }).click();

    // 3) Suhbat ekrani: input va yakunlash tugmasi ko'rinadi
    await expect(
      page.getByPlaceholder("Javobingizni yozing yoki mikrofonni bosing..."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Suhbatni yakunlash" })).toBeVisible();

    // 4) Sotuvchi replikasini yozib yuboramiz (matn rejimi)
    await page
      .getByPlaceholder("Javobingizni yozing yoki mikrofonni bosing...")
      .fill("Salom! Mahsulotim haqida gaplashib o'tsam, qiziqadimi?");
    await page.getByRole("button", { name: "Yuborish" }).click();

    // 5) Mijoz (persona) javobi transkriptda paydo bo'lishi kerak
    await expect(page.getByText("Mijoz").first()).toBeVisible({ timeout: 15000 });

    // 6) Suhbatni yakunlaymiz → baho va feedback ekrani
    await page.getByRole("button", { name: "Suhbatni yakunlash" }).click();
    await expect(page.getByText("Baho va feedback")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Umumiy ball")).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
