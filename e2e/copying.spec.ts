import { expect, test, type Page } from "@playwright/test";

async function signUp(page: Page, name: string) {
  await page.getByLabel("Ім'я").fill(name);
  await page.getByLabel("Email").fill(`user-${crypto.randomUUID()}@example.com`);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Зареєструватися" }).click();
}

test("a guest saves a copy of a shared playlist after signing up and finds it in their list", async ({
  page,
  browser,
}) => {
  await page.goto("/sign-up");
  await signUp(page, "Олена");
  await page.getByRole("button", { name: "Новий плейлист" }).click();
  await page.getByLabel("Назва").fill("Літо");
  await page.getByLabel("Опис").fill("Для дороги");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await page.getByRole("button", { name: "Додати трек" }).click();
  const form = page.getByRole("form", { name: "Новий трек" });
  await form.getByLabel("Виконавець").fill("ДахаБраха");
  await form.getByLabel("Назва").fill("Vesna");
  await form.getByRole("button", { name: "Додати трек" }).click();
  await expect(page.getByRole("list", { name: "Треки" }).getByRole("listitem")).toHaveCount(1);
  const sharing = page.getByRole("region", { name: "Доступ за посиланням" });
  await sharing.getByRole("button", { name: "Увімкнути доступ за посиланням" }).click();
  const sharedUrl = await sharing.getByLabel("Посилання", { exact: true }).inputValue();
  expect(sharedUrl).toMatch(/\/s\/[A-Za-z0-9_-]{22,}$/);

  const viewerContext = await browser.newContext();
  const viewer = await viewerContext.newPage();
  await viewer.goto(sharedUrl);
  await viewer.getByRole("link", { name: "Зберегти копію" }).click();
  await expect(viewer.getByRole("heading", { name: "Вхід" })).toBeVisible();
  await viewer.getByRole("link", { name: "Зареєструватися" }).click();
  await expect(viewer.getByRole("heading", { name: "Реєстрація" })).toBeVisible();
  await signUp(viewer, "Тарас");

  await expect(viewer).toHaveURL(sharedUrl);
  await viewer.getByRole("button", { name: "Зберегти копію" }).click();

  await expect(viewer.getByRole("heading", { level: 1, name: "Літо (копія)" })).toBeVisible();
  await expect(viewer).toHaveURL(/\/playlists\/[0-9a-f-]{36}$/);
  await expect(viewer.getByRole("list", { name: "Треки" })).toContainText("ДахаБраха");
  await expect(viewer.getByRole("region", { name: "Доступ за посиланням" })).toContainText("Плейлист приватний");

  await viewer.goto("/");
  const myPlaylists = viewer.getByRole("list", { name: "Мої плейлисти" });
  await expect(myPlaylists).toContainText("Літо (копія)");
  await expect(myPlaylists).toContainText("приватний");
  await viewerContext.close();
});
