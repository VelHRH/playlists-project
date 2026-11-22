"use client";

import { Check, Copy } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { formatTrackList, type ParsedTrack } from "@/playlists/track-list";
import { useClipboardCopy } from "./use-clipboard-copy";

const messages = { copied: "Текст скопійовано.", failed: "Не вдалося скопіювати текст." };

export function CopyAsText({ tracks }: { tracks: ParsedTrack[] }) {
  const text = formatTrackList(tracks);
  const { copy, statusOf } = useClipboardCopy();
  const status = statusOf(text);

  return (
    <div className="flex items-center gap-2">
      <p
        role="status"
        className={status === "failed" ? "text-sm text-destructive" : "sr-only"}
      >
        {status ? messages[status] : ""}
      </p>
      <IconButton label="Скопіювати як текст" size="icon" onClick={() => copy(text)}>
        {status === "copied" ? <Check className="text-primary" /> : <Copy />}
      </IconButton>
    </div>
  );
}
