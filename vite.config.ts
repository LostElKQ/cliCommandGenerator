import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "vitest/config";

const config = defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter({
        fallback: "404.html",
      }),
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/u).includes("node_modules") ? undefined : true,
      },
      experimental: {
        remoteFunctions: true,
      },
      paths: {
        base: (process.argv.includes("dev") ? "" : (process.env["BASE_PATH"] ?? "")) as
          "" | `/${string}`,
        relative: false,
      },
      preprocess: [vitePreprocess({ script: true })],
    }),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      emitTsDeclarations: true,
    }),
  ],
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
    },
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          browser: {
            enabled: true,
            instances: [{ browser: "chromium", headless: true }],
            provider: playwright(),
          },
          exclude: ["src/lib/server/**"],
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          name: "client",
        },
      },

      {
        extends: "./vite.config.ts",
        test: {
          environment: "node",
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          include: ["src/**/*.{test,spec}.{js,ts}"],
          name: "server",
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          name: "storybook",
        },
      },
    ],
  },
});

export default config;
