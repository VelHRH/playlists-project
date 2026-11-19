import { tmpdir } from "node:os";
import path from "node:path";
import { readOutbox } from "../src/mail/outbox-mailer";

export const e2eOutboxDir = process.env.E2E_MAIL_OUTBOX_DIR ?? path.join(tmpdir(), "playlists-e2e-outbox");

export async function emailsTo(address: string) {
  const emails = await readOutbox(e2eOutboxDir);
  return emails.filter((email) => email.to === address);
}
