import type { Meta, StoryObj } from "@storybook/sveltekit";
import NumberInput from "./NumberInput.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "Ограничение количества доступных процессорных ядер.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#cpus",
  flag: "--cpus",
  id: "cpus",
  label: "Лимит CPU",
  placeholder: "1.5",
  type: "number",
  validator: {
    max: 128,
    min: 0,
  },
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: undefined,
  },
  component: NumberInput,
  tags: ["autodocs"],
  title: "Inputs/NumberInput",
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: undefined,
  },
};

export const WithValue: Story = {
  args: {
    value: 4,
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
    value: 2.5,
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
      validationError: "Значение должно быть не менее 0",
    },
    value: -1,
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Недоступно в текущем режиме",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: 1,
  },
};
