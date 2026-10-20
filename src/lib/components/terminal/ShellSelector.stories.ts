import type { Meta, StoryObj } from "@storybook/sveltekit";
import ShellSelector from "./ShellSelector.svelte";

const meta = {
  args: {
    onchange: () => {},
  },
  argTypes: {
    value: {
      control: "select",
      options: ["bash", "powershell", "single-line"],
    },
  },
  component: ShellSelector,
  tags: ["autodocs"],
  title: "Terminal/ShellSelector",
} satisfies Meta<typeof ShellSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bash: Story = {
  args: {
    value: "bash",
  },
};

export const PowerShell: Story = {
  args: {
    value: "powershell",
  },
};

export const SingleLine: Story = {
  args: {
    value: "single-line",
  },
};
