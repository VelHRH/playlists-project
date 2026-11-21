"use client";

import { useState } from "react";
import { removeTrackAction, updateTrackAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { TrackForm } from "./track-form";

type Track = { id: string; artist: string; title: string; url: string | null; note: string | null };

export function TrackItem({ track, number }: { track: Track; number: number }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="px-4 py-3">
        <TrackForm
          label={`Редагування треку ${number}`}
          submitLabel="Зберегти"
          action={updateTrackAction.bind(null, track.id)}
          track={track}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{number}</span>
        <div className="min-w-0">
          <p className="break-words">
            {track.artist} —{" "}
            {track.url ? (
              <a href={track.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                {track.title}
              </a>
            ) : (
              <span className="font-medium">{track.title}</span>
            )}
          </p>
          {track.note && <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{track.note}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2 pl-9 sm:pl-0">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Редагувати
        </Button>
        <form action={removeTrackAction.bind(null, track.id)}>
          <Button type="submit" variant="destructive" size="sm">
            Видалити
          </Button>
        </form>
      </div>
    </li>
  );
}
