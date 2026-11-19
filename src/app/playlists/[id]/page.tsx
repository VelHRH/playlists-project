import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { getPlaylistForOwner, PlaylistError } from "@/playlists/playlists";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground underline">
        ← Мої плейлисти
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight break-words">{playlist.title}</h1>
      {playlist.description && (
        <p className="whitespace-pre-line break-words text-muted-foreground">{playlist.description}</p>
      )}
    </main>
  );
}
