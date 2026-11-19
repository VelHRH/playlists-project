import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, type CurrentUser } from "@/auth/current-user";
import { SignOutButton } from "@/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Плейлисти</h1>
      <p className="text-lg leading-8 text-muted-foreground">
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
    </main>
  );
}

function MyPlaylists({ user }: { user: CurrentUser }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <span className="truncate text-sm text-muted-foreground">{user.name}</span>
        <SignOutButton />
      </header>
      <main className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Мої плейлисти</h1>
        <p className="text-muted-foreground">Тут з&apos;являться ваші плейлисти.</p>
      </main>
    </div>
  );
}
