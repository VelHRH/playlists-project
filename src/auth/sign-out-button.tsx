"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/auth/auth-client";
import { LogOut } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.refresh();
    setPending(false);
  }

  return (
    <IconButton label="Вийти" size="icon" onClick={signOut} disabled={pending}>
      <LogOut />
    </IconButton>
  );
}
