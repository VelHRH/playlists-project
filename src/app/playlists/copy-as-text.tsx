"use client";

import { Button } from "@/components/ui/button";
import { formatTrackList, type ParsedTrack } from "@/playlists/track-list";
import { useClipboardCopy } from "./use-clipboard-copy";

const messages = { copied: "Текст скопійовано.", failed: "Не вдалося скопіювати текст." };

export function CopyAsText({ tracks }: { tracks: ParsedTrack[] }) {
  const text = formatTrackList(tracks);
  const { copy, statusOf } = useClipboardCopy();
  const status = statusOf(text);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => copy(text)}>
        Скопіювати як текст
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {status ? messages[status] : ""}
      </p>
    </div>
  );
}
