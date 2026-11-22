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
  deletePlaylist,
  disableSharing,
  enableSharing,
  PlaylistError,
  regenerateShareToken,
  removeTrack,
  reorderTracks,
  updatePlaylist,
  updateTrack,
  type PlaylistInput,
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
    ({ id } = await createPlaylist(user.id, playlistInput(form)));
  } catch (error) {
    if (error instanceof PlaylistError) return { error: error.message };
    throw error;
  }
  redirect(`/playlists/${id}`);
}

function playlistInput(form: FormData): PlaylistInput {
  return {
    title: String(form.get("title") ?? ""),
    description: String(form.get("description") ?? ""),
  };
}

export type PlaylistFormState = { error: string | null; saved: number };

export async function updatePlaylistAction(
  playlistId: string,
  previous: PlaylistFormState,
  form: FormData,
): Promise<PlaylistFormState> {
  const user = await getCurrentUser();
  try {
    await updatePlaylist(user?.id ?? null, playlistId, playlistInput(form));
  } catch (error) {
    if (error instanceof PlaylistError) return { error: error.message, saved: previous.saved };
    throw error;
  }
  refresh();
  return { error: null, saved: previous.saved + 1 };
}

export async function deletePlaylistAction(playlistId: string) {
  const user = await getCurrentUser();
  try {
    await deletePlaylist(user?.id ?? null, playlistId);
  } catch (error) {
    if (!(error instanceof PlaylistError && error.code === "not-found")) throw error;
  }
  redirect("/");
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

export type ReorderTracksState = { error: string | null };

export async function reorderTracksAction(playlistId: string, trackIds: string[]): Promise<ReorderTracksState> {
  try {
    await mutateIgnoringNotFound((userId) => reorderTracks(userId, playlistId, trackIds));
  } catch (error) {
    if (!(error instanceof PlaylistError)) throw error;
    refresh();
    return { error: error.message };
  }
  return { error: null };
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
