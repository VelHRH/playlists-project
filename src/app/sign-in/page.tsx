import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/auth/auth-page";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Вхід · Плейлисти" };

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthPage
      title="Вхід"
      footer={{ text: "Ще не маєте акаунта?", linkLabel: "Зареєструватися", href: "/sign-up" }}
    >
      <Suspense fallback={null}>
        <PasswordResetNotice searchParams={searchParams} />
      </Suspense>
      <SignInForm />
    </AuthPage>
  );
}

async function PasswordResetNotice({ searchParams }: Pick<PageProps<"/sign-in">, "searchParams">) {
  const { reset } = await searchParams;
  if (reset !== "done") return null;
  return (
    <p role="status" className="text-sm">
      Пароль змінено. Увійдіть з новим паролем.
    </p>
  );
}
