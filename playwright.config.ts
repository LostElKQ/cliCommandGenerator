import { defineConfig } from "@playwright/test";

const config = defineConfig({
  webServer: {
    command: "pnpm run build && pnpm run preview",
    port: 4173,
    reuseExistingServer: !process.env["CI"],
  },
  reporter: [[process.env["CI"] ? "github" : "list"], ["html", { open: "never" }]],
  testMatch: "**/*.e2e.{ts,js}",
  globalTimeout: 60 * 60 * 1000,
  workers: process.env["CI"] ? 1 : undefined,
});

export default config;
