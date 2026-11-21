import { beforeEach, describe, expect, it } from "vitest";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import {
  addTrack,
  createPlaylist,
  disableSharing,
  enableSharing,
  getSharedPlaylist,
  listMyPlaylists,
  regenerateShareToken,
} from "./playlists";

describe("sharing", () => {
  beforeEach(resetDatabase);

  it("shows a shared playlist with its author's name and tracks to anyone holding the token", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо", description: "Для дороги" });
    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna", url: "https://example.com/v", note: "Ранок" });
    await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми" });

    const token = await enableSharing(owner, id);
    const shared = await getSharedPlaylist(token);

    expect(shared).toEqual({
      id,
      ownerId: owner,
      title: "Літо",
      description: "Для дороги",
      authorName: "Олена",
      tracks: [
        { id: expect.any(String), artist: "ДахаБраха", title: "Vesna", url: "https://example.com/v", note: "Ранок" },
        { id: expect.any(String), artist: "Океан Ельзи", title: "Обійми", url: null, note: null },
      ],
    });
  });

  it("keeps a new playlist private", async () => {
    const owner = await createUser("Олена");

    await createPlaylist(owner, { title: "Літо" });

    expect(await listMyPlaylists(owner)).toMatchObject([{ shareToken: null }]);
  });

  it("stops serving the playlist once sharing is turned off", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const token = await enableSharing(owner, id);

    await disableSharing(owner, id);

    await expect(getSharedPlaylist(token)).rejects.toMatchObject({ code: "not-found" });
    expect(await listMyPlaylists(owner)).toMatchObject([{ shareToken: null }]);
  });

  it("replaces the token on regeneration so only the new link works", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const oldToken = await enableSharing(owner, id);

    const newToken = await regenerateShareToken(owner, id);

    expect(newToken).not.toBe(oldToken);
    await expect(getSharedPlaylist(oldToken)).rejects.toMatchObject({ code: "not-found" });
    expect(await getSharedPlaylist(newToken)).toMatchObject({ id, title: "Літо" });
  });

  it("keeps the existing link when sharing is turned on again", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const first = await enableSharing(owner, id);

    const second = await enableSharing(owner, id);

    expect(second).toBe(first);
    expect(await getSharedPlaylist(first)).toMatchObject({ id });
  });

  it.each([
    { action: "turning sharing on", attempt: enableSharing },
    { action: "regenerating the link", attempt: regenerateShareToken },
    { action: "turning sharing off", attempt: disableSharing },
  ])("refuses $action to anyone but the owner, as not found", async ({ attempt }) => {
    const owner = await createUser("Олена");
    const stranger = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const token = await enableSharing(owner, id);

    await expect(attempt(stranger, id)).rejects.toMatchObject({ code: "not-found" });
    await expect(attempt(null, id)).rejects.toMatchObject({ code: "not-found" });

    expect(await listMyPlaylists(owner)).toMatchObject([{ shareToken: token }]);
  });

  it.each([
    { case: "an unknown token", token: "x".repeat(43) },
    { case: "an empty token", token: "" },
  ])("reports $case as not found", async ({ token }) => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await enableSharing(owner, id);

    await expect(getSharedPlaylist(token)).rejects.toMatchObject({ code: "not-found" });
  });

  it("issues URL-safe tokens of at least 128 bits", async () => {
    const owner = await createUser("Олена");
    const { id } = await createPlaylist(owner, { title: "Літо" });

    const token = await enableSharing(owner, id);

    expect(token).toMatch(/^[A-Za-z0-9_-]{22,}$/);
  });
});
