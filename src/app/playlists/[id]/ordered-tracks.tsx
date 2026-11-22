"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useOptimistic, useState, useTransition } from "react";
import { reorderTracksAction } from "@/app/playlists/actions";
import { TrackItem, type Track } from "./track-item";

function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function OrderedTracks({ playlistId, tracks }: { playlistId: string; tracks: Track[] }) {
  const [ordered, setOptimisticOrder] = useOptimistic(tracks);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= ordered.length) return;
    const next = moved(ordered, from, to);
    startTransition(async () => {
      setOptimisticOrder(next);
      const result = await reorderTracksAction(
        playlistId,
        next.map((track) => track.id),
      );
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;
          const { source } = event.operation;
          if (isSortable(source)) move(source.initialIndex, source.index);
        }}
      >
        <ol aria-label="Треки" aria-busy={saving} className="panel flex flex-col divide-y transition-opacity duration-(--duration-base) aria-busy:opacity-80">
          {ordered.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
            />
          ))}
        </ol>
      </DragDropProvider>
    </div>
  );
}
