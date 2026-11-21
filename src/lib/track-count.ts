const plural = new Intl.PluralRules("uk");

const forms: Record<string, string> = { one: "трек", few: "треки", many: "треків", other: "трека" };

export function formatTrackCount(count: number) {
  return `${count} ${forms[plural.select(count)]}`;
}
