import type { Metadata } from "next";
import { AuthPage } from "@/auth/auth-page";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Скидання пароля · Плейлисти" };

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      title="Скидання пароля"
      footer={{ text: "Згадали пароль?", linkLabel: "Увійти", href: "/sign-in" }}
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
