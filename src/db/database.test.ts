import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { smokeCheck } from "@/db/schema";
import { resetDatabase } from "@/test/reset-database";

describe("database", () => {
  beforeEach(resetDatabase);

  it("reads back a row written through Drizzle", async () => {
    await db.insert(smokeCheck).values({ note: "привіт" });

    const rows = await db.select().from(smokeCheck);

    expect(rows.map((row) => row.note)).toEqual(["привіт"]);
  });

  it("starts every test with an empty database", async () => {
    const rows = await db.select().from(smokeCheck);

    expect(rows).toEqual([]);
  });
});
