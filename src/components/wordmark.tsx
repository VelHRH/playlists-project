import Link from "next/link";
import { cn } from "cn";

export function RecordMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <circle cx="16" cy="16" r="15" className="fill-foreground" />
      <circle cx="16" cy="16" r="11.5" fill="none" className="stroke-background/15" strokeWidth="0.75" />
      <circle cx="16" cy="16" r="8.5" fill="none" className="stroke-background/15" strokeWidth="0.75" />
      <circle cx="16" cy="16" r="5.5" className="fill-primary" />
      <circle cx="16" cy="16" r="1.25" className="fill-background" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-md font-heading text-lg font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <RecordMark className="transition-transform duration-(--duration-slow) ease-(--ease-out-soft) group-hover:rotate-45" />
      Плейлисти
    </Link>
  );
}
