import { expect, test } from "@playwright/test";

test("guest sees the Ukrainian landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Плейлисти");
  await expect(
    page.getByRole("heading", { level: 1, name: "Плейлисти" }),
  ).toBeVisible();
  await expect(
    page.getByText("Створюйте списки треків і діліться ними з друзями"),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});
