import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Link2, Lock, Settings } from "lucide-react";
import { getCurrentUser, type CurrentUser } from "@/auth/current-user";
import { SignOutButton } from "@/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { IconLink } from "@/components/ui/icon-button";
import { RecordMark, Wordmark } from "@/components/wordmark";
import { listMyPlaylists } from "@/playlists/playlists";
import { formatTrackCount } from "@/lib/track-count";
import { CreatePlaylistDialog } from "./create-playlist-form";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeForCurrentUser />
    </Suspense>
  );
}

async function HomeForCurrentUser() {
  const user = await getCurrentUser();
  return user ? <MyPlaylists user={user} /> : <Landing />;
}

function Landing() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-7">
        <h1 className="text-5xl font-semibold sm:text-[4.5rem] sm:leading-[1.02]">
          Плейлисти<span className="text-primary">.</span>
        </h1>
        <p className="max-w-[46ch] text-lg leading-8 text-muted-foreground">
          Створюйте списки треків і діліться ними з друзями. Збирайте добірки у
          форматі «виконавець — назва», впорядковуйте їх і надсилайте посилання
          тим, кому хочете їх показати.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
            Зареєструватися
          </Link>
          <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Увійти
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="relative mx-auto hidden aspect-[4/3] w-full max-w-md md:block">
        <RecordMark className="absolute top-[6%] right-0 size-[88%] animate-[spin_24s_linear_infinite] drop-shadow-lg motion-reduce:animate-none" />
        <div className="absolute top-0 left-0 flex aspect-square h-full flex-col justify-end rounded-md bg-primary p-[8%] shadow-xl">
          <div className="absolute inset-[5%] rounded-sm border border-primary-foreground/20" />
          <span className="font-heading text-3xl leading-none font-semibold text-primary-foreground">A</span>
          <span className="mt-2 h-px w-1/3 bg-primary-foreground/40" />
        </div>
      </div>
    </main>
  );
}

async function MyPlaylists({ user }: { user: CurrentUser }) {
  const playlists = await listMyPlaylists(user.id);
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <Wordmark />
        <div className="flex min-w-0 items-center gap-0.5">
          <span className="mr-2 truncate text-sm text-muted-foreground">{user.name}</span>
          <IconLink label="Налаштування" href="/settings">
            <Settings />
          </IconLink>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">Мої плейлисти</h1>
          <CreatePlaylistDialog />
        </div>
        {playlists.length === 0 ? (
          <p className="rounded-xl border border-dashed border-input/60 px-5 py-8 text-center text-muted-foreground">
            У вас ще немає плейлистів. Створіть перший кнопкою «+» — додайте назву й, за бажанням, опис.
          </p>
        ) : (
          <ul aria-label="Мої плейлисти" className="panel flex flex-col divide-y overflow-hidden">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlists/${playlist.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors duration-(--duration-fast) outline-none hover:bg-accent/50 focus-visible:bg-accent/60"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-heading text-lg font-semibold">{playlist.title}</span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {formatTrackCount(playlist.trackCount)} ·{" "}
                      {playlist.shareToken ? (
                        <span className="inline-flex items-center gap-1 text-accent-foreground">
                          <Link2 aria-hidden="true" className="size-3.5" />
                          за посиланням
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Lock aria-hidden="true" className="size-3.5" />
                          приватний
                        </span>
                      )}
                    </span>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) ease-(--ease-out-soft) group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
