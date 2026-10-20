import type { Meta, StoryObj } from "@storybook/sveltekit";
import SelectInput from "./SelectInput.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "Политика автоматического перезапуска контейнера при сбоях.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#restart-policies---restart",
  flag: "--restart",
  id: "restart",
  label: "Политика перезапуска",
  options: [
    { description: "Не перезапускать автоматически", label: "no", value: "no" },
    {
      description: "Перезапускать только при ненулевом коде возврата",
      label: "on-failure",
      value: "on-failure",
    },
    {
      description: "Перезапускать всегда, кроме ручной остановки",
      label: "unless-stopped",
      value: "unless-stopped",
    },
    { description: "Всегда перезапускать", label: "always", value: "always" },
  ],
  placeholder: "Выберите политику...",
  type: "select",
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: undefined,
  },
  component: SelectInput,
  tags: ["autodocs"],
  title: "Inputs/SelectInput",
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: undefined,
  },
};

export const Selected: Story = {
  args: {
    value: "unless-stopped",
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
    value: "always",
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Конфликтует с флагом --rm",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: "unless-stopped",
  },
};
