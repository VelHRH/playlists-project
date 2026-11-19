import { expect, test, type Page } from "@playwright/test";

const password = "correct-horse-battery";

function uniqueEmail() {
  return `user-${crypto.randomUUID()}@example.com`;
}

async function signUp(page: Page, { name, email }: { name: string; email: string }) {
  await page.goto("/");
  await page.getByRole("link", { name: "Зареєструватися" }).click();
  await page.getByLabel("Ім'я").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Зареєструватися" }).click();
}

async function signIn(page: Page, { email, password }: { email: string; password: string }) {
  await page.goto("/");
  await page.getByRole("link", { name: "Увійти" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Увійти" }).click();
}

async function expectSignedInAs(page: Page, name: string) {
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toBeVisible();
  await expect(page.getByText(name)).toBeVisible();
}

async function expectGuestLanding(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Плейлисти" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Увійти" })).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Вийти" }).click();
  await expectGuestLanding(page);
}

test("guest signs up, signs out, signs back in and signs out", async ({ page }) => {
  const email = uniqueEmail();

  await signUp(page, { name: "Олена", email });
  await expectSignedInAs(page, "Олена");

  await signOut(page);

  await signIn(page, { email, password });
  await expectSignedInAs(page, "Олена");

  await signOut(page);
});

test("session survives a page reload", async ({ page }) => {
  await signUp(page, { name: "Тарас", email: uniqueEmail() });
  await expectSignedInAs(page, "Тарас");

  await page.reload();

  await expectSignedInAs(page, "Тарас");
});

test("signing up with a taken email explains that the account exists", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, { name: "Перший", email });
  await expectSignedInAs(page, "Перший");
  await signOut(page);

  await signUp(page, { name: "Другий", email });

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Користувач з таким email уже існує. Спробуйте увійти.",
  );
});

test("failed sign-in shows the same message for a wrong password and an unknown email", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, { name: "Марія", email });
  await expectSignedInAs(page, "Марія");
  await signOut(page);

  await signIn(page, { email, password: "wrong-password-123" });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Неправильний email або пароль.");

  await signIn(page, { email: uniqueEmail(), password });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Неправильний email або пароль.");
});

test("sign-up requires a display name", async ({ page }) => {
  await signUp(page, { name: "", email: uniqueEmail() });

  await expect(page).toHaveURL("/sign-up");
  await expect(page.getByRole("heading", { name: "Мої плейлисти" })).toHaveCount(0);
});
