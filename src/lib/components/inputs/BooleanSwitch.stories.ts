import type { Meta, StoryObj } from "@storybook/sveltekit";
import BooleanSwitch from "./BooleanSwitch.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "Автоматически удалять контейнер после завершения его работы.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#clean-up---rm",
  flag: "--rm",
  id: "rm",
  label: "Автоматическое удаление",
  shortFlag: "-r",
  type: "boolean",
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: false,
  },
  component: BooleanSwitch,
  tags: ["autodocs"],
  title: "Inputs/BooleanSwitch",
} satisfies Meta<typeof BooleanSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: false,
  },
};

export const Active: Story = {
  args: {
    value: true,
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
    value: true,
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Конфликтует с флагом --restart",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: false,
  },
};
