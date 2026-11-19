import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Email, Mailer } from "./mailer";

function sortableName() {
  const wallClock = String(Date.now()).padStart(15, "0");
  const monotonic = String(process.hrtime.bigint()).padStart(20, "0");
  return `${wallClock}-${monotonic}-${randomUUID()}.json`;
}

export function createOutboxMailer(dir: string): Mailer {
  return {
    async send({ to, subject, text }) {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, sortableName()), JSON.stringify({ to, subject, text }));
    },
  };
}

export async function readOutbox(dir: string): Promise<Email[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const files = names.filter((name) => name.endsWith(".json")).sort();
  return Promise.all(
    files.map(async (name) => JSON.parse(await readFile(path.join(dir, name), "utf8")) as Email),
  );
}
