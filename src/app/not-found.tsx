import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Не знайдено · Плейлисти" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Сторінку не знайдено</h1>
      <p className="text-muted-foreground">Можливо, посилання застаріло або у вас немає до нього доступу.</p>
      <Link href="/" className={buttonVariants({ variant: "outline", className: "self-start" })}>
        На головну
      </Link>
    </main>
  );
}
