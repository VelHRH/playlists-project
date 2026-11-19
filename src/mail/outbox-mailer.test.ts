import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createOutboxMailer, readOutbox } from "./outbox-mailer";

describe("outbox mailer", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "outbox-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("collects sent emails in the order they were sent", async () => {
    const mailer = createOutboxMailer(dir);

    await mailer.send({ to: "a@example.com", subject: "Перший", text: "1" });
    await mailer.send({ to: "b@example.com", subject: "Другий", text: "2" });

    expect(await readOutbox(dir)).toEqual([
      { to: "a@example.com", subject: "Перший", text: "1" },
      { to: "b@example.com", subject: "Другий", text: "2" },
    ]);
  });

  it("reads an outbox that has not been created yet as empty", async () => {
    expect(await readOutbox(path.join(dir, "missing"))).toEqual([]);
  });
});
