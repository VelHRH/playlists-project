"use client";

import { startTransition, useActionState, useEffect, useId, useRef, type FormEvent } from "react";
import { updatePlaylistAction } from "@/app/playlists/actions";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLAYLIST_DESCRIPTION_MAX, PLAYLIST_TITLE_MAX } from "@/playlists/limits";
import { DeletePlaylistDialog } from "./delete-playlist-dialog";

type PlaylistDetailsProps = { playlistId: string; title: string; description: string };

export function PlaylistDetails({ playlistId, title, description }: PlaylistDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="min-w-0 text-4xl font-semibold break-words sm:text-5xl">{title}</h1>
        <div className="mt-1 flex shrink-0 items-center gap-1 sm:mt-2">
          <Modal
            title="Редагувати плейлист"
            trigger={(open) => (
              <IconButton label="Редагувати плейлист" size="icon" onClick={open}>
                <Pencil />
              </IconButton>
            )}
          >
            {(close) => (
              <PlaylistForm playlistId={playlistId} title={title} description={description} onDone={close} />
            )}
          </Modal>
          <DeletePlaylistDialog playlistId={playlistId} title={title} />
        </div>
      </div>
      {description && (
        <p className="max-w-[65ch] whitespace-pre-line break-words text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function PlaylistForm({ playlistId, title, description, onDone }: PlaylistDetailsProps & { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updatePlaylistAction.bind(null, playlistId), {
    error: null,
    saved: 0,
  });
  const idPrefix = useId();
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (state.saved === 0) return;
    onDoneRef.current();
  }, [state.saved]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Редагування плейлиста"
      className="flex flex-col gap-4"
    >
      <fieldset disabled={pending} className="contents">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-title`}>Назва</Label>
          <Input id={`${idPrefix}-title`} name="title" defaultValue={title} maxLength={PLAYLIST_TITLE_MAX} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-description`}>Опис (необов&apos;язково)</Label>
          <Textarea
            id={`${idPrefix}-description`}
            name="description"
            defaultValue={description}
            maxLength={PLAYLIST_DESCRIPTION_MAX}
          />
        </div>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" disabled={pending} onClick={onDone}>
          Скасувати
        </Button>
        <Button type="submit" disabled={pending}>
          Зберегти
        </Button>
      </div>
    </form>
  );
}
