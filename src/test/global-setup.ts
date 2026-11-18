import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { testDatabaseUrl } from "./test-database-url";

export default async function setup() {
  const db = drizzle(testDatabaseUrl);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await db.$client.end();
}
