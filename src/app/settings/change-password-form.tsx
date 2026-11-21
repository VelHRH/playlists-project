"use client";

import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function changePassword(form: FormData) {
  const { error } = await authClient.changePassword({
    currentPassword: String(form.get("currentPassword") ?? ""),
    newPassword: String(form.get("newPassword") ?? ""),
    revokeOtherSessions: true,
  });
  return error ? authErrorMessage(error, { INVALID_PASSWORD: "Поточний пароль неправильний." }) : null;
}

export function ChangePasswordForm() {
  return (
    <AuthForm
      label="Пароль"
      submitLabel="Змінити пароль"
      onSubmit={changePassword}
      successMessage="Пароль змінено."
      onSuccess={(form) => form.reset()}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Поточний пароль</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">Новий пароль</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          aria-describedby="new-password-hint"
        />
        <p id="new-password-hint" className="text-xs text-muted-foreground">
          Щонайменше 8 символів. Інші пристрої буде виведено з акаунта.
        </p>
      </div>
    </AuthForm>
  );
}
