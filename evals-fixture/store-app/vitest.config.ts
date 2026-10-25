import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL(".", import.meta.url)), "server-only": fileURLToPath(new URL("./test/empty.ts", import.meta.url)) };

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "backend",
          environment: "node",
          include: ["features/**/{api,db}/__tests__/**/*.test.ts"],
          setupFiles: ["./test/setup.backend.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          environment: "jsdom",
          include: ["features/**/ui/__tests__/**/*.test.tsx"],
          setupFiles: ["./test/setup.ui.ts"],
        },
      },
    ],
  },
});
