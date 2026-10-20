import type { Meta, StoryObj } from "@storybook/sveltekit";
import KeyValueRepeater from "./KeyValueRepeater.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "Переменные окружения, передаваемые внутрь контейнера.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#env-environment",
  flag: "--env",
  id: "env",
  label: "Переменные окружения",
  repeatable: true,
  shortFlag: "-e",
  type: "key-value-map",
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: [],
  },
  component: KeyValueRepeater,
  tags: ["autodocs"],
  title: "Inputs/KeyValueRepeater",
} satisfies Meta<typeof KeyValueRepeater>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: [],
  },
};

export const WithPairs: Story = {
  args: {
    value: [
      { key: "NODE_ENV", value: "production" },
      { key: "PORT", value: "8080" },
    ],
  },
};

export const Modified: Story = {
  args: {
    evaluation: {
      active: true,
      isEnabled: true,
      isModified: true,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: [{ key: "DATABASE_URL", value: "postgres://user:pass@localhost:5432/db" }],
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Заблокировано",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: [{ key: "FOO", value: "BAR" }],
  },
};
