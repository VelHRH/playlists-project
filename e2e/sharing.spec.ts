import { expect, test, type Page } from "@playwright/test";

async function signUpWithPlaylist(page: Page) {
  const email = `user-${crypto.randomUUID()}@example.com`;
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill("Олена");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await page.getByLabel("Назва").fill("Літо");
  await page.getByLabel("Опис").fill("Для дороги");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();
  const form = page.getByRole("form", { name: "Новий трек" });
  await form.getByLabel("Виконавець").fill("ДахаБраха");
  await form.getByLabel("Назва").fill("Vesna");
  await form.getByLabel("Посилання (необов'язково)").fill("https://example.com/vesna");
  await form.getByLabel("Нотатка (необов'язково)").fill("Для ранку");
  await form.getByRole("button", { name: "Додати трек" }).click();
  await expect(page.getByRole("list", { name: "Треки" }).getByRole("listitem")).toHaveCount(1);
  return email;
}

async function expectNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "Сторінку не знайдено" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Літо" })).toHaveCount(0);
}

test("owner shares a playlist by link, a guest views it, and the link dies when regenerated or disabled", async ({
  page,
  browser,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const email = await signUpWithPlaylist(page);
  const sharing = page.getByRole("region", { name: "Доступ за посиланням" });
  await expect(sharing).toContainText("Плейлист приватний");

  await sharing.getByRole("button", { name: "Увімкнути доступ за посиланням" }).click();
  const linkField = sharing.getByLabel("Посилання");
  await expect(linkField).toHaveValue(/\/s\/[A-Za-z0-9_-]{22,}$/);
  const firstUrl = await linkField.inputValue();
  expect(firstUrl.startsWith(new URL(page.url()).origin)).toBe(true);

  await sharing.getByRole("button", { name: "Скопіювати посилання" }).click();
  await expect(sharing.getByRole("status")).toHaveText("Посилання скопійовано.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(firstUrl);

  await page.goto(firstUrl);
  await expect(page.getByRole("link", { name: "Редагувати плейлист" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("list", { name: "Мої плейлисти" })).toContainText("за посиланням");

  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  await guest.goto(firstUrl);
  await expect(guest.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();
  await expect(guest.getByText("Для дороги")).toBeVisible();
  await expect(guest.getByText("Автор: Олена")).toBeVisible();
  await expect(guest.getByText(email)).toHaveCount(0);
  const track = guest.getByRole("list", { name: "Треки" }).getByRole("listitem");
  await expect(track).toContainText("ДахаБраха — Vesna");
  await expect(track).toContainText("Для ранку");
  const trackLink = track.getByRole("link", { name: "Vesna" });
  await expect(trackLink).toHaveAttribute("target", "_blank");
  await expect(trackLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(guest.getByRole("main").getByRole("button")).toHaveCount(0);
  await expect(guest.getByRole("link", { name: "Редагувати плейлист" })).toHaveCount(0);

  await page.getByRole("link", { name: /Літо/ }).click();
  await sharing.getByRole("button", { name: "Перегенерувати посилання" }).click();
  await expect(linkField).not.toHaveValue(firstUrl);
  const secondUrl = await linkField.inputValue();
  await guest.goto(firstUrl);
  await expectNotFound(guest);
  await guest.goto(secondUrl);
  await expect(guest.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();

  await sharing.getByRole("button", { name: "Вимкнути доступ" }).click();
  await expect(sharing).toContainText("Плейлист приватний");
  await guest.goto(secondUrl);
  await expectNotFound(guest);

  await page.goto("/");
  await expect(page.getByRole("list", { name: "Мої плейлисти" })).toContainText("приватний");
  await guestContext.close();
});
