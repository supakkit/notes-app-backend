import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup/setup.ts"],
    env: loadEnv(mode, process.cwd(), ""),
    reporters: ["verbose"], // shows full details across files
    maxConcurrency: 1, // limits how many test files run in parallel
    include: ["src/**/*.test.ts"],
    exclude: ["dist", "node_modules"],
  },
}));
