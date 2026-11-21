"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth/auth-client";
import { authErrorMessage } from "@/auth/auth-error-message";
import { AuthForm } from "@/auth/auth-form";
import { DISPLAY_NAME_MAX, normalizeDisplayName } from "@/auth/display-name";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function saveName(form: FormData) {
  const name = normalizeDisplayName(String(form.get("name") ?? ""));
  if (name === null) return "Вкажіть ім'я.";
  const { error } = await authClient.updateUser({ name });
  return error ? authErrorMessage(error) : null;
}

export function DisplayNameForm({ name }: { name: string }) {
  const router = useRouter();

  return (
    <AuthForm
      label="Ім'я для відображення"
      submitLabel="Зберегти ім'я"
      onSubmit={saveName}
      successMessage="Ім'я збережено."
      onSuccess={() => router.refresh()}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Ім&apos;я</Label>
        <Input
          id="name"
          name="name"
          autoComplete="nickname"
          defaultValue={name}
          maxLength={DISPLAY_NAME_MAX}
          required
          aria-describedby="name-hint"
        />
        <p id="name-hint" className="text-xs text-muted-foreground">
          Його бачитимуть ті, з ким ви ділитеся плейлистами.
        </p>
      </div>
    </AuthForm>
  );
}
