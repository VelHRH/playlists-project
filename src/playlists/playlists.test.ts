import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import { createPlaylist, getPlaylistForOwner, listMyPlaylists, PlaylistError } from "./playlists";

describe("playlists", () => {
  beforeEach(resetDatabase);

  it("lists a created playlist for its owner", async () => {
    const owner = await createUser("Олена");

    await createPlaylist(owner, { title: "Літо", description: "Для дороги" });

    const playlists = await listMyPlaylists(owner);
    expect(playlists).toMatchObject([{ title: "Літо", description: "Для дороги" }]);
  });

  it("does not list other users' playlists", async () => {
    const olena = await createUser("Олена");
    const taras = await createUser("Тарас");
    await createPlaylist(olena, { title: "Олена" });
    await createPlaylist(taras, { title: "Тарас" });

    const playlists = await listMyPlaylists(olena);

    expect(playlists.map((p) => p.title)).toEqual(["Олена"]);
  });

  it("lists the most recently changed playlist first", async () => {
    const owner = await createUser("Олена");
    await createPlaylist(owner, { title: "Перший" });
    await createPlaylist(owner, { title: "Другий" });
    await createPlaylist(owner, { title: "Третій" });

    const playlists = await listMyPlaylists(owner);

    expect(playlists.map((p) => p.title)).toEqual(["Третій", "Другий", "Перший"]);
  });

  it.each([
    { case: "an empty title", input: { title: "" } },
    { case: "a whitespace-only title", input: { title: "   " } },
    { case: "a 201-character title", input: { title: "а".repeat(201) } },
    { case: "a 1001-character description", input: { title: "Літо", description: "а".repeat(1001) } },
  ])("rejects $case as invalid data", async ({ input }) => {
    const owner = await createUser("Олена");

    const attempt = createPlaylist(owner, input);

    await expect(attempt).rejects.toBeInstanceOf(PlaylistError);
    await expect(attempt).rejects.toMatchObject({ code: "invalid" });
    expect(await listMyPlaylists(owner)).toEqual([]);
  });

  it("accepts a title and description at their length limits", async () => {
    const owner = await createUser("Олена");
    const title = "а".repeat(200);
    const description = "б".repeat(1000);

    await createPlaylist(owner, { title, description });

    expect(await listMyPlaylists(owner)).toMatchObject([{ title, description }]);
  });

  it("trims whitespace around the title and description", async () => {
    const owner = await createUser("Олена");

    await createPlaylist(owner, { title: "  Літо  ", description: "  Для дороги \n" });

    expect(await listMyPlaylists(owner)).toMatchObject([{ title: "Літо", description: "Для дороги" }]);
  });

  it("allows the 1000th playlist and rejects the 1001st as over the limit", async () => {
    const owner = await createUser("Олена");
    for (let n = 1; n < 1000; n++) {
      await createPlaylist(owner, { title: `Плейлист ${n}` });
    }

    await createPlaylist(owner, { title: "Плейлист 1000" });
    const overLimit = createPlaylist(owner, { title: "Плейлист 1001" });

    await expect(overLimit).rejects.toMatchObject({ code: "limit-exceeded" });
    expect(await listMyPlaylists(owner)).toHaveLength(1000);
  }, 30_000);

  it("counts the limit per user", async () => {
    const olena = await createUser("Олена");
    const taras = await createUser("Тарас");
    for (let n = 1; n <= 1000; n++) {
      await createPlaylist(olena, { title: `Плейлист ${n}` });
    }

    await createPlaylist(taras, { title: "Перший" });

    expect(await listMyPlaylists(taras)).toHaveLength(1);
  }, 30_000);

  it("enforces the limit when creations race", async () => {
    const owner = await createUser("Олена");
    for (let n = 1; n < 999; n++) {
      await createPlaylist(owner, { title: `Плейлист ${n}` });
    }

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, n) => createPlaylist(owner, { title: `Гонка ${n}` })),
    );

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(2);
    expect(await listMyPlaylists(owner)).toHaveLength(1000);
  }, 30_000);

  it("returns a playlist to its owner", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо", description: "Для дороги" });

    const found = await getPlaylistForOwner(owner, id);

    expect(found).toMatchObject({ id, title: "Літо", description: "Для дороги" });
  });

  it.each([
    { case: "another user", viewer: "other" },
    { case: "a guest", viewer: "guest" },
  ] as const)("reports someone else's playlist as not found to $case", async ({ viewer }) => {
    const owner = await createUser("Олена");
    const other = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = getPlaylistForOwner(viewer === "other" ? other : null, id);

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
  });

  it.each([
    { case: "a missing id", id: crypto.randomUUID() },
    { case: "a malformed id", id: "not-a-playlist" },
  ])("reports $case as not found", async ({ id }) => {
    const owner = await createUser("Олена");

    await expect(getPlaylistForOwner(owner, id)).rejects.toMatchObject({ code: "not-found" });
  });
});
