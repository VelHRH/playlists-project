import { beforeEach, describe, expect, it } from "vitest";
import { auth } from "@/auth/auth";
import { createUser } from "@/test/create-user";
import { resetDatabase } from "@/test/reset-database";
import {
  addTrack,
  copySharedPlaylist,
  createPlaylist,
  disableSharing,
  enableSharing,
  getPlaylistForOwner,
  listMyPlaylists,
  removeTrack,
  updateTrack,
} from "./playlists";

const password = "correct-horse-battery";

async function signUp(name: string) {
  const { headers, response } = await auth.api.signUpEmail({
    body: { name, email: `${crypto.randomUUID()}@example.com`, password },
    returnHeaders: true,
  });
  const cookie = headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  return { id: response.user.id, headers: new Headers({ cookie }) };
}

describe("copying a shared playlist", () => {
  beforeEach(resetDatabase);

  it("gives the viewer a private copy with the same description and tracks", async () => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо", description: "Для дороги" });
    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna", url: "https://example.com/v", note: "Ранок" });
    await addTrack(owner, id, { artist: "Океан Ельзи", title: "Обійми" });
    const token = await enableSharing(owner, id);

    const copy = await copySharedPlaylist(viewer, token);

    expect(await getPlaylistForOwner(viewer, copy.id)).toMatchObject({
      ownerId: viewer,
      title: "Літо (копія)",
      description: "Для дороги",
      shareToken: null,
      tracks: [
        { position: 0, artist: "ДахаБраха", title: "Vesna", url: "https://example.com/v", note: "Ранок" },
        { position: 1, artist: "Океан Ельзи", title: "Обійми", url: null, note: null },
      ],
    });
  });

  it("keeps the copy unchanged when the original is edited or deleted", async () => {
    const owner = await signUp("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner.id, { title: "Літо" });
    const original = await addTrack(owner.id, id, { artist: "ДахаБраха", title: "Vesna" });
    const token = await enableSharing(owner.id, id);
    const copy = await copySharedPlaylist(viewer, token);

    await updateTrack(owner.id, original.id, { artist: "ДахаБраха", title: "Зміна" });
    await addTrack(owner.id, id, { artist: "Океан Ельзи", title: "Обійми" });
    expect((await getPlaylistForOwner(viewer, copy.id)).tracks).toMatchObject([{ title: "Vesna" }]);

    await auth.api.deleteUser({ headers: owner.headers, body: { password } });
    expect((await getPlaylistForOwner(viewer, copy.id)).tracks).toMatchObject([{ title: "Vesna" }]);
  });

  it("keeps the original unchanged when the copy is edited", async () => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await addTrack(owner, id, { artist: "ДахаБраха", title: "Vesna" });
    const token = await enableSharing(owner, id);
    const copy = await copySharedPlaylist(viewer, token);
    const [copiedTrack] = (await getPlaylistForOwner(viewer, copy.id)).tracks;

    await updateTrack(viewer, copiedTrack.id, { artist: "ДахаБраха", title: "Зміна" });
    await removeTrack(viewer, copiedTrack.id);

    expect((await getPlaylistForOwner(owner, id)).tracks).toMatchObject([{ title: "Vesna" }]);
  });

  it("refuses to save a copy once the viewer already has 1000 playlists", async () => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const token = await enableSharing(owner, id);
    for (let n = 1; n <= 1000; n++) {
      await createPlaylist(viewer, { title: `Плейлист ${n}` });
    }

    const overLimit = copySharedPlaylist(viewer, token);

    await expect(overLimit).rejects.toMatchObject({
      code: "limit-exceeded",
      message: expect.stringContaining("1000"),
    });
    expect(await listMyPlaylists(viewer)).toHaveLength(1000);
  }, 30_000);

  it("trims a long title so the copy's title stays within 200 characters", async () => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "а".repeat(200) });
    const token = await enableSharing(owner, id);

    const copy = await copySharedPlaylist(viewer, token);

    expect(copy.title).toBe(`${"а".repeat(192)} (копія)`);
    expect(copy.title).toHaveLength(200);
  });

  it.each([
    { case: "an unknown token", token: "x".repeat(43) },
    { case: "an empty token", token: "" },
  ])("reports $case as not found and saves nothing", async ({ token }) => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    await enableSharing(owner, id);

    await expect(copySharedPlaylist(viewer, token)).rejects.toMatchObject({ code: "not-found" });
    expect(await listMyPlaylists(viewer)).toEqual([]);
  });

  it("refuses a link that has been turned off", async () => {
    const owner = await createUser("Олена");
    const viewer = await createUser("Тарас");
    const { id } = await createPlaylist(owner, { title: "Літо" });
    const token = await enableSharing(owner, id);
    await disableSharing(owner, id);

    await expect(copySharedPlaylist(viewer, token)).rejects.toMatchObject({ code: "not-found" });
  });
});
