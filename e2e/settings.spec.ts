import { expect, test, type Page } from "@playwright/test";

const password = "correct-horse-battery";
const newPassword = "new-horse-battery";

async function signUp(page: Page, name: string) {
  const email = `user-${crypto.randomUUID()}@example.com`;
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
  return email;
}

async function signIn(page: Page, email: string, withPassword: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(withPassword);
  await page.getByRole("button", { name: "Увійти" }).click();
}

async function openSettings(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Налаштування" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Налаштування" })).toBeVisible();
}

test("guest opening settings is sent to sign-in", async ({ page }) => {
  await page.goto("/settings");

  await expect(page).toHaveURL("/sign-in");
});

test("user changes the display name and sees it right away", async ({ page }) => {
  await signUp(page, "Олена");
  await openSettings(page);
  const nameForm = page.getByRole("form", { name: "Ім'я для відображення" });

  await nameForm.getByLabel("Ім'я").fill("   ");
  await nameForm.getByRole("button", { name: "Зберегти ім'я" }).click();
  await expect(nameForm.getByRole("alert")).toHaveText("Вкажіть ім'я.");

  await nameForm.getByLabel("Ім'я").fill("Олена К.");
  await nameForm.getByRole("button", { name: "Зберегти ім'я" }).click();
  await expect(nameForm.getByRole("status")).toHaveText("Ім'я збережено.");

  await page.goto("/");
  await expect(page.getByText("Олена К.", { exact: true })).toBeVisible();
});

test("user changes the password only with the correct current password", async ({ page }) => {
  const email = await signUp(page, "Тарас");
  await openSettings(page);
  const passwordForm = page.getByRole("form", { name: "Пароль" });

  await passwordForm.getByLabel("Поточний пароль").fill("wrong-password-123");
  await passwordForm.getByLabel("Новий пароль").fill(newPassword);
  await passwordForm.getByRole("button", { name: "Змінити пароль" }).click();
  await expect(passwordForm.getByRole("alert")).toHaveText("Поточний пароль неправильний.");

  await passwordForm.getByLabel("Поточний пароль").fill(password);
  await passwordForm.getByLabel("Новий пароль").fill(newPassword);
  await passwordForm.getByRole("button", { name: "Змінити пароль" }).click();
  await expect(passwordForm.getByRole("status")).toHaveText("Пароль змінено.");

  await page.goto("/");
  await page.getByRole("button", { name: "Вийти" }).click();
  await signIn(page, email, password);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Неправильний email або пароль.");
  await signIn(page, email, newPassword);
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
});

test("user deletes the account after confirming and becomes a guest", async ({ page }) => {
  const email = await signUp(page, "Марія");
  await page.getByRole("button", { name: "Новий плейлист" }).click();
  await page.getByLabel("Назва").fill("Літо");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await expect(page.getByRole("heading", { name: "Літо" })).toBeVisible();
  await openSettings(page);
  const deleteForm = page.getByRole("form", { name: "Видалення акаунта" });

  await deleteForm.getByLabel("Пароль").fill(password);
  await deleteForm.getByRole("button", { name: "Видалити акаунт назавжди" }).click();
  await expect(page).toHaveURL("/settings");

  await deleteForm.getByLabel("Я розумію, що акаунт і всі плейлисти буде видалено без можливості відновлення").check();
  await deleteForm.getByRole("button", { name: "Видалити акаунт назавжди" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Увійти" })).toBeVisible();

  await signIn(page, email, password);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Неправильний email або пароль.");
});
