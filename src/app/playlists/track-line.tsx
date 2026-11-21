type Track = { artist: string; title: string; url: string | null; note: string | null };

export function TrackLine({ track, number }: { track: Track; number: number }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{number}</span>
      <div className="min-w-0">
        <p className="break-words">
          {track.artist} —{" "}
          {track.url ? (
            <a href={track.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
              {track.title}
            </a>
          ) : (
            <span className="font-medium">{track.title}</span>
          )}
        </p>
        {track.note && <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{track.note}</p>}
      </div>
    </div>
  );
}
