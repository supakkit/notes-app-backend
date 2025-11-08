import { defineConfig } from "vitest/config";
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup/setup.ts"],
    env: loadEnv(mode, process.cwd(), ''),
  },
}));
