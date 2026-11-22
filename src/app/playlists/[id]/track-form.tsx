"use client";

import { startTransition, useActionState, useEffect, useId, useRef, type FormEvent } from "react";
import type { TrackFormState } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TRACK_ARTIST_MAX, TRACK_NOTE_MAX, TRACK_TITLE_MAX, TRACK_URL_MAX } from "@/playlists/limits";

type TrackFields = { artist: string; title: string; url: string | null; note: string | null };

type TrackFormProps = {
  label: string;
  submitLabel: string;
  action: (previous: TrackFormState, form: FormData) => Promise<TrackFormState>;
  track?: TrackFields;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function TrackForm({ label, submitLabel, action, track, onSaved, onCancel }: TrackFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null, saved: 0 });
  const formRef = useRef<HTMLFormElement>(null);
  const idPrefix = useId();
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    onSavedRef.current = onSaved;
  });

  useEffect(() => {
    if (state.saved === 0) return;
    formRef.current?.reset();
    onSavedRef.current?.();
  }, [state.saved]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(() => formAction(form));
  }

  const field = (name: string) => `${idPrefix}-${name}`;

  return (
    <form ref={formRef} onSubmit={handleSubmit} aria-label={label} className="flex flex-col gap-4">
      <fieldset disabled={pending} className="contents">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={field("artist")}>Виконавець</Label>
            <Input
              id={field("artist")}
              name="artist"
              defaultValue={track?.artist}
              maxLength={TRACK_ARTIST_MAX}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={field("title")}>Назва</Label>
            <Input id={field("title")} name="title" defaultValue={track?.title} maxLength={TRACK_TITLE_MAX} required />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={field("url")}>Посилання (необов&apos;язково)</Label>
          <Input
            id={field("url")}
            name="url"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={track?.url ?? ""}
            maxLength={TRACK_URL_MAX}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={field("note")}>Нотатка (необов&apos;язково)</Label>
          <Textarea id={field("note")} name="note" defaultValue={track?.note ?? ""} maxLength={TRACK_NOTE_MAX} />
        </div>
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Скасувати
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
