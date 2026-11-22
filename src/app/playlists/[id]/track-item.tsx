"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useState } from "react";
import { removeTrackAction, updateTrackAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { TrackLine } from "../track-line";
import { TrackForm } from "./track-form";

export type Track = { id: string; artist: string; title: string; url: string | null; note: string | null };

type TrackItemProps = {
  track: Track;
  index: number;
  total: number;
  onMove: (to: number) => void;
};

export function TrackItem({ track, index, total, onMove }: TrackItemProps) {
  const [editing, setEditing] = useState(false);
  const { ref, handleRef, isDragging } = useSortable({ id: track.id, index });
  const number = index + 1;

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
    <li
      ref={ref}
      data-dragging={isDragging || undefined}
      className="flex flex-col gap-2 bg-background px-4 py-3 data-dragging:opacity-60 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-1">
        <Button
          ref={handleRef}
          variant="ghost"
          size="icon-sm"
          className="-ml-2 shrink-0 cursor-grab touch-none active:cursor-grabbing"
          aria-label={`Перетягнути трек ${number}`}
        >
          <GripVertical />
        </Button>
        <TrackLine track={track} number={number} />
      </div>
      <div className="flex shrink-0 gap-2 pl-9 sm:pl-0">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Перемістити трек ${number} вгору`}
          disabled={index === 0}
          onClick={() => onMove(index - 1)}
        >
          <ArrowUp />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Перемістити трек ${number} вниз`}
          disabled={index === total - 1}
          onClick={() => onMove(index + 1)}
        >
          <ArrowDown />
        </Button>
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
