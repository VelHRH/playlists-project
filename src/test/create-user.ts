import { db } from "@/db/client";
import { user } from "@/db/schema";

export async function createUser(name: string) {
  const id = crypto.randomUUID();
  await db.insert(user).values({ id, name, email: `${id}@example.com` });
  return id;
}
