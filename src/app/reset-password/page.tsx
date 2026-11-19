import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthPage } from "@/auth/auth-page";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Новий пароль · Плейлисти" };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthPage
      title="Новий пароль"
      footer={{ text: "Згадали пароль?", linkLabel: "Увійти", href: "/sign-in" }}
    >
      <Suspense fallback={null}>
        <ResetPasswordContent searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function ResetPasswordContent({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token, error } = await searchParams;
  if (typeof token !== "string" || !token || error) return <InvalidLink />;
  return <ResetPasswordForm token={token} />;
}

function InvalidLink() {
  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="text-sm text-destructive">
        Посилання для скидання пароля недійсне або застаріло.
      </p>
      <Link href="/forgot-password" className="text-sm font-medium underline">
        Запросити нове посилання
      </Link>
    </div>
  );
}
