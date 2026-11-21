"use client";

import { useState } from "react";
import { removeTrackAction, updateTrackAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { TrackLine } from "../track-line";
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
      <TrackLine track={track} number={number} />
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
