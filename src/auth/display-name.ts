export const DISPLAY_NAME_MAX = 100;

export function normalizeDisplayName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= DISPLAY_NAME_MAX ? trimmed : null;
}
