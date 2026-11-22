"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  submitLabel: string;
  onSubmit: (form: FormData) => Promise<string | null>;
  children: ReactNode;
  successHref?: Route;
  onSuccess?: (form: HTMLFormElement) => void;
  successMessage?: string;
  label?: string;
  submitVariant?: "default" | "destructive";
};

export function AuthForm({
  submitLabel,
  onSubmit,
  children,
  successHref = "/",
  onSuccess,
  successMessage,
  label,
  submitVariant = "default",
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    setSucceeded(false);
    const failure = await onSubmit(new FormData(form));
    if (failure) {
      setError(failure);
      setPending(false);
      return;
    }
    if (onSuccess) {
      setPending(false);
      setSucceeded(true);
      onSuccess(form);
      return;
    }
    router.replace(successHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} aria-label={label} className="flex flex-col gap-4">
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {succeeded && successMessage && (
        <p role="status" className="text-sm">
          {successMessage}
        </p>
      )}
      <Button type="submit" variant={submitVariant} disabled={pending} className="mt-1 h-10">
        {submitLabel}
      </Button>
    </form>
  );
}
