import { test, expect, type Page } from "@playwright/test";
import { seedAuth } from "./helpers";

// Menejer roli ko'ra oladigan (app) ichki sahifalar. /rop ataylab kiritilmagan
// — u faqat rop roli uchun (quyida alohida sinov).
const MENEJER_PAGES = [
  "/home",
  "/etirozlar",
  "/drill",
  "/reyting",
  "/analitika",
  "/trener",
  "/muzokaralar",
  "/vazifalar",
  "/yutuqlar",
  "/profil",
  "/arxiv",
  "/qongiroq",
  "/chat",
];

test.describe("Sahifalararo navigatsiya (menejer)", () => {
  test.beforeEach(async ({ context }) => {
    await seedAuth(context, "menejer", "Ali");
  });

  for (const path of MENEJER_PAGES) {
    test(`${path} auth-gate'dan o'tadi va AppShell ichida ochiladi`, async ({
      page,
    }: {
      page: Page;
    }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));

      await page.goto(path);

      // Auth-gate yo'naltirmagan — URL saqlanadi.
      await expect(page).toHaveURL(
        new RegExp(path.replace("/", "\\/") + "($|\\?)"),
      );
      // Ilova qobig'i (sidebar/logotip) ko'rinadi — sahifa sindirmaydi.
      await expect(page.getByText("Sotuvchi Trainer").first()).toBeVisible();
      // Kamida bitta sarlavha mavjud.
      await expect(page.locator("h1, h2").first()).toBeVisible();

      expect(pageErrors).toEqual([]);
    });
  }

  test("mavzu almashtirgich ishlaydi (xatosiz)", async ({ page }) => {
    await page.goto("/home");
    const themeBtn = page.getByRole("button", { name: "Mavzu" });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    // "Qorong'i" yoki "Yorug'" variantlardan birini tanlaymiz.
    const dark = page.getByRole("button", { name: "Qorong'i" });
    const light = page.getByRole("button", { name: "Yorug'" });
    if (await dark.isVisible().catch(() => false)) await dark.click();
    else if (await light.isVisible().catch(() => false)) await light.click();
    // Hech narsa buzilmaydi.
    await expect(page.getByText("Sotuvchi Trainer").first()).toBeVisible();
  });
});

test.describe("ROP roli", () => {
  test("rop foydalanuvchi /rop panelini ko'ra oladi", async ({
    page,
    context,
  }) => {
    await seedAuth(context, "rop", "Bobur");
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await page.goto("/rop");
    await expect(page).toHaveURL(/\/rop($|\?)/);
    await expect(page.getByText("Sotuvchi Trainer").first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
