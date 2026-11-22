import { expect, test } from "@playwright/test";

const listText = "Jay-Z - Re-Make\nThe Ting Tings - Shut Up - Let Go\nДахаБраха - Vesna";

test("owner and a guest copy the playlist as «Artist - Title» text", async ({ page, browser, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill("Олена");
  await page.getByLabel("Email").fill(`user-${crypto.randomUUID()}@example.com`);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await page.getByLabel("Назва").fill("Літо");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Скопіювати як текст" })).toHaveCount(0);

  await page.getByRole("button", { name: "Вставити списком" }).click();
  const dialog = page.getByRole("dialog", { name: "Масова вставка" });
  await dialog.getByLabel("Текст").fill("Jay-Z - Re-Make\nThe Ting Tings – Shut Up - Let Go\nДахаБраха — Vesna");
  await dialog.getByRole("button", { name: "Переглянути" }).click();
  await dialog.getByRole("button", { name: "Зберегти" }).click();
  await expect(page.getByRole("list", { name: "Треки" }).getByRole("listitem")).toHaveCount(3);

  await page.getByRole("button", { name: "Скопіювати як текст" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Текст скопійовано." })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(listText);

  const sharing = page.getByRole("region", { name: "Доступ за посиланням" });
  await sharing.getByRole("button", { name: "Увімкнути доступ за посиланням" }).click();
  const url = await sharing.getByLabel("Посилання").inputValue();
  expect(url).toMatch(/\/s\//);

  const guestContext = await browser.newContext();
  await guestContext.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(url).origin });
  const guest = await guestContext.newPage();
  await guest.goto(url);
  await guest.getByRole("button", { name: "Скопіювати як текст" }).click();
  await expect(guest.getByRole("status").filter({ hasText: "Текст скопійовано." })).toBeVisible();
  expect(await guest.evaluate(() => navigator.clipboard.readText())).toBe(listText);
  await guestContext.close();
});
