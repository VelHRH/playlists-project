import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-1.5 self-start rounded-md text-sm text-muted-foreground transition-colors duration-(--duration-fast) outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <ArrowLeft
        aria-hidden="true"
        className="size-4 transition-transform duration-(--duration-base) ease-(--ease-out-soft) group-hover:-translate-x-0.5"
      />
      Мої плейлисти
    </Link>
  );
}
