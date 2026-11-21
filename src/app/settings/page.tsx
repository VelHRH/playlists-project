import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountForm } from "./delete-account-form";
import { DisplayNameForm } from "./display-name-form";

export const metadata: Metadata = { title: "Налаштування · Плейлисти" };

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <Link href="/" className="self-start text-sm text-muted-foreground underline">
        ← Мої плейлисти
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Налаштування</h1>
      <Suspense fallback={null}>
        <SettingsForCurrentUser />
      </Suspense>
    </main>
  );
}

async function SettingsForCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <h2 className="text-lg font-medium">Ім&apos;я для відображення</h2>
        <DisplayNameForm name={user.name} />
      </section>
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <h2 className="text-lg font-medium">Пароль</h2>
        <ChangePasswordForm />
      </section>
      <section className="flex flex-col gap-4 rounded-xl border border-destructive/40 p-4">
        <h2 className="text-lg font-medium">Видалення акаунта</h2>
        <DeleteAccountForm />
      </section>
    </>
  );
}
