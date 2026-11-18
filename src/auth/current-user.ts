import "server-only";
import { headers } from "next/headers";
import { auth } from "./auth";

export type CurrentUser = {
  id: string;
  name: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name };
}
