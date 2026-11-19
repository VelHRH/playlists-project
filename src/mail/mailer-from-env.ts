import type { Mailer } from "./mailer";
import { createOutboxMailer } from "./outbox-mailer";
import { createResendMailer } from "./resend-mailer";

const consoleMailer: Mailer = {
  async send(email) {
    console.info(`[mail] to=${email.to} subject=${email.subject}\n${email.text}`);
  },
};

export function mailerFromEnv(env: NodeJS.ProcessEnv = process.env): Mailer {
  if (env.MAIL_OUTBOX_DIR) return createOutboxMailer(env.MAIL_OUTBOX_DIR);
  if (env.RESEND_API_KEY) {
    if (!env.MAIL_FROM) throw new Error("MAIL_FROM is not set");
    return createResendMailer({ apiKey: env.RESEND_API_KEY, from: env.MAIL_FROM });
  }
  if (env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set");
  return consoleMailer;
}
