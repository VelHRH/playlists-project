"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  submitLabel: string;
  onSubmit: (form: FormData) => Promise<string | null>;
  children: ReactNode;
};

export function AuthForm({ submitLabel, onSubmit, children }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const failure = await onSubmit(new FormData(event.currentTarget));
    if (failure) {
      setError(failure);
      setPending(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
