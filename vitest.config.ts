import path from "node:path";
import { defineConfig } from "vitest/config";
import { testDatabaseUrl } from "./src/test/test-database-url";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["./src/test/global-setup.ts"],
    env: {
      DATABASE_URL: testDatabaseUrl,
    },
    fileParallelism: false,
  },
});
