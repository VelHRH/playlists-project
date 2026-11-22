import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/auth/current-user";
import { BackLink } from "@/components/back-link";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountForm } from "./delete-account-form";
import { DisplayNameForm } from "./display-name-form";

export const metadata: Metadata = { title: "Налаштування · Плейлисти" };

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <BackLink />
      <h1 className="text-4xl font-semibold">Налаштування</h1>
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
      <section className="panel flex flex-col gap-4 p-5">
        <h2 className="text-xl font-semibold">Ім&apos;я для відображення</h2>
        <DisplayNameForm name={user.name} />
      </section>
      <section className="panel flex flex-col gap-4 p-5">
        <h2 className="text-xl font-semibold">Пароль</h2>
        <ChangePasswordForm />
      </section>
      <section className="panel flex flex-col gap-4 border-destructive/30 p-5">
        <h2 className="text-xl font-semibold text-destructive">Видалення акаунта</h2>
        <DeleteAccountForm />
      </section>
    </>
  );
}
