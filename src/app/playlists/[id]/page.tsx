import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { BackLink } from "@/components/back-link";
import { addTrackAction, addTracksFromTextAction } from "@/app/playlists/actions";
import { getPlaylistForOwner, PlaylistError } from "@/playlists/playlists";
import { formatTrackCount } from "@/lib/track-count";
import { CopyAsText } from "@/app/playlists/copy-as-text";
import { AddTrackDialog } from "./add-track-dialog";
import { BulkPasteDialog } from "./bulk-paste-dialog";
import { OrderedTracks } from "./ordered-tracks";
import { PlaylistDetails } from "./playlist-details";
import { SharePanel } from "./share-panel";

export const metadata: Metadata = { title: "Плейлист · Плейлисти" };

export default function PlaylistPage({ params }: PageProps<"/playlists/[id]">) {
  return (
    <Suspense fallback={null}>
      <OwnedPlaylist params={params} />
    </Suspense>
  );
}

async function OwnedPlaylist({ params }: Pick<PageProps<"/playlists/[id]">, "params">) {
  const { id } = await params;
  const user = await getCurrentUser();
  const playlist = await getPlaylistForOwner(user?.id ?? null, id).catch((error: unknown) => {
    if (error instanceof PlaylistError && error.code === "not-found") notFound();
    throw error;
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <BackLink />
      <PlaylistDetails playlistId={playlist.id} title={playlist.title} description={playlist.description} />
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            Треки{" "}
            <span className="font-sans text-base font-normal text-muted-foreground">
              · {formatTrackCount(playlist.tracks.length)}
            </span>
          </h2>
          <div className="flex items-center gap-1">
            {playlist.tracks.length > 0 && <CopyAsText tracks={playlist.tracks} />}
            <BulkPasteDialog action={addTracksFromTextAction.bind(null, playlist.id)} />
            <AddTrackDialog action={addTrackAction.bind(null, playlist.id)} />
          </div>
        </div>
        {playlist.tracks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-input/60 px-5 py-8 text-center text-muted-foreground">
            Тут поки порожньо. Додайте перший трек.
          </p>
        ) : (
          <OrderedTracks playlistId={playlist.id} tracks={playlist.tracks} />
        )}
      </section>
      <SharePanel playlistId={playlist.id} shareToken={playlist.shareToken} />
    </main>
  );
}
