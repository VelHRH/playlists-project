import { randomBytes } from "node:crypto";
import { and, asc, count, desc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { playlist, track, user } from "@/db/schema";
import {
  PLAYLIST_DESCRIPTION_MAX,
  PLAYLIST_TITLE_MAX,
  PLAYLISTS_PER_USER_MAX,
  TRACK_ARTIST_MAX,
  TRACK_NOTE_MAX,
  TRACK_TITLE_MAX,
  TRACK_URL_MAX,
  TRACKS_PER_PLAYLIST_MAX,
} from "./limits";
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

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function ensureRoomForPlaylist(tx: Transaction, userId: string) {
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
}

export async function createPlaylist(userId: string, input: PlaylistInput) {
  const values = parsePlaylistInput(input);
  return db.transaction(async (tx) => {
    await ensureRoomForPlaylist(tx, userId);
    const [created] = await tx
      .insert(playlist)
      .values({ ownerId: userId, ...values })
      .returning();
    return created;
  });
}

export async function listMyPlaylists(userId: string) {
  return db
    .select({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      shareToken: playlist.shareToken,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      trackCount: db.$count(track, eq(track.playlistId, playlist.id)),
    })
    .from(playlist)
    .where(eq(playlist.ownerId, userId))
    .orderBy(desc(playlist.updatedAt), desc(playlist.createdAt));
}

const playlistIdSchema = z.uuid();

function playlistNotFound() {
  return new PlaylistError("not-found", "Плейлист не знайдено.");
}

async function lockOwnedPlaylist(tx: Transaction, userId: string | null, playlistId: string) {
  if (!userId || !playlistIdSchema.safeParse(playlistId).success) throw playlistNotFound();
  const [found] = await tx
    .select({ shareToken: playlist.shareToken })
    .from(playlist)
    .where(and(eq(playlist.id, playlistId), eq(playlist.ownerId, userId)))
    .for("update");
  if (!found) throw playlistNotFound();
  return found;
}

async function markPlaylistChanged(tx: Transaction, playlistId: string) {
  await tx.update(playlist).set({ updatedAt: new Date() }).where(eq(playlist.id, playlistId));
}

export async function getPlaylistForOwner(userId: string | null, playlistId: string) {
  if (!userId || !playlistIdSchema.safeParse(playlistId).success) throw playlistNotFound();
  const [found] = await db
    .select()
    .from(playlist)
    .where(and(eq(playlist.id, playlistId), eq(playlist.ownerId, userId)));
  if (!found) throw playlistNotFound();
  const tracks = await db
    .select()
    .from(track)
    .where(eq(track.playlistId, playlistId))
    .orderBy(asc(track.position));
  return { ...found, tracks };
}

export type TrackInput = { artist: string; title: string; url?: string; note?: string };

const optionalText = (schema: z.ZodType<string, string>) =>
  z
    .string()
    .trim()
    .default("")
    .transform((value) => (value === "" ? null : value))
    .pipe(schema.nullable());

const trackInputSchema = z.object({
  artist: z.string().trim().min(1).max(TRACK_ARTIST_MAX),
  title: z.string().trim().min(1).max(TRACK_TITLE_MAX),
  url: optionalText(z.url({ protocol: /^https?$/ }).max(TRACK_URL_MAX)),
  note: optionalText(z.string().max(TRACK_NOTE_MAX)),
});

function parseTrackInput(input: TrackInput) {
  const result = trackInputSchema.safeParse(input);
  if (!result.success) {
    throw new PlaylistError(
      "invalid",
      `Виконавець і назва обов'язкові й мають бути до ${TRACK_TITLE_MAX} символів, нотатка — до ${TRACK_NOTE_MAX}. Посилання має починатися з http:// або https:// і бути до ${TRACK_URL_MAX} символів.`,
    );
  }
  return result.data;
}

export async function addTrack(userId: string | null, playlistId: string, input: TrackInput) {
  const values = parseTrackInput(input);
  return db.transaction(async (tx) => {
    await lockOwnedPlaylist(tx, userId, playlistId);
    const [{ last, total }] = await tx
      .select({ last: max(track.position), total: count() })
      .from(track)
      .where(eq(track.playlistId, playlistId));
    if (total >= TRACKS_PER_PLAYLIST_MAX) {
      throw new PlaylistError(
        "limit-exceeded",
        `У плейлисті може бути не більше ${TRACKS_PER_PLAYLIST_MAX} треків. Видаліть непотрібні, щоб додати новий.`,
      );
    }
    const [created] = await tx
      .insert(track)
      .values({
        playlistId,
        position: (last ?? -1) + 1,
        ...values,
      })
      .returning();
    await markPlaylistChanged(tx, playlistId);
    return created;
  });
}

function trackNotFound() {
  return new PlaylistError("not-found", "Трек не знайдено.");
}

const trackIdSchema = z.uuid();

async function lockOwnedTrack(tx: Transaction, userId: string | null, trackId: string) {
  if (!userId || !trackIdSchema.safeParse(trackId).success) throw trackNotFound();
  const [found] = await tx
    .select({ playlistId: track.playlistId })
    .from(track)
    .innerJoin(playlist, eq(playlist.id, track.playlistId))
    .where(and(eq(track.id, trackId), eq(playlist.ownerId, userId)))
    .for("update", { of: playlist });
  if (!found) throw trackNotFound();
  return found.playlistId;
}

export async function updateTrack(userId: string | null, trackId: string, input: TrackInput) {
  const values = parseTrackInput(input);
  return db.transaction(async (tx) => {
    const playlistId = await lockOwnedTrack(tx, userId, trackId);
    const [updated] = await tx.update(track).set(values).where(eq(track.id, trackId)).returning();
    await markPlaylistChanged(tx, playlistId);
    return updated;
  });
}

export async function removeTrack(userId: string | null, trackId: string) {
  await db.transaction(async (tx) => {
    const playlistId = await lockOwnedTrack(tx, userId, trackId);
    await tx.delete(track).where(eq(track.id, trackId));
    await markPlaylistChanged(tx, playlistId);
  });
}

function newShareToken() {
  return randomBytes(32).toString("base64url");
}

async function setShareToken(userId: string | null, playlistId: string, { keepExisting }: { keepExisting: boolean }) {
  return db.transaction(async (tx) => {
    const { shareToken: existing } = await lockOwnedPlaylist(tx, userId, playlistId);
    if (keepExisting && existing) return existing;
    const shareToken = newShareToken();
    await tx.update(playlist).set({ shareToken }).where(eq(playlist.id, playlistId));
    return shareToken;
  });
}

export async function enableSharing(userId: string | null, playlistId: string) {
  return setShareToken(userId, playlistId, { keepExisting: true });
}

export async function regenerateShareToken(userId: string | null, playlistId: string) {
  return setShareToken(userId, playlistId, { keepExisting: false });
}

export async function getSharedPlaylist(token: string) {
  const [found] = await db
    .select({
      id: playlist.id,
      ownerId: playlist.ownerId,
      title: playlist.title,
      description: playlist.description,
      authorName: user.name,
    })
    .from(playlist)
    .innerJoin(user, eq(user.id, playlist.ownerId))
    .where(eq(playlist.shareToken, token));
  if (!found) throw playlistNotFound();
  const tracks = await db
    .select({ id: track.id, artist: track.artist, title: track.title, url: track.url, note: track.note })
    .from(track)
    .where(eq(track.playlistId, found.id))
    .orderBy(asc(track.position));
  return { ...found, tracks };
}

const COPY_SUFFIX = " (копія)";

function copyTitle(title: string) {
  return title.slice(0, PLAYLIST_TITLE_MAX - COPY_SUFFIX.length).trimEnd() + COPY_SUFFIX;
}

export async function copySharedPlaylist(userId: string, token: string) {
  return db.transaction(async (tx) => {
    const [original] = await tx
      .select({ id: playlist.id, title: playlist.title, description: playlist.description })
      .from(playlist)
      .where(eq(playlist.shareToken, token))
      .for("share");
    if (!original) throw playlistNotFound();
    await ensureRoomForPlaylist(tx, userId);
    const [copy] = await tx
      .insert(playlist)
      .values({ ownerId: userId, title: copyTitle(original.title), description: original.description })
      .returning();
    const tracks = await tx
      .select({ position: track.position, artist: track.artist, title: track.title, url: track.url, note: track.note })
      .from(track)
      .where(eq(track.playlistId, original.id));
    if (tracks.length > 0) {
      await tx.insert(track).values(tracks.map((t) => ({ ...t, playlistId: copy.id })));
    }
    return copy;
  });
}

export async function disableSharing(userId: string | null, playlistId: string) {
  await db.transaction(async (tx) => {
    await lockOwnedPlaylist(tx, userId, playlistId);
    await tx.update(playlist).set({ shareToken: null }).where(eq(playlist.id, playlistId));
  });
}
