import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
import { e2eDatabaseUrl } from "./e2e/e2e-database-url";
import { e2eOutboxDir } from "./e2e/mail-outbox";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: process.env.CI
      ? `pnpm start --port ${port}`
      : `pnpm dev --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: e2eDatabaseUrl,
      BETTER_AUTH_URL: `http://localhost:${port}`,
      BETTER_AUTH_SECRET: randomBytes(32).toString("base64"),
      AUTH_RATE_LIMIT_DISABLED: "true",
      MAIL_OUTBOX_DIR: e2eOutboxDir,
    },
  },
});
