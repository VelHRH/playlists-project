import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import { addTrack, addTracksFromText, createPlaylist, getPlaylistForOwner } from "./playlists";

describe("bulk paste", () => {
  beforeEach(resetDatabase);

  it("appends pasted tracks after the existing ones in line order", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await addTrack(owner, id, { artist: "Kalush", title: "Стефанія", note: "Вже був" });

    await addTracksFromText(owner, id, "Океан Ельзи - Обійми\n\nДахаБраха – Vesna\nJay-Z — Re-Make");

    const { tracks } = await getPlaylistForOwner(owner, id);
    expect(tracks).toMatchObject([
      { artist: "Kalush", title: "Стефанія", note: "Вже був" },
      { artist: "Океан Ельзи", title: "Обійми", url: null, note: null },
      { artist: "ДахаБраха", title: "Vesna", url: null, note: null },
      { artist: "Jay-Z", title: "Re-Make", url: null, note: null },
    ]);
  });

  it.each([
    { case: "an unrecognised line", text: "Океан Ельзи - Обійми\nБез розділювача\nДахаБраха - Vesna" },
    { case: "a line with a 201-character artist", text: `Океан Ельзи - Обійми\n${"а".repeat(201)} - Vesna` },
    { case: "a line with a 201-character title", text: `Океан Ельзи - Обійми\nДахаБраха - ${"а".repeat(201)}` },
    { case: "blank text", text: " \n\n " },
  ])("rejects text with $case as invalid and saves nothing", async ({ text }) => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTracksFromText(owner, id, text);

    await expect(attempt).rejects.toMatchObject({ code: "invalid" });
    expect((await getPlaylistForOwner(owner, id)).tracks).toEqual([]);
  });

  it("names the unrecognised lines in the error", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTracksFromText(owner, id, "Без розділювача\nОкеан Ельзи - Обійми\n\nKalush-Стефанія");

    await expect(attempt).rejects.toThrow(/1, 4/);
  });

  const lines = (count: number, from = 1) =>
    Array.from({ length: count }, (_, n) => `Виконавець - Трек ${from + n}`).join("\n");

  it("accepts 500 lines at once and rejects 501 as over the limit", async () => {
    const owner = await createUser("Олена");
    const full = await createPlaylist(owner, { title: "Повний" });
    const over = await createPlaylist(owner, { title: "Переповнений" });

    await addTracksFromText(owner, full.id, lines(500));
    const attempt = addTracksFromText(owner, over.id, lines(501));

    await expect(attempt).rejects.toMatchObject({ code: "limit-exceeded" });
    expect((await getPlaylistForOwner(owner, full.id)).tracks).toHaveLength(500);
    expect((await getPlaylistForOwner(owner, over.id)).tracks).toEqual([]);
  });

  it("counts unrecognised lines towards the 500-line limit", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTracksFromText(owner, id, `${lines(500)}\nБез розділювача`);

    await expect(attempt).rejects.toMatchObject({ code: "limit-exceeded" });
  });

  it("fills the playlist up to 500 tracks and rejects a paste that would go past it without saving any of it", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await addTracksFromText(owner, id, lines(300));

    await addTracksFromText(owner, id, lines(199, 301));
    const attempt = addTracksFromText(owner, id, lines(2, 500));

    await expect(attempt).rejects.toMatchObject({ code: "limit-exceeded" });
    const { tracks } = await getPlaylistForOwner(owner, id);
    expect(tracks).toHaveLength(499);
    expect(tracks.at(-1)).toMatchObject({ title: "Трек 499" });

    await addTracksFromText(owner, id, lines(1, 500));
    expect((await getPlaylistForOwner(owner, id)).tracks).toHaveLength(500);
  });

  it.each([
    { case: "another user", viewer: "other" },
    { case: "a guest", viewer: "guest" },
  ] as const)("reports someone else's playlist as not found when $case pastes tracks", async ({ viewer }) => {
    const owner = await createUser("Олена");
    const other = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTracksFromText(viewer === "other" ? other : null, id, "ДахаБраха - Vesna");

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
    expect((await getPlaylistForOwner(owner, id)).tracks).toEqual([]);
  });
});
