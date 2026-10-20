import type { Meta, StoryObj } from "@storybook/sveltekit";
import TextInput from "./TextInput.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "Пользовательское имя для создаваемого контейнера.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#name---name",
  flag: "--name",
  id: "name",
  label: "Имя контейнера",
  placeholder: "my-web-app",
  type: "string",
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: "",
  },
  component: TextInput,
  tags: ["autodocs"],
  title: "Inputs/TextInput",
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    value: "production-redis",
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
    value: "custom-api-server",
  },
};

export const WithValidationError: Story = {
  args: {
    evaluation: {
      active: true,
      isEnabled: true,
      isModified: true,
      isValid: false,
      isVisible: true,
      ruleId: sampleRule.id,
      validationError: "Имя может содержать только латиницу, цифры и дефис",
    },
    value: "Invalid Name!",
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Требуется предварительный флаг",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: "",
  },
};
