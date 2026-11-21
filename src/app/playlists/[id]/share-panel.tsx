"use client";

import { useId, useState, useSyncExternalStore } from "react";
import {
  disableSharingAction,
  enableSharingAction,
  regenerateShareTokenAction,
} from "@/app/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const subscribeToNothing = () => () => {};

function useOrigin() {
  return useSyncExternalStore(subscribeToNothing, () => window.location.origin, () => "");
}

export function SharePanel({ playlistId, shareToken }: { playlistId: string; shareToken: string | null }) {
  const origin = useOrigin();
  const inputId = useId();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
  }

  return (
    <section aria-label="Доступ за посиланням" className="flex flex-col gap-3 rounded-xl border p-4">
      <h2 className="text-lg font-medium">Доступ за посиланням</h2>
      <p className="text-sm text-muted-foreground">Усі, хто має посилання, можуть переглянути плейлист.</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>Посилання</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id={inputId} value={url} readOnly onFocus={(event) => event.currentTarget.select()} />
          <Button type="button" onClick={copy}>
            Скопіювати посилання
          </Button>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {copiedUrl === url ? "Посилання скопійовано." : ""}
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
