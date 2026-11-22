"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { updatePlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLAYLIST_DESCRIPTION_MAX, PLAYLIST_TITLE_MAX } from "@/playlists/limits";
import { DeletePlaylistDialog } from "./delete-playlist-dialog";

type PlaylistDetailsProps = { playlistId: string; title: string; description: string };

export function PlaylistDetails({ playlistId, title, description }: PlaylistDetailsProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <PlaylistForm
        playlistId={playlistId}
        title={title}
        description={description}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight break-words">{title}</h1>
      {description && <p className="whitespace-pre-line break-words text-muted-foreground">{description}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          Редагувати плейлист
        </Button>
        <DeletePlaylistDialog playlistId={playlistId} title={title} />
      </div>
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
      className="flex flex-col gap-3 rounded-xl border p-4"
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
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Зберегти
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onDone}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}
