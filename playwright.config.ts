import { defineConfig } from "@playwright/test";

const config = defineConfig({
  webServer: { command: "npm run build && npm run preview", port: 4173 },
  testMatch: "**/*.e2e.{ts,js}",
});

export default config;
