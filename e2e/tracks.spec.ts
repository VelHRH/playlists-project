import { expect, test, type Page } from "@playwright/test";

async function signUpWithPlaylist(page: Page) {
  await page.goto("/sign-up");
  await page.getByLabel("Ім'я").fill("Олена");
  await page.getByLabel("Email").fill(`user-${crypto.randomUUID()}@example.com`);
  await page.getByLabel("Пароль").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Зареєструватися" }).click();
  await page.getByRole("button", { name: "Новий плейлист" }).click();
  await page.getByLabel("Назва").fill("Літо");
  await page.getByRole("button", { name: "Створити плейлист" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Літо" })).toBeVisible();
}

async function addTrack(page: Page, track: { artist: string; title: string; url?: string; note?: string }) {
  const form = page.getByRole("form", { name: "Новий трек" });
  if (!(await form.isVisible())) await page.getByRole("button", { name: "Додати трек" }).click();
  await form.getByLabel("Виконавець").fill(track.artist);
  await form.getByLabel("Назва").fill(track.title);
  await form.getByLabel("Посилання (необов'язково)").fill(track.url ?? "");
  await form.getByLabel("Нотатка (необов'язково)").fill(track.note ?? "");
  await form.getByRole("button", { name: "Додати трек" }).click();
}

test("owner adds, edits and removes tracks and sees the count in the list", async ({ page }) => {
  await signUpWithPlaylist(page);
  const tracks = page.getByRole("list", { name: "Треки" });

  await addTrack(page, { artist: "ДахаБраха", title: "Vesna", url: "javascript:alert(1)" });
  await expect(page.getByRole("form", { name: "Новий трек" }).getByRole("alert")).toContainText(
    "Посилання має починатися з http:// або https://",
  );
  await expect(page.getByRole("form", { name: "Новий трек" }).getByLabel("Виконавець")).toHaveValue("ДахаБраха");

  await addTrack(page, { artist: "ДахаБраха", title: "Vesna", url: "https://example.com/vesna", note: "Для ранку" });
  await expect(tracks.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("form", { name: "Новий трек" })).toBeHidden();
  await page.getByRole("button", { name: "Додати трек" }).click();
  await expect(page.getByRole("form", { name: "Новий трек" }).getByLabel("Виконавець")).toHaveValue("");
  await addTrack(page, { artist: "Океан Ельзи", title: "Обіми" });
  await expect(tracks.getByRole("listitem")).toHaveCount(2);
  await addTrack(page, { artist: "Океан Ельзи", title: "Обіми" });
  await expect(tracks.getByRole("listitem")).toHaveCount(3);
  const first = tracks.getByRole("listitem").nth(0);
  await expect(first).toContainText("ДахаБраха — Vesna");
  await expect(first).toContainText("Для ранку");
  const link = first.getByRole("link", { name: "Vesna" });
  await expect(link).toHaveAttribute("href", "https://example.com/vesna");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  const second = tracks.getByRole("listitem").nth(1);
  await second.getByRole("button", { name: "Редагувати" }).click();
  await second.getByLabel("Назва").fill("Обійми");
  await second.getByRole("button", { name: "Зберегти" }).click();
  await expect(second).toContainText("Океан Ельзи — Обійми");
  await expect(second.getByRole("button", { name: "Зберегти" })).toHaveCount(0);

  await tracks.getByRole("listitem").nth(2).getByRole("button", { name: "Видалити" }).click();
  await expect(tracks.getByRole("listitem")).toHaveCount(2);
  await expect(tracks).toContainText("Океан Ельзи — Обійми");

  await page.getByRole("link", { name: "Мої плейлисти", exact: true }).click();
  await expect(page.getByRole("list", { name: "Мої плейлисти" }).getByRole("listitem")).toContainText("2 треки");
});

test("owner pastes a list, fixes the unrecognised line and saves the tracks in order", async ({ page }) => {
  await signUpWithPlaylist(page);
  await addTrack(page, { artist: "Kalush", title: "Стефанія" });
  const tracks = page.getByRole("list", { name: "Треки" });
  await expect(tracks.getByRole("listitem")).toHaveCount(1);

  await page.getByRole("button", { name: "Вставити списком" }).click();
  const dialog = page.getByRole("dialog", { name: "Масова вставка" });
  await dialog.getByLabel("Текст").fill("Океан Ельзи - Обійми\n\nДахаБраха Vesna\nJay-Z — Re-Make");
  await dialog.getByRole("button", { name: "Переглянути" }).click();

  await expect(dialog.getByRole("list", { name: "Розпізнані треки" }).getByRole("listitem")).toHaveText([
    /Океан Ельзи — Обійми/,
    /Jay-Z — Re-Make/,
  ]);
  await expect(dialog.getByRole("button", { name: "Зберегти" })).toBeDisabled();
  await dialog.getByLabel("Рядок 3").fill("ДахаБраха – Vesna");
  await dialog.getByRole("button", { name: "Перевірити ще раз" }).click();
  await expect(dialog.getByRole("region", { name: "Нерозпізнані рядки" })).toHaveCount(0);
  await expect(dialog.getByRole("list", { name: "Розпізнані треки" }).getByRole("listitem")).toHaveCount(3);
  await dialog.getByRole("button", { name: "Зберегти" }).click();

  await expect(dialog).toBeHidden();
  await expect(tracks.getByRole("listitem")).toHaveText([
    /Kalush — Стефанія/,
    /Океан Ельзи — Обійми/,
    /ДахаБраха — Vesna/,
    /Jay-Z — Re-Make/,
  ]);
});

test("owner reorders tracks with the keyboard and by dragging, and the order survives a reload", async ({ page }) => {
  await signUpWithPlaylist(page);
  const tracks = page.getByRole("list", { name: "Треки" });
  for (const title of ["Перший", "Другий", "Третій"]) {
    await addTrack(page, { artist: "А", title });
    await expect(tracks.getByRole("listitem").last()).toContainText(title);
  }

  await page.getByRole("button", { name: "Перетягнути трек 1" }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(tracks.getByRole("listitem")).toHaveText([/Другий/, /Перший/, /Третій/]);
  await expect(tracks).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("[data-dnd-dragging]")).toHaveCount(0);

  const handle = page.getByRole("button", { name: "Перетягнути трек 3" });
  const target = tracks.getByRole("listitem").first();
  const from = (await handle.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, to.y + 4, { steps: 15 });
  await page.mouse.up();
  await expect(tracks.getByRole("listitem")).toHaveText([/Третій/, /Другий/, /Перший/]);
  await expect(tracks).toHaveAttribute("aria-busy", "false");

  await page.reload();
  await expect(tracks.getByRole("listitem")).toHaveText([/Третій/, /Другий/, /Перший/]);
});

test("owner reorders tracks by dragging on a touch screen", async ({ page, hasTouch }) => {
  test.skip(!hasTouch, "needs a touch screen");
  await signUpWithPlaylist(page);
  const tracks = page.getByRole("list", { name: "Треки" });
  for (const title of ["Перший", "Другий"]) {
    await addTrack(page, { artist: "А", title });
    await expect(tracks.getByRole("listitem").last()).toContainText(title);
  }

  const from = (await page.getByRole("button", { name: "Перетягнути трек 2" }).boundingBox())!;
  const to = (await tracks.getByRole("listitem").first().boundingBox())!;
  const x = from.x + from.width / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x, y }] });
  await touch("touchStart", from.y + from.height / 2);
  await page.waitForTimeout(400);
  for (let step = 1; step <= 15; step++) {
    await touch("touchMove", from.y + from.height / 2 + ((to.y + 4 - from.y - from.height / 2) * step) / 15);
  }
  await touch("touchEnd");

  await expect(tracks.getByRole("listitem")).toHaveText([/Другий/, /Перший/]);
  await expect(tracks).toHaveAttribute("aria-busy", "false");
  await page.reload();
  await expect(tracks.getByRole("listitem")).toHaveText([/Другий/, /Перший/]);
});
