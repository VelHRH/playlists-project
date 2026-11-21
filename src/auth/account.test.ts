import { beforeEach, describe, expect, it } from "vitest";
import { auth } from "@/auth/auth";
import { createPlaylist, listMyPlaylists } from "@/playlists/playlists";
import { resetDatabase } from "@/test/reset-database";

const password = "correct-horse-battery";

async function signUp(name: string) {
  const { headers, response } = await auth.api.signUpEmail({
    body: { name, email: `${crypto.randomUUID()}@example.com`, password },
    returnHeaders: true,
  });
  const cookie = headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  return { id: response.user.id, headers: new Headers({ cookie }) };
}

describe("account", () => {
  beforeEach(resetDatabase);

  it("deleting an account removes its sessions and playlists but keeps other users' playlists", async () => {
    const olena = await signUp("Олена");
    const taras = await signUp("Тарас");
    await createPlaylist(olena.id, { title: "Літо" });
    await createPlaylist(olena.id, { title: "Зима" });
    await createPlaylist(taras.id, { title: "Літо (копія)" });

    await auth.api.deleteUser({ headers: olena.headers, body: { password } });

    expect(await auth.api.getSession({ headers: olena.headers })).toBeNull();
    expect(await listMyPlaylists(olena.id)).toEqual([]);
    expect((await listMyPlaylists(taras.id)).map((p) => p.title)).toEqual(["Літо (копія)"]);
  });

  it("does not delete an account when the password is wrong", async () => {
    const olena = await signUp("Олена");
    await createPlaylist(olena.id, { title: "Літо" });

    const attempt = auth.api.deleteUser({ headers: olena.headers, body: { password: "wrong-password-123" } });

    await expect(attempt).rejects.toMatchObject({ body: { code: "INVALID_PASSWORD" } });
    expect(await auth.api.getSession({ headers: olena.headers })).not.toBeNull();
    expect((await listMyPlaylists(olena.id)).map((p) => p.title)).toEqual(["Літо"]);
  });

  it("rejects a password change when the current password is wrong", async () => {
    const olena = await signUp("Олена");

    const attempt = auth.api.changePassword({
      headers: olena.headers,
      body: { currentPassword: "wrong-password-123", newPassword: "new-horse-battery" },
    });

    await expect(attempt).rejects.toMatchObject({ body: { code: "INVALID_PASSWORD" } });
  });

  it.each(["", "   "])("rejects the display name %j", async (name) => {
    const olena = await signUp("Олена");

    const attempt = auth.api.updateUser({ headers: olena.headers, body: { name } });

    await expect(attempt).rejects.toMatchObject({ body: { code: "INVALID_NAME" } });
    const session = await auth.api.getSession({ headers: olena.headers });
    expect(session?.user.name).toBe("Олена");
  });

  it("saves a trimmed display name", async () => {
    const olena = await signUp("Олена");

    await auth.api.updateUser({ headers: olena.headers, body: { name: "  Олена К.  " } });

    const session = await auth.api.getSession({ headers: olena.headers });
    expect(session?.user.name).toBe("Олена К.");
  });
});
