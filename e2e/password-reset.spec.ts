import { expect, test, type Page } from "@playwright/test";
import { emailsTo } from "./mail-outbox";

const oldPassword = "correct-horse-battery";
const newPassword = "new-staple-battery-42";
const requestConfirmation =
  "Якщо акаунт із цим email існує, ми надіслали на нього посилання для скидання пароля.";

function uniqueEmail() {
  return `user-${crypto.randomUUID()}@example.com`;
}

async function signUpAndSignOut(page: Page, email: string) {
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill("Ірина");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(oldPassword);
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
  await page.getByRole("button", { name: "Вийти" }).click();
  await expect(page.getByRole("link", { name: "Увійти" })).toBeVisible();
}

async function requestReset(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByRole("link", { name: "Забули пароль?" }).click();
  await expect(page).toHaveURL("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Надіслати посилання" }).click();
  await expect(page.getByRole("main").getByRole("status")).toHaveText(requestConfirmation);
}

async function resetLinkFor(email: string) {
  await expect.poll(async () => (await emailsTo(email)).length).toBe(1);
  const [message] = await emailsTo(email);
  expect(message.subject).toBe("Скидання пароля");
  const link = message.text.match(/https?:\/\/\S+/)?.[0];
  expect(link).toBeDefined();
  return link!;
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Увійти" }).click();
}

test("user resets a forgotten password via the emailed link", async ({ page }) => {
  const email = uniqueEmail();
  await signUpAndSignOut(page, email);

  await requestReset(page, email);
  const link = await resetLinkFor(email);

  await page.goto(link);
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  await page.getByLabel("Новий пароль").fill(newPassword);
  await page.getByRole("button", { name: "Зберегти пароль" }).click();

  await expect(page).toHaveURL("/sign-in?reset=done");
  await expect(page.getByRole("main").getByRole("status")).toHaveText("Пароль змінено. Увійдіть з новим паролем.");

  await signIn(page, email, oldPassword);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Неправильний email або пароль.");

  await signIn(page, email, newPassword);
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
});

test("a reset link works only once", async ({ page }) => {
  const email = uniqueEmail();
  await signUpAndSignOut(page, email);
  await requestReset(page, email);
  const link = await resetLinkFor(email);

  await page.goto(link);
  await page.getByLabel("Новий пароль").fill(newPassword);
  await page.getByRole("button", { name: "Зберегти пароль" }).click();
  await expect(page).toHaveURL("/sign-in?reset=done");

  await page.goto(link);

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Посилання для скидання пароля недійсне або застаріло.",
  );
  await expect(page.getByLabel("Новий пароль")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Запросити нове посилання" })).toHaveAttribute(
    "href",
    "/forgot-password",
  );
});

test("requesting a reset for an unknown email looks the same and sends nothing", async ({ page }) => {
  const email = uniqueEmail();

  await requestReset(page, email);

  await page.waitForTimeout(500);
  expect(await emailsTo(email)).toEqual([]);
});
