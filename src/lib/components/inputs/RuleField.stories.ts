import type { Meta, StoryObj } from "@storybook/sveltekit";
import RuleField from "./RuleField.svelte";
import type { CommandRule } from "#lib/core/types.js";

const stringRule: CommandRule = {
  description: "Имя контейнера",
  flag: "--name",
  id: "name",
  label: "Имя",
  placeholder: "my-container",
  type: "string",
};

const meta = {
  args: {
    onchange: () => {},
    rule: stringRule,
    value: "web",
  },
  component: RuleField,
  tags: ["autodocs"],
  title: "Inputs/RuleField",
} satisfies Meta<typeof RuleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringField: Story = {
  args: {
    rule: stringRule,
    value: "web",
  },
};

export const BooleanField: Story = {
  args: {
    rule: {
      description: "Фоновый режим работы",
      flag: "--detach",
      id: "detach",
      label: "Фоновый режим",
      shortFlag: "-d",
      type: "boolean",
    },
    value: true,
  },
};

export const NumberField: Story = {
  args: {
    rule: {
      description: "Количество CPU",
      flag: "--cpus",
      id: "cpus",
      label: "CPU",
      type: "number",
      validator: { min: 1, max: 16 },
    },
    value: 2,
  },
};
