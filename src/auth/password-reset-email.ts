import type { Email } from "@/mail/mailer";

export function passwordResetEmail({ to, name, url }: { to: string; name: string; url: string }): Email {
  return {
    to,
    subject: "Скидання пароля",
    text: [
      `Привіт, ${name}!`,
      "",
      "Ми отримали запит на скидання пароля для вашого акаунта в «Плейлистах». Щоб встановити новий пароль, перейдіть за посиланням. Воно діє одну годину й лише один раз:",
      "",
      url,
      "",
      "Якщо ви не надсилали запит, просто проігноруйте цей лист — пароль залишиться тим самим.",
    ].join("\n"),
  };
}
