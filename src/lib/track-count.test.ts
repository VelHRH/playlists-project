import { describe, expect, it } from "vitest";
import { formatTrackCount } from "./track-count";

describe("formatTrackCount", () => {
  it.each([
    [0, "0 треків"],
    [1, "1 трек"],
    [2, "2 треки"],
    [4, "4 треки"],
    [5, "5 треків"],
    [11, "11 треків"],
    [12, "12 треків"],
    [21, "21 трек"],
    [22, "22 треки"],
    [500, "500 треків"],
  ])("formats %i as %s", (count, expected) => {
    expect(formatTrackCount(count)).toBe(expected);
  });
});
