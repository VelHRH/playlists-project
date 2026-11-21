import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { TrackLine } from "@/app/playlists/track-line";
import { buttonVariants } from "@/components/ui/button";
import { formatTrackCount } from "@/lib/track-count";
import { getSharedPlaylist, PlaylistError } from "@/playlists/playlists";

export const metadata: Metadata = { title: "Плейлист · Плейлисти", robots: { index: false } };

export default function SharedPlaylistPage({ params }: PageProps<"/s/[token]">) {
  return (
    <Suspense fallback={null}>
      <SharedPlaylist params={params} />
    </Suspense>
  );
}

async function SharedPlaylist({ params }: Pick<PageProps<"/s/[token]">, "params">) {
  const { token } = await params;
  const [playlist, user] = await Promise.all([
    getSharedPlaylist(token).catch((error: unknown) => {
      if (error instanceof PlaylistError && error.code === "not-found") notFound();
      throw error;
    }),
    getCurrentUser(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
      {user?.id === playlist.ownerId && (
        <Link
          href={`/playlists/${playlist.id}`}
          className={buttonVariants({ variant: "outline", className: "self-start" })}
        >
          Редагувати плейлист
        </Link>
      )}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight break-words">{playlist.title}</h1>
        <p className="text-sm text-muted-foreground">Автор: {playlist.authorName}</p>
      </div>
      {playlist.description && (
        <p className="whitespace-pre-line break-words text-muted-foreground">{playlist.description}</p>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Треки · {formatTrackCount(playlist.tracks.length)}</h2>
        {playlist.tracks.length === 0 ? (
          <p className="text-muted-foreground">У цьому плейлисті поки немає треків.</p>
        ) : (
          <ol aria-label="Треки" className="flex flex-col divide-y rounded-xl border">
            {playlist.tracks.map((track, index) => (
              <li key={track.id} className="px-4 py-3">
                <TrackLine track={track} number={index + 1} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
