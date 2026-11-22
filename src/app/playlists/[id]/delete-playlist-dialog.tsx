"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deletePlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";

export function DeletePlaylistDialog({ playlistId, title }: { playlistId: string; title: string }) {
  return (
    <Modal
      title="Видалити плейлист?"
      className="max-w-md"
      trigger={(open) => (
        <IconButton
          label="Видалити плейлист"
          size="icon"
          className="hover:bg-destructive/10 hover:text-destructive"
          onClick={open}
        >
          <Trash2 />
        </IconButton>
      )}
    >
      {(close) => (
        <form action={deletePlaylistAction.bind(null, playlistId)} className="flex flex-col gap-5">
          <p className="break-words text-sm text-muted-foreground">
            Плейлист «{title}» і всі його треки буде видалено без можливості відновлення. Посилання на нього
            перестане працювати, а копії, які інші люди зберегли собі, залишаться в них.
          </p>
          <ConfirmButtons onCancel={close} />
        </form>
      )}
    </Modal>
  );
}

function ConfirmButtons({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
        Скасувати
      </Button>
      <Button type="submit" variant="destructive" disabled={pending}>
        Так, видалити
      </Button>
    </div>
  );
}
