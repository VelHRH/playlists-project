import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const smokeCheck = pgTable("smoke_check", {
  id: serial().primaryKey(),
  note: text().notNull(),
});

export * from "./auth-schema";
export * from "./playlist-schema";
