import type { Mailer } from "./mailer";

type ResendMailerOptions = {
  apiKey: string;
  from: string;
  fetch?: typeof globalThis.fetch;
};

export function createResendMailer({ apiKey, from, fetch = globalThis.fetch }: ResendMailerOptions): Mailer {
  return {
    async send({ to, subject, text }) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject, text }),
      });
      if (!response.ok) {
        throw new Error(`Resend rejected the email: ${response.status} ${await response.text()}`);
      }
    },
  };
}
