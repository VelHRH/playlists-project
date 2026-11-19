"use client";

import { useActionState } from "react";
import { createPlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLAYLIST_DESCRIPTION_MAX, PLAYLIST_TITLE_MAX } from "@/playlists/limits";

export function CreatePlaylistForm() {
  const [state, formAction, pending] = useActionState(createPlaylistAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border p-4">
      <h2 className="text-lg font-medium">Новий плейлист</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Назва</Label>
        <Input id="title" name="title" maxLength={PLAYLIST_TITLE_MAX} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Опис (необов&apos;язково)</Label>
        <Textarea id="description" name="description" maxLength={PLAYLIST_DESCRIPTION_MAX} />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        Створити плейлист
      </Button>
    </form>
  );
}
