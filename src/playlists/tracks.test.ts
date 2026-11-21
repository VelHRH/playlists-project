import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import {
  addTrack,
  createPlaylist,
  getPlaylistForOwner,
  listMyPlaylists,
  removeTrack,
  updateTrack,
} from "./playlists";

describe("tracks", () => {
  beforeEach(resetDatabase);

  it("adds tracks to the end of the playlist, duplicates included", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми", url: "https://youtu.be/x", note: "Перша" });
    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
    await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми" });

    const { tracks } = await getPlaylistForOwner(owner, id);
    expect(tracks).toMatchObject([
      { artist: "Океан Ельзи", title: "Обійми", url: "https://youtu.be/x", note: "Перша" },
      { artist: "ДахаБраха", title: "Vesna", url: null, note: null },
      { artist: "Океан Ельзи", title: "Обійми", url: null, note: null },
    ]);
  });

  it.each([
    { case: "another user", viewer: "other" },
    { case: "a guest", viewer: "guest" },
  ] as const)("reports someone else's playlist as not found when $case adds a track", async ({ viewer }) => {
    const owner = await createUser("Олена");
    const other = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTrack(viewer === "other" ? other : null, id, { artist: "ДахаБраха", title: "Vesna" });

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
    expect((await getPlaylistForOwner(owner, id)).tracks).toEqual([]);
  });

  it.each([
    { case: "an empty artist", input: { artist: " ", title: "Vesna" } },
    { case: "an empty title", input: { artist: "ДахаБраха", title: "" } },
    { case: "a 201-character artist", input: { artist: "а".repeat(201), title: "Vesna" } },
    { case: "a 201-character title", input: { artist: "ДахаБраха", title: "а".repeat(201) } },
    { case: "a 501-character note", input: { artist: "ДахаБраха", title: "Vesna", note: "а".repeat(501) } },
    { case: "a javascript: URL", input: { artist: "ДахаБраха", title: "Vesna", url: "javascript:alert(1)" } },
    { case: "an ftp: URL", input: { artist: "ДахаБраха", title: "Vesna", url: "ftp://example.com/a.mp3" } },
    { case: "a URL without a scheme", input: { artist: "ДахаБраха", title: "Vesna", url: "youtu.be/x" } },
    {
      case: "a 2049-character URL",
      input: { artist: "ДахаБраха", title: "Vesna", url: `https://example.com/${"a".repeat(2029)}` },
    },
  ])("rejects $case as invalid data", async ({ input }) => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = addTrack(owner, id, input);

    await expect(attempt).rejects.toMatchObject({ code: "invalid" });
    expect((await getPlaylistForOwner(owner, id)).tracks).toEqual([]);
  });

  it("accepts fields at their length limits and trims whitespace", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const url = `http://example.com/${"a".repeat(2029)}`;

    await addTrack(owner, id, {
      artist: ` ${"а".repeat(200)} `,
      title: "б".repeat(200),
      url: ` ${url} `,
      note: "в".repeat(500),
    });

    expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([
      { artist: "а".repeat(200), title: "б".repeat(200), url, note: "в".repeat(500) },
    ]);
  });

  it("stores blank optional fields as empty", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna", url: "  ", note: " " });

    expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([{ url: null, note: null }]);
  });

  it("allows the 500th track and rejects the 501st as over the limit", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    for (let n = 1; n < 500; n++) {
      await addTrack(owner, id, { artist: "Виконавець", title: `Трек ${n}` });
    }

    await addTrack(owner, id, { artist: "Виконавець", title: "Трек 500" });
    const overLimit = addTrack(owner, id, { artist: "Виконавець", title: "Трек 501" });

    await expect(overLimit).rejects.toMatchObject({ code: "limit-exceeded" });
    const { tracks } = await getPlaylistForOwner(owner, id);
    expect(tracks).toHaveLength(500);
    expect(tracks.at(-1)).toMatchObject({ title: "Трек 500" });
  }, 30_000);

  it("enforces the track limit when additions race", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    for (let n = 1; n < 499; n++) {
      await addTrack(owner, id, { artist: "Виконавець", title: `Трек ${n}` });
    }

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, n) => addTrack(owner, id, { artist: "Гонка", title: `${n}` })),
    );

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
    expect((await getPlaylistForOwner(owner, id)).tracks).toHaveLength(500);
  }, 30_000);

  it("lists playlists with their track counts, the one just given a track first", async () => {
    const owner = await createUser("Олена");
    const older = await createPlaylist(owner, { title: "Літо" });
    await createPlaylist(owner, { title: "Зима" });

    await addTrack(owner, older.id, { artist: "ДахаБраха", title: "Vesna" });
    await addTrack(owner, older.id, { artist: "Океан Ельзи", title: "Обійми" });

    expect(await listMyPlaylists(owner)).toMatchObject([
      { title: "Літо", trackCount: 2 },
      { title: "Зима", trackCount: 0 },
    ]);
  });

  it("reports a malformed playlist id as not found when adding a track", async () => {
    const owner = await createUser("Олена");

    const attempt = addTrack(owner, "not-a-playlist", { artist: "ДахаБраха", title: "Vesna" });

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
  });

  describe("updating", () => {
    it("replaces a track's fields in place", async () => {
      const owner = await createUser("Олена");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
      const second = await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обіми", url: "https://a.example" });
      await addTrack(owner, id, { artist: "Бумбокс", title: "Вахтерам" });

      await updateTrack(owner, second.id, { artist: "Океан Ельзи", title: "Обійми", note: "Виправлено" });

      expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([
        { title: "Vesna" },
        { artist: "Океан Ельзи", title: "Обійми", url: null, note: "Виправлено" },
        { title: "Вахтерам" },
      ]);
    });

    it("moves the playlist to the top of the list", async () => {
      const owner = await createUser("Олена");
      const older = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, older.id, { artist: "ДахаБраха", title: "Vesna" });
      await createPlaylist(owner, { title: "Зима" });

      await updateTrack(owner, added.id, { artist: "ДахаБраха", title: "Vesna (live)" });

      expect((await listMyPlaylists(owner)).map((p) => p.title)).toEqual(["Літо", "Зима"]);
    });

    it("rejects invalid data and keeps the track unchanged", async () => {
      const owner = await createUser("Олена");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });

      const attempt = updateTrack(owner, added.id, { artist: "ДахаБраха", title: "Vesna", url: "javascript:alert(1)" });

      await expect(attempt).rejects.toMatchObject({ code: "invalid" });
      expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([{ title: "Vesna", url: null }]);
    });

    it.each([
      { case: "another user", viewer: "other" },
      { case: "a guest", viewer: "guest" },
    ] as const)("reports someone else's track as not found to $case", async ({ viewer }) => {
      const owner = await createUser("Олена");
      const other = await createUser("Тарас");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });

      const attempt = updateTrack(viewer === "other" ? other : null, added.id, { artist: "Злам", title: "Злам" });

      await expect(attempt).rejects.toMatchObject({ code: "not-found" });
      expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([{ title: "Vesna" }]);
    });

    it.each([
      { case: "a missing id", id: crypto.randomUUID() },
      { case: "a malformed id", id: "not-a-track" },
    ])("reports $case as not found", async ({ id }) => {
      const owner = await createUser("Олена");

      const attempt = updateTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });

      await expect(attempt).rejects.toMatchObject({ code: "not-found" });
    });
  });

  describe("removing", () => {
    it("removes only that track and keeps the rest in order", async () => {
      const owner = await createUser("Олена");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
      const duplicate = await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми" });
      await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми" });

      await removeTrack(owner, duplicate.id);

      expect((await getPlaylistForOwner(owner, id)).tracks.map((t) => t.title)).toEqual(["Vesna", "Обійми"]);
    });

    it("adds the next track after the remaining ones", async () => {
      const owner = await createUser("Олена");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      await addTrack(owner, id, { artist: "А", title: "Перший" });
      const last = await addTrack(owner, id, { artist: "А", title: "Другий" });
      await removeTrack(owner, last.id);

      await addTrack(owner, id, { artist: "А", title: "Третій" });

      expect((await getPlaylistForOwner(owner, id)).tracks.map((t) => t.title)).toEqual(["Перший", "Третій"]);
    });

    it("moves the playlist to the top of the list", async () => {
      const owner = await createUser("Олена");
      const older = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, older.id, { artist: "ДахаБраха", title: "Vesna" });
      await createPlaylist(owner, { title: "Зима" });

      await removeTrack(owner, added.id);

      expect(await listMyPlaylists(owner)).toMatchObject([
        { title: "Літо", trackCount: 0 },
        { title: "Зима", trackCount: 0 },
      ]);
    });

    it.each([
      { case: "another user", viewer: "other" },
      { case: "a guest", viewer: "guest" },
    ] as const)("reports someone else's track as not found to $case", async ({ viewer }) => {
      const owner = await createUser("Олена");
      const other = await createUser("Тарас");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });

      const attempt = removeTrack(viewer === "other" ? other : null, added.id);

      await expect(attempt).rejects.toMatchObject({ code: "not-found" });
      expect((await getPlaylistForOwner(owner, id)).tracks).toHaveLength(1);
    });

    it("reports an already removed track as not found", async () => {
      const owner = await createUser("Олена");
      const { id } = await createPlaylist(owner, { title: "Літо" });
      const added = await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
      await removeTrack(owner, added.id);

      await expect(removeTrack(owner, added.id)).rejects.toMatchObject({ code: "not-found" });
    });
  });
});
