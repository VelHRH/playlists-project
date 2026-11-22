import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import { createPlaylist, getPlaylistForOwner, listMyPlaylists, updatePlaylist } from "./playlists";

describe("editing a playlist", () => {
  beforeEach(resetDatabase);

  it("changes the title and description", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо", description: "Для дороги" });

    await updatePlaylist(owner, id, { title: "  Осінь ", description: " Для дощу " });

    expect(await getPlaylistForOwner(owner, id)).toMatchObject({ title: "Осінь", description: "Для дощу" });
  });

  it("moves the edited playlist to the top of the owner's list", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Перший" });
    await createPlaylist(owner, { title: "Другий" });

    await updatePlaylist(owner, id, { title: "Перший, оновлений" });

    expect((await listMyPlaylists(owner)).map((p) => p.title)).toEqual(["Перший, оновлений", "Другий"]);
  });

  it.each([
    { case: "an empty title", input: { title: "" } },
    { case: "a whitespace-only title", input: { title: "   " } },
    { case: "a 201-character title", input: { title: "а".repeat(201) } },
    { case: "a 1001-character description", input: { title: "Осінь", description: "а".repeat(1001) } },
  ])("rejects $case and keeps the playlist as it was", async ({ input }) => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо", description: "Для дороги" });

    await expect(updatePlaylist(owner, id, input)).rejects.toMatchObject({ code: "invalid" });
    expect(await getPlaylistForOwner(owner, id)).toMatchObject({ title: "Літо", description: "Для дороги" });
  });

  it.each([
    { case: "another user", viewer: "other" },
    { case: "a guest", viewer: "guest" },
  ] as const)("reports someone else's playlist as not found to $case", async ({ viewer }) => {
    const owner = await createUser("Олена");
    const other = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = updatePlaylist(viewer === "other" ? other : null, id, { title: "Моє" });

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
    expect(await getPlaylistForOwner(owner, id)).toMatchObject({ title: "Літо" });
  });
});
