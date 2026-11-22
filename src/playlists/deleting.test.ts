import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import {
  addTrack,
  createPlaylist,
  deletePlaylist,
  enableSharing,
  getPlaylistForOwner,
  getSharedPlaylist,
  listMyPlaylists,
} from "./playlists";

describe("deleting a playlist", () => {
  beforeEach(resetDatabase);

  it("removes the playlist from its owner's list and stops serving its share link", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await createPlaylist(owner, { title: "Осінь" });
    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
    const token = await enableSharing(owner, id);

    await deletePlaylist(owner, id);

    expect((await listMyPlaylists(owner)).map((p) => p.title)).toEqual(["Осінь"]);
    await expect(getPlaylistForOwner(owner, id)).rejects.toMatchObject({ code: "not-found" });
    await expect(getSharedPlaylist(token)).rejects.toMatchObject({ code: "not-found" });
  });

  it.each([
    { case: "another user", viewer: "other" },
    { case: "a guest", viewer: "guest" },
  ] as const)("reports someone else's playlist as not found to $case and keeps it", async ({ viewer }) => {
    const owner = await createUser("Олена");
    const other = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const attempt = deletePlaylist(viewer === "other" ? other : null, id);

    await expect(attempt).rejects.toMatchObject({ code: "not-found" });
    expect(await getPlaylistForOwner(owner, id)).toMatchObject({ title: "Літо" });
  });

  it.each([
    { case: "a missing id", id: crypto.randomUUID() },
    { case: "a malformed id", id: "not-a-playlist" },
  ])("reports $case as not found", async ({ id }) => {
    const owner = await createUser("Олена");

    await expect(deletePlaylist(owner, id)).rejects.toMatchObject({ code: "not-found" });
  });
});
