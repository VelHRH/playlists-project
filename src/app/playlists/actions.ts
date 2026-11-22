"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/current-user";
import { signInReturningTo } from "@/auth/return-path";
import {
  addTrack,
  addTracksFromText,
  copySharedPlaylist,
  createPlaylist,
  disableSharing,
  enableSharing,
  PlaylistError,
  regenerateShareToken,
  removeTrack,
  updateTrack,
  type TrackInput,
} from "@/playlists/playlists";

export type CreatePlaylistState = { error: string | null };

export async function createPlaylistAction(
  _previous: CreatePlaylistState,
  form: FormData,
): Promise<CreatePlaylistState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  let id: string;
  try {
    ({ id } = await createPlaylist(user.id, {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
    }));
  } catch (error) {
    if (error instanceof PlaylistError) return { error: error.message };
    throw error;
  }
  redirect(`/playlists/${id}`);
}

export type TrackFormState = { error: string | null; saved: number };

function trackInput(form: FormData): TrackInput {
  return {
    artist: String(form.get("artist") ?? ""),
    title: String(form.get("title") ?? ""),
    url: String(form.get("url") ?? ""),
    note: String(form.get("note") ?? ""),
  };
}

async function saveTrack(previous: TrackFormState, save: (userId: string | null) => Promise<unknown>) {
  const user = await getCurrentUser();
  try {
    await save(user?.id ?? null);
  } catch (error) {
    if (error instanceof PlaylistError) return { error: error.message, saved: previous.saved };
    throw error;
  }
  refresh();
  return { error: null, saved: previous.saved + 1 };
}

export async function addTrackAction(
  playlistId: string,
  previous: TrackFormState,
  form: FormData,
): Promise<TrackFormState> {
  return saveTrack(previous, (userId) => addTrack(userId, playlistId, trackInput(form)));
}

export async function updateTrackAction(
  trackId: string,
  previous: TrackFormState,
  form: FormData,
): Promise<TrackFormState> {
  return saveTrack(previous, (userId) => updateTrack(userId, trackId, trackInput(form)));
}

export async function addTracksFromTextAction(
  playlistId: string,
  previous: TrackFormState,
  form: FormData,
): Promise<TrackFormState> {
  return saveTrack(previous, (userId) => addTracksFromText(userId, playlistId, String(form.get("text") ?? "")));
}

async function mutateIgnoringNotFound(mutate: (userId: string | null) => Promise<unknown>) {
  const user = await getCurrentUser();
  try {
    await mutate(user?.id ?? null);
  } catch (error) {
    if (!(error instanceof PlaylistError && error.code === "not-found")) throw error;
  }
  refresh();
}

export async function removeTrackAction(trackId: string) {
  await mutateIgnoringNotFound((userId) => removeTrack(userId, trackId));
}

export async function enableSharingAction(playlistId: string) {
  await mutateIgnoringNotFound((userId) => enableSharing(userId, playlistId));
}

export async function disableSharingAction(playlistId: string) {
  await mutateIgnoringNotFound((userId) => disableSharing(userId, playlistId));
}

export async function regenerateShareTokenAction(playlistId: string) {
  await mutateIgnoringNotFound((userId) => regenerateShareToken(userId, playlistId));
}

export type CopySharedPlaylistState = { error: string | null };

export async function copySharedPlaylistAction(token: string): Promise<CopySharedPlaylistState> {
  const user = await getCurrentUser();
  if (!user) redirect(signInReturningTo(`/s/${token}`));

  let id: string;
  try {
    ({ id } = await copySharedPlaylist(user.id, token));
  } catch (error) {
    if (error instanceof PlaylistError) return { error: error.message };
    throw error;
  }
  redirect(`/playlists/${id}`);
}
