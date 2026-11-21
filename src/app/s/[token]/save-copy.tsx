"use client";

import { useActionState } from "react";
import { copySharedPlaylistAction } from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";

export function SaveCopy({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(copySharedPlaylistAction.bind(null, token), {
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col gap-2 self-start">
      <Button type="submit" disabled={pending}>
        Зберегти копію
      </Button>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
