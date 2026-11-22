"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTrackList, type ParsedTrack } from "@/playlists/track-list";

export function CopyAsText({ tracks }: { tracks: ParsedTrack[] }) {
  const text = formatTrackList(tracks);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setFailed(false);
    } catch {
      setCopiedText(null);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        Скопіювати як текст
      </Button>
      <p role="status" className="text-sm text-muted-foreground">
        {copiedText === text ? "Текст скопійовано." : failed ? "Не вдалося скопіювати текст." : ""}
      </p>
    </div>
  );
}
