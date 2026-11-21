"use client";

import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function deleteAccount(form: FormData) {
  if (form.get("confirm") !== "on") return "Підтвердьте видалення акаунта.";
  const password = String(form.get("password") ?? "");
  if (!password) return "Введіть пароль.";
  const { error } = await authClient.deleteUser({ password });
  return error ? authErrorMessage(error, { INVALID_PASSWORD: "Неправильний пароль." }) : null;
}

export function DeleteAccountForm() {
  return (
    <AuthForm
      label="Видалення акаунта"
      submitLabel="Видалити акаунт назавжди"
      submitVariant="destructive"
      onSubmit={deleteAccount}
    >
      <p className="text-sm text-muted-foreground">
        Буде видалено акаунт і всі ваші плейлисти з треками. Копії, які інші люди зберегли собі, залишаться в них.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="delete-password">Пароль</Label>
        <Input
          id="delete-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex items-start gap-2">
        <input
          id="delete-confirm"
          name="confirm"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 accent-destructive"
        />
        <Label htmlFor="delete-confirm" className="font-normal leading-snug">
          Я розумію, що акаунт і всі плейлисти буде видалено без можливості відновлення
        </Label>
      </div>
    </AuthForm>
  );
}
