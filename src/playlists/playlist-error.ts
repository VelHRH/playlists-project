export type PlaylistErrorCode = "not-found" | "forbidden" | "limit-exceeded" | "invalid";

export class PlaylistError extends Error {
  constructor(
    readonly code: PlaylistErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PlaylistError";
  }
}
