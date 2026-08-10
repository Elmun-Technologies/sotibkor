import { test, expect } from "@playwright/test";

test.describe("Landing sahifasi", () => {
  test("asosiy sarlavha va CTA ko'rinadi, xatosiz yuklanadi", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Sotuvni ovoz bilan mashq qil" }),
    ).toBeVisible();
    await expect(
      page.getByText("AI mijoz jaydari o'zbekchada otkaz beradi"),
    ).toBeVisible();

    // Asosiy CTA mavjud va bosilganda ilova ichiga o'tadi.
    const cta = page.getByText("Trenajorni boshlash").first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).not.toHaveURL("http://localhost:3000/");

    // Sahifa davomida hech qanday runtime xatosi bo'lmasligi kerak.
    expect(pageErrors).toEqual([]);
  });
});
