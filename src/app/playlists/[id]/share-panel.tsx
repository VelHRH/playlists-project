"use client";

import { useId, useSyncExternalStore } from "react";
import {
  disableSharingAction,
  enableSharingAction,
  regenerateShareTokenAction,
} from "@/app/playlists/actions";
import { Check, Copy, Link2, Link2Off, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
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
      <section aria-label="Доступ за посиланням" className="panel flex flex-col gap-3 p-5">
        <h2 className="text-xl font-semibold">Доступ за посиланням</h2>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock aria-hidden="true" className="size-4" />
          Плейлист приватний: його бачите лише ви.
        </p>
        <form action={enableSharingAction.bind(null, playlistId)}>
          <Button type="submit">Увімкнути доступ за посиланням</Button>
        </form>
      </section>
    );
  }

  const url = `${origin}/s/${shareToken}`;

  const status = statusOf(url);

  return (
    <section
      aria-label="Доступ за посиланням"
      className="panel flex flex-col gap-4 border-primary/25 bg-[color-mix(in_oklch,var(--card),var(--accent)_45%)] p-5"
    >
      <h2 className="text-xl font-semibold">Доступ за посиланням</h2>
      <p className="flex items-center gap-2 text-sm text-accent-foreground">
        <Link2 aria-hidden="true" className="size-4" />
        Усі, хто має посилання, можуть переглянути плейлист.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>Посилання</Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={inputId}
            value={url}
            readOnly
            className="font-mono text-sm md:text-[0.8125rem]"
            onFocus={(event) => event.currentTarget.select()}
          />
          <IconButton label="Скопіювати посилання" variant="default" size="icon-lg" onClick={() => copy(url)}>
            {status === "copied" ? <Check /> : <Copy />}
          </IconButton>
          <form action={regenerateShareTokenAction.bind(null, playlistId)}>
            <IconButton label="Перегенерувати посилання" type="submit" variant="outline" size="icon-lg">
              <RefreshCw />
            </IconButton>
          </form>
          <form action={disableSharingAction.bind(null, playlistId)}>
            <IconButton
              label="Вимкнути доступ"
              type="submit"
              variant="outline"
              size="icon-lg"
              className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <Link2Off />
            </IconButton>
          </form>
        </div>
        <p role="status" className={status === "failed" ? "text-sm text-destructive" : "sr-only"}>
          {status === "copied" ? "Посилання скопійовано." : status === "failed" ? "Не вдалося скопіювати посилання." : ""}
        </p>
      </div>
    </section>
  );
}
