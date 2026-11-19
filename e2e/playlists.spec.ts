import { expect, test, type Page } from "@playwright/test";

async function signUp(page: Page, name: string) {
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill(name);
  await page.getByLabel("Email").fill(`user-${crypto.randomUUID()}@example.com`);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
}

async function expectNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "Сторінку не знайдено" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Літо" })).toHaveCount(0);
  await expect(page.getByText("Для дороги")).toHaveCount(0);
}

test("user creates a playlist, finds it in the list, and nobody else can open it", async ({ page, browser }) => {
  await signUp(page, "Олена");
  await expect(page.getByText("У вас ще немає плейлистів")).toBeVisible();

  await page.getByLabel("Назва").fill("Літо");
  await page.getByLabel("Опис (необов'язково)").fill("Для дороги");
  await page.getByRole("button", { name: "Створити плейлист" }).click();

  await expect(page.getByRole("heading", { name: "Літо" })).toBeVisible();
  await expect(page.getByText("Для дороги")).toBeVisible();
  const playlistUrl = page.url();

  await page.getByRole("link", { name: "← Мої плейлисти" }).click();
  await page.getByRole("list", { name: "Мої плейлисти" }).getByRole("link", { name: "Літо" }).click();
  await expect(page).toHaveURL(playlistUrl);

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(playlistUrl);
  await expectNotFound(guestPage);

  await signUp(guestPage, "Тарас");
  await guestPage.goto(playlistUrl);
  await expectNotFound(guestPage);
  await guest.close();
});
