"use client";

import { Plus } from "lucide-react";
import type { TrackFormState } from "@/app/playlists/actions";
import { IconButton } from "@/components/ui/icon-button";
import { Modal } from "@/components/ui/modal";
import { TrackForm } from "./track-form";

type AddTrackDialogProps = {
  action: (previous: TrackFormState, form: FormData) => Promise<TrackFormState>;
};

export function AddTrackDialog({ action }: AddTrackDialogProps) {
  return (
    <Modal
      title="Новий трек"
      trigger={(open) => (
        <IconButton label="Додати трек" variant="default" size="icon" onClick={open}>
          <Plus />
        </IconButton>
      )}
    >
      {(close) => (
        <TrackForm label="Новий трек" submitLabel="Додати трек" action={action} onSaved={close} onCancel={close} />
      )}
    </Modal>
  );
}
