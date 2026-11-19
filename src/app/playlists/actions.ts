"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth/current-user";
import { createPlaylist, PlaylistError } from "@/playlists/playlists";

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
