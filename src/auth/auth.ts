import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db/client";

const rateLimitDisabled = process.env.AUTH_RATE_LIMIT_DISABLED === "true";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  rateLimit: {
    enabled: !rateLimitDisabled && process.env.NODE_ENV === "production",
    storage: "database",
  },
  plugins: [nextCookies()],
});
