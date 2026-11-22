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

test("owner renames a playlist, then deletes it after confirming", async ({ page }) => {
  await signUp(page, "Олена");
  await page.getByLabel("Назва").fill("Літо");
  await page.getByLabel("Опис (необов'язково)").fill("Для дороги");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();
  const playlistUrl = page.url();

  await page.getByRole("button", { name: "Редагувати плейлист" }).click();
  const form = page.getByRole("form", { name: "Редагування плейлиста" });
  await form.getByLabel("Назва").fill("   ");
  await form.getByRole("button", { name: "Зберегти" }).click();
  await expect(form.getByRole("alert")).toContainText("Назва обов'язкова");

  await form.getByLabel("Назва").fill("Осінь");
  await form.getByLabel("Опис (необов'язково)").fill("Для дощу");
  await form.getByRole("button", { name: "Зберегти" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Осінь" })).toBeVisible();
  await expect(page.getByText("Для дощу")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Осінь" })).toBeVisible();

  const confirm = page.getByRole("dialog", { name: "Видалити плейлист?" });
  await page.getByRole("button", { name: "Видалити плейлист" }).click();
  await confirm.getByRole("button", { name: "Скасувати" }).click();
  await expect(confirm).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Осінь" })).toBeVisible();

  await page.getByRole("button", { name: "Видалити плейлист" }).click();
  await confirm.getByRole("button", { name: "Так, видалити" }).click();
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("У вас ще немає плейлистів")).toBeVisible();

  await page.goto(playlistUrl);
  await expect(page.getByRole("heading", { name: "Сторінку не знайдено" })).toBeVisible();
});
