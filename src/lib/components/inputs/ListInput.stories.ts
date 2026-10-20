import type { Meta, StoryObj } from "@storybook/sveltekit";
import ListInput from "./ListInput.svelte";
import type { CommandRule } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  description: "DNS-серверы для разрешения доменных имён внутри контейнера.",
  docsUrl: "https://docs.docker.com/engine/reference/run/#dns",
  flag: "--dns",
  id: "dns",
  label: "DNS серверы",
  placeholder: "8.8.8.8",
  repeatable: true,
  type: "list",
};

const meta = {
  args: {
    onchange: () => {},
    rule: sampleRule,
    value: [],
  },
  component: ListInput,
  tags: ["autodocs"],
  title: "Inputs/ListInput",
} satisfies Meta<typeof ListInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: [],
  },
};

export const WithItems: Story = {
  args: {
    value: ["1.1.1.1", "8.8.8.8", "8.8.4.4"],
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
    value: ["127.0.0.1"],
  },
};

export const Disabled: Story = {
  args: {
    evaluation: {
      active: false,
      disabledReason: "Режим сети --net=none отключает DNS",
      isEnabled: false,
      isModified: false,
      isValid: true,
      isVisible: true,
      ruleId: sampleRule.id,
    },
    value: ["8.8.8.8"],
  },
};
