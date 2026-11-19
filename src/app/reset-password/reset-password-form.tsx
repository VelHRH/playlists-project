"use client";

import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  async function resetPassword(form: FormData) {
    const { error } = await authClient.resetPassword({
      token,
      newPassword: String(form.get("password") ?? ""),
    });
    return error ? authErrorMessage(error) : null;
  }

  return (
    <AuthForm submitLabel="Зберегти пароль" onSubmit={resetPassword} successHref="/sign-in?reset=done">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Новий пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          Щонайменше 8 символів.
        </p>
      </div>
    </AuthForm>
  );
}
