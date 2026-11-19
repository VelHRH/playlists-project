import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import pg from "pg";
import { rm } from "node:fs/promises";
import { e2eDatabaseUrl } from "./e2e-database-url";
import { e2eOutboxDir } from "./mail-outbox";

async function ensureDatabaseExists(url: string) {
  const target = new URL(url);
  const name = target.pathname.slice(1);
  const maintenance = new URL(url);
  maintenance.pathname = "/postgres";
  const client = new pg.Client({ connectionString: maintenance.toString() });
  await client.connect();
  const existing = await client.query("select 1 from pg_database where datname = $1", [name]);
  if (existing.rowCount === 0) {
    await client.query(`create database "${name}"`);
  }
  await client.end();
}

export default async function globalSetup() {
  await rm(e2eOutboxDir, { recursive: true, force: true });
  await ensureDatabaseExists(e2eDatabaseUrl);
  const db = drizzle(e2eDatabaseUrl);
  await migrate(db, { migrationsFolder: "./drizzle" });
  const result = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  const tables = result.rows.map((row) => `"public"."${row.tablename}"`);
  if (tables.length > 0) {
    await db.execute(sql.raw(`truncate table ${tables.join(", ")} restart identity cascade`));
  }
  await db.$client.end();
}
