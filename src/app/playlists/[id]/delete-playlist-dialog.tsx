"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { deletePlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";

export function DeletePlaylistDialog({ playlistId, title }: { playlistId: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button type="button" variant="destructive" size="sm" onClick={() => dialogRef.current?.showModal()}>
        Видалити плейлист
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border bg-background p-0 text-foreground backdrop:bg-black/50"
      >
        <form action={deletePlaylistAction.bind(null, playlistId)} className="flex flex-col gap-4 p-4">
          <h2 id={headingId} className="text-lg font-medium">
            Видалити плейлист?
          </h2>
          <p className="break-words text-sm text-muted-foreground">
            Плейлист «{title}» і всі його треки буде видалено без можливості відновлення. Посилання на нього
            перестане працювати, а копії, які інші люди зберегли собі, залишаться в них.
          </p>
          <ConfirmButtons onCancel={close} />
        </form>
      </dialog>
    </>
  );
}

function ConfirmButtons({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" variant="destructive" disabled={pending}>
        Так, видалити
      </Button>
      <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
        Скасувати
      </Button>
    </div>
  );
}
