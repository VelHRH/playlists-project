import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export async function resetDatabase() {
  const result = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  const tables = result.rows.map((row) => `"public"."${row.tablename}"`);
  if (tables.length === 0) return;
  await db.execute(
    sql.raw(`truncate table ${tables.join(", ")} restart identity cascade`),
  );
}
