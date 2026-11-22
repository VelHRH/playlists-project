"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { removeTrackAction, updateTrackAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { TrackLine } from "../track-line";
import { TrackForm } from "./track-form";

export type Track = { id: string; artist: string; title: string; url: string | null; note: string | null };

type TrackItemProps = {
  track: Track;
  index: number;
};

export function TrackItem({ track, index }: TrackItemProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: track.id, index });
  const number = index + 1;

  return (
    <li
      ref={ref}
      data-dragging={isDragging || undefined}
      className="group/track flex items-center gap-1 px-2 py-2.5 transition-colors duration-(--duration-fast) first:rounded-t-xl last:rounded-b-xl hover:bg-accent/40 data-dragging:z-10 data-dragging:rounded-xl data-dragging:bg-card data-dragging:shadow-lg data-dragging:ring-2 data-dragging:ring-primary/40 sm:px-3"
    >
      <Button
        ref={handleRef}
        variant="ghost"
        size="icon-sm"
        className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
        aria-label={`Перетягнути трек ${number}`}
      >
        <GripVertical />
      </Button>
      <div className="min-w-0 flex-1">
        <TrackLine track={track} number={number} />
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:opacity-60 sm:transition-opacity sm:duration-(--duration-fast) sm:group-hover/track:opacity-100 sm:group-focus-within/track:opacity-100">
        <Modal
          title="Редагувати трек"
          trigger={(open) => (
            <IconButton label="Редагувати" onClick={open}>
              <Pencil />
            </IconButton>
          )}
        >
          {(close) => (
            <TrackForm
              label={`Редагування треку ${number}`}
              submitLabel="Зберегти"
              action={updateTrackAction.bind(null, track.id)}
              track={track}
              onSaved={close}
              onCancel={close}
            />
          )}
        </Modal>
        <form action={removeTrackAction.bind(null, track.id)}>
          <IconButton label="Видалити" type="submit" className="hover:bg-destructive/10 hover:text-destructive">
            <Trash2 />
          </IconButton>
        </form>
      </div>
    </li>
  );
}
