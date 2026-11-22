"use client";

import { useId, useSyncExternalStore } from "react";
import {
  disableSharingAction,
  enableSharingAction,
  regenerateShareTokenAction,
} from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClipboardCopy } from "../use-clipboard-copy";

const subscribeToNothing = () => () => {};

function useOrigin() {
  return useSyncExternalStore(subscribeToNothing, () => window.location.origin, () => "");
}

export function SharePanel({ playlistId, shareToken }: { playlistId: string; shareToken: string | null }) {
  const origin = useOrigin();
  const inputId = useId();
  const { copy, statusOf } = useClipboardCopy();

  if (!shareToken) {
    return (
      <section aria-label="Доступ за посиланням" className="flex flex-col gap-3 rounded-xl border p-4">
        <h2 className="text-lg font-medium">Доступ за посиланням</h2>
        <p className="text-sm text-muted-foreground">Плейлист приватний: його бачите лише ви.</p>
        <form action={enableSharingAction.bind(null, playlistId)}>
          <Button type="submit">Увімкнути доступ за посиланням</Button>
        </form>
      </section>
    );
  }

  const url = `${origin}/s/${shareToken}`;

  const status = statusOf(url);

  return (
    <section aria-label="Доступ за посиланням" className="flex flex-col gap-3 rounded-xl border p-4">
      <h2 className="text-lg font-medium">Доступ за посиланням</h2>
      <p className="text-sm text-muted-foreground">Усі, хто має посилання, можуть переглянути плейлист.</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>Посилання</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id={inputId} value={url} readOnly onFocus={(event) => event.currentTarget.select()} />
          <Button type="button" onClick={() => copy(url)}>
            Скопіювати посилання
          </Button>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {status === "copied" ? "Посилання скопійовано." : status === "failed" ? "Не вдалося скопіювати посилання." : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <form action={regenerateShareTokenAction.bind(null, playlistId)}>
          <Button type="submit" variant="outline">
            Перегенерувати посилання
          </Button>
        </form>
        <form action={disableSharingAction.bind(null, playlistId)}>
          <Button type="submit" variant="destructive">
            Вимкнути доступ
          </Button>
        </form>
      </div>
    </section>
  );
}
