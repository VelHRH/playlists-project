"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { createPlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { PLAYLIST_DESCRIPTION_MAX, PLAYLIST_TITLE_MAX } from "@/playlists/limits";

export function CreatePlaylistDialog() {
  return (
    <Modal
      title="Новий плейлист"
      trigger={(open) => (
        <IconButton label="Новий плейлист" variant="default" size="icon-lg" onClick={open}>
          <Plus className="size-5" />
        </IconButton>
      )}
    >
      {(close) => <CreatePlaylistForm onCancel={close} />}
    </Modal>
  );
}

function CreatePlaylistForm({ onCancel }: { onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(createPlaylistAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Скасувати
        </Button>
        <Button type="submit" disabled={pending}>
          Створити плейлист
        </Button>
      </div>
    </form>
  );
}
