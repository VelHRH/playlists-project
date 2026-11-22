import { useState } from "react";

type CopyResult = { text: string; copied: boolean };

export function useClipboardCopy() {
  const [result, setResult] = useState<CopyResult | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setResult({ text, copied: true });
    } catch {
      setResult({ text, copied: false });
    }
  }

  function statusOf(text: string) {
    if (result?.text !== text) return null;
    return result.copied ? "copied" : "failed";
  }

  return { copy, statusOf };
}
