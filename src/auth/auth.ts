import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { db } from "@/db/client";
import { mailerFromEnv } from "@/mail/mailer-from-env";
import { passwordResetEmail } from "./password-reset-email";

const rateLimitDisabled = process.env.AUTH_RATE_LIMIT_DISABLED === "true";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await mailerFromEnv().send(passwordResetEmail({ to: user.email, name: user.name, url }));
    },
  },
  rateLimit: {
    enabled: !rateLimitDisabled && process.env.NODE_ENV === "production",
    storage: "database",
  },
  advanced: {
    backgroundTasks: { handler: after },
  },
  plugins: [nextCookies()],
});
