import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { playlist, user } from "@/db/schema";
import { PLAYLIST_DESCRIPTION_MAX, PLAYLIST_TITLE_MAX, PLAYLISTS_PER_USER_MAX } from "./limits";
import { PlaylistError } from "./playlist-error";

export { PlaylistError, type PlaylistErrorCode } from "./playlist-error";

export type PlaylistInput = { title: string; description?: string };

const playlistInputSchema = z.object({
  title: z.string().trim().min(1).max(PLAYLIST_TITLE_MAX),
  description: z.string().trim().max(PLAYLIST_DESCRIPTION_MAX).default(""),
});

function parsePlaylistInput(input: PlaylistInput) {
  const result = playlistInputSchema.safeParse(input);
  if (!result.success) {
    throw new PlaylistError(
      "invalid",
      `Назва обов'язкова й має бути до ${PLAYLIST_TITLE_MAX} символів, опис — до ${PLAYLIST_DESCRIPTION_MAX}.`,
    );
  }
  return result.data;
}

export async function createPlaylist(userId: string, input: PlaylistInput) {
  const values = parsePlaylistInput(input);
  return db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update");
    const [{ owned }] = await tx
      .select({ owned: count() })
      .from(playlist)
      .where(eq(playlist.ownerId, userId));
    if (owned >= PLAYLISTS_PER_USER_MAX) {
      throw new PlaylistError(
        "limit-exceeded",
        `Можна мати не більше ${PLAYLISTS_PER_USER_MAX} плейлистів. Видаліть непотрібні, щоб створити новий.`,
      );
    }
    const [created] = await tx
      .insert(playlist)
      .values({ ownerId: userId, ...values })
      .returning();
    return created;
  });
}

export async function listMyPlaylists(userId: string) {
  return db
    .select()
    .from(playlist)
    .where(eq(playlist.ownerId, userId))
    .orderBy(desc(playlist.updatedAt), desc(playlist.createdAt));
}

const playlistIdSchema = z.uuid();

export async function getPlaylistForOwner(userId: string | null, playlistId: string) {
  const notFoundError = new PlaylistError("not-found", "Плейлист не знайдено.");
  if (!userId || !playlistIdSchema.safeParse(playlistId).success) throw notFoundError;
  const [found] = await db
    .select()
    .from(playlist)
    .where(and(eq(playlist.id, playlistId), eq(playlist.ownerId, userId)));
  if (!found) throw notFoundError;
  return found;
}
