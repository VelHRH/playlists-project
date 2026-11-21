"use client";

import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { useReturnPath } from "@/auth/return-path";
import { DISPLAY_NAME_MAX, normalizeDisplayName } from "@/auth/display-name";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function signUp(form: FormData) {
  const name = normalizeDisplayName(String(form.get("name") ?? ""));
  if (name === null) return authErrorMessage({ code: "INVALID_NAME" });
  const { error } = await authClient.signUp.email({
    name,
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  return error ? authErrorMessage(error) : null;
}

export function SignUpForm() {
  return (
    <AuthForm submitLabel="Зареєструватися" successHref={useReturnPath()} onSubmit={signUp}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Ім&apos;я</Label>
        <Input id="name" name="name" autoComplete="nickname" maxLength={DISPLAY_NAME_MAX} required />
        <p className="text-xs text-muted-foreground">Його бачитимуть ті, з ким ви ділитеся плейлистами.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Пароль</Label>
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
