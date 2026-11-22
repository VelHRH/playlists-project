import { describe, expect, it } from "vitest";
import { parseTrackList } from "./track-list";

describe("parseTrackList", () => {
  it("reads one track per line in order", () => {
    const result = parseTrackList("Океан Ельзи - Обійми\nДахаБраха - Vesna");

    expect(result).toEqual({
      tracks: [
        { artist: "Океан Ельзи", title: "Обійми" },
        { artist: "ДахаБраха", title: "Vesna" },
      ],
      errors: [],
    });
  });

  it.each([
    { separator: "hyphen", line: "Kalush - Стефанія" },
    { separator: "en dash", line: "Kalush – Стефанія" },
    { separator: "em dash", line: "Kalush — Стефанія" },
  ])("accepts a spaced $separator as the separator", ({ line }) => {
    expect(parseTrackList(line).tracks).toEqual([{ artist: "Kalush", title: "Стефанія" }]);
  });

  it("splits at the first separator, keeping hyphens and later separators in the title", () => {
    const { tracks } = parseTrackList("Jay-Z - Re-Make — Live - 2003\nThe Ting Tings – Shut Up - Let Go");

    expect(tracks).toEqual([
      { artist: "Jay-Z", title: "Re-Make — Live - 2003" },
      { artist: "The Ting Tings", title: "Shut Up - Let Go" },
    ]);
  });

  it("ignores blank lines and trims whitespace around lines and fields", () => {
    const result = parseTrackList("\n  Океан Ельзи   -   Обійми  \r\n   \n\tДахаБраха - Vesna\t\n\n");

    expect(result).toEqual({
      tracks: [
        { artist: "Океан Ельзи", title: "Обійми" },
        { artist: "ДахаБраха", title: "Vesna" },
      ],
      errors: [],
    });
  });

  it("reports unrecognised lines with their line numbers in the original text", () => {
    const text = [
      "Океан Ельзи - Обійми",
      "",
      "  Без розділювача  ",
      "Kalush-Стефанія",
      " - Без виконавця",
      "Без назви - ",
      "   —   ",
      "ДахаБраха - Vesna",
    ].join("\n");

    expect(parseTrackList(text)).toEqual({
      tracks: [
        { artist: "Океан Ельзи", title: "Обійми" },
        { artist: "ДахаБраха", title: "Vesna" },
      ],
      errors: [
        { line: 3, text: "Без розділювача" },
        { line: 4, text: "Kalush-Стефанія" },
        { line: 5, text: "- Без виконавця" },
        { line: 6, text: "Без назви -" },
        { line: 7, text: "—" },
      ],
    });
  });

  it("returns nothing for empty text", () => {
    expect(parseTrackList("  \n\n ")).toEqual({ tracks: [], errors: [] });
  });
});
