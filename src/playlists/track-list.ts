export type ParsedTrack = { artist: string; title: string };
export type TrackListError = { line: number; text: string };

const SEPARATOR = / [-–—] /;

export function parseTrackList(text: string) {
  const tracks: ParsedTrack[] = [];
  const errors: TrackListError[] = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (line === "") return;
    const match = SEPARATOR.exec(line);
    const artist = match ? line.slice(0, match.index).trim() : "";
    const title = match ? line.slice(match.index + match[0].length).trim() : "";
    if (artist === "" || title === "") {
      errors.push({ line: index + 1, text: line });
      return;
    }
    tracks.push({ artist, title });
  });
  return { tracks, errors };
}
