import type { Meta, StoryObj } from "@storybook/sveltekit";
import ExplainerBox from "./ExplainerBox.svelte";
import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

const sampleRule: CommandRule = {
  defaultValue: false,
  description: "Запуск контейнера в фоновом режиме и вывод ID контейнера",
  docsUrl: "https://docs.docker.com/reference/cli/docker/container/run/#detach",
  flag: "--detach",
  id: "detach",
  label: "Фоновый режим",
  shortFlag: "-d",
  type: "boolean",
};

const sampleEvaluation: RuleEvaluation = {
  active: true,
  isEnabled: true,
  isModified: true,
  isValid: true,
  isVisible: true,
  ruleId: "detach",
};

const meta = {
  component: ExplainerBox,
  tags: ["autodocs"],
  title: "Terminal/ExplainerBox",
} satisfies Meta<typeof ExplainerBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {},
};

export const WithRule: Story = {
  args: {
    evaluation: sampleEvaluation,
    rule: sampleRule,
    value: true,
  },
};

export const WithValidationError: Story = {
  args: {
    evaluation: {
      ...sampleEvaluation,
      isValid: false,
      validationError: "Некорректный формат порта. Ожидается host:container",
    },
    rule: {
      ...sampleRule,
      flag: "--publish",
      id: "publish",
      label: "Проброс портов",
      shortFlag: "-p",
      type: "list",
    },
    value: ["invalid-port"],
  },
};

export const WithDisabledReason: Story = {
  args: {
    evaluation: {
      ...sampleEvaluation,
      disabledReason: "Конфликтует с параметром --rm",
      isEnabled: false,
    },
    rule: sampleRule,
    value: false,
  },
};
