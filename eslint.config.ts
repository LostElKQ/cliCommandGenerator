import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import path from "node:path";
import ts from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

const config = defineConfig(
  includeIgnoreFile(gitignorePath),
  ts.configs.strict,
  svelte.configs.recommended,
  svelte.configs.prettier,
  unicorn.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off",

      "unicorn/filename-case": [
        "error",
        {
          case: "camelCase",
          checkDirectories: false,
        },
      ],
      "unicorn/prefer-ternary": "off",
      "unicorn/prefer-logical-operator-over-ternary": "off",
      "unicorn/consistent-boolean-name": [
        "error",
        {
          ignore: ["value"],
        },
      ],
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.{test,spec}.{js,ts}", "**/*.stories.*"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "pascalCase",
          checkDirectories: false,
          ignore: [/^\+.*/],
        },
      ],
      "unicorn/name-replacements": [
        "error",
        {
          replacements: {
            param: false,
            params: false,
            prev: false,
            prop: false,
            props: false,
            ref: false,
            refs: false,
          },
        },
      ],
      "unicorn/no-top-level-assignment-in-function": "off",
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
      },
    },
    rules: {
      "prefer-const": "off",
      "svelte/block-lang": [
        "error",
        {
          enforceScriptPresent: false,
          script: "ts",
        },
      ],
      "svelte/button-has-type": "error",
      "svelte/no-inline-styles": "error",
      "svelte/no-top-level-browser-globals": "error",
      "svelte/prefer-const": [
        "error",
        {
          additionalProperties: false,
          destructuring: "any",
          excludedRunes: ["$props", "$derived"],
        },
      ],
      "svelte/prefer-derived-over-derived-by": "error",
      "svelte/require-event-prefix": "error",
      "svelte/sort-attributes": "error",
    },
  },
  {
    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],
      "@typescript-eslint/class-literal-property-style": "error",
      "@typescript-eslint/consistent-generic-constructors": ["error", "constructor"],
      "@typescript-eslint/consistent-indexed-object-style": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-confusing-non-null-assertion": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["..*"],
              message: "Relative imports are allowed only for the same directory or deeper.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/prefer-function-type": "error",
    },
  },
);

export default config;
