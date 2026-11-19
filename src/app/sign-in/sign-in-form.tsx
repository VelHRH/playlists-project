"use client";

import Link from "next/link";
import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function signIn(form: FormData) {
  const { error } = await authClient.signIn.email({
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  });
  return error ? authErrorMessage(error) : null;
}

export function SignInForm() {
  return (
    <AuthForm submitLabel="Увійти" onSubmit={signIn}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Пароль</Label>
          <Link href="/forgot-password" className="text-sm text-muted-foreground underline">
            Забули пароль?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
    </AuthForm>
  );
}
