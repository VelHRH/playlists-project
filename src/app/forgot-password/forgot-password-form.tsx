"use client";

import { useState } from "react";
import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function requestReset(form: FormData) {
  const { error } = await authClient.requestPasswordReset({
    email: String(form.get("email") ?? ""),
    redirectTo: "/reset-password",
  });
  return error ? authErrorMessage(error) : null;
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="text-sm">
        Якщо акаунт із цим email існує, ми надіслали на нього посилання для скидання пароля.
      </p>
    );
  }

  return (
    <AuthForm submitLabel="Надіслати посилання" onSubmit={requestReset} onSuccess={() => setSent(true)}>
      <p className="text-sm text-muted-foreground">
        Вкажіть email, з яким ви реєструвалися, і ми надішлемо посилання для встановлення нового пароля.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
    </AuthForm>
  );
}
