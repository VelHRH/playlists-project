type Track = { artist: string; title: string; url: string | null; note: string | null };

export function TrackLine({ track, number }: { track: Track; number: number }) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <span className="w-6 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground/80">{number}</span>
      <div className="min-w-0 flex-1">
        <p className="break-words">
          <span className="text-muted-foreground">{track.artist} —</span>{" "}
          {track.url ? (
            <a href={track.url} target="_blank" rel="noopener noreferrer" className="text-link font-medium">
              {track.title}
            </a>
          ) : (
            <span className="font-medium">{track.title}</span>
          )}
        </p>
        {track.note && (
          <p className="mt-0.5 whitespace-pre-line break-words text-sm text-muted-foreground italic">{track.note}</p>
        )}
      </div>
    </div>
  );
}
