import type { Metadata } from "next";
import { AuthPage } from "@/auth/auth-page";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Вхід · Плейлисти" };

export default function SignInPage() {
  return (
    <AuthPage
      title="Вхід"
      footer={{ text: "Ще не маєте акаунта?", linkLabel: "Зареєструватися", href: "/sign-up" }}
    >
      <SignInForm />
    </AuthPage>
  );
}
