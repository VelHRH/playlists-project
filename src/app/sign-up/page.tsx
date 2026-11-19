import type { Metadata } from "next";
import { AuthPage } from "@/auth/auth-page";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Реєстрація · Плейлисти" };

export default function SignUpPage() {
  return (
    <AuthPage
      title="Реєстрація"
      footer={{ text: "Уже маєте акаунт?", linkLabel: "Увійти", href: "/sign-in" }}
    >
      <SignUpForm />
    </AuthPage>
  );
}
