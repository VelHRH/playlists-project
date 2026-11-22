import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { signInReturningTo } from "@/auth/return-path";
import { TrackLine } from "@/app/playlists/track-line";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { formatTrackCount } from "@/lib/track-count";
import { getSharedPlaylist, PlaylistError } from "@/playlists/playlists";
import { CopyAsText } from "@/app/playlists/copy-as-text";
import { SaveCopy } from "./save-copy";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <Wordmark />
      {user?.id === playlist.ownerId ? (
        <Link
          href={`/playlists/${playlist.id}`}
          className={buttonVariants({ variant: "outline", className: "self-start" })}
        >
          Редагувати плейлист
        </Link>
      ) : user ? (
        <SaveCopy token={token} />
      ) : (
        <Link
          href={signInReturningTo(`/s/${token}`)}
          className={buttonVariants({ className: "self-start" })}
        >
          Зберегти копію
        </Link>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold break-words sm:text-5xl">{playlist.title}</h1>
        <p className="text-sm text-muted-foreground">Автор: <span className="font-medium text-foreground">{playlist.authorName}</span></p>
      </div>
      {playlist.description && (
        <p className="max-w-[65ch] whitespace-pre-line break-words text-lg leading-8 text-muted-foreground">{playlist.description}</p>
      )}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            Треки <span className="font-sans text-base font-normal text-muted-foreground">· {formatTrackCount(playlist.tracks.length)}</span>
          </h2>
          {playlist.tracks.length > 0 && <CopyAsText tracks={playlist.tracks} />}
        </div>
        {playlist.tracks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-input/60 px-5 py-8 text-center text-muted-foreground">
            У цьому плейлисті поки немає треків.
          </p>
        ) : (
          <ol aria-label="Треки" className="panel flex flex-col divide-y overflow-hidden">
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
