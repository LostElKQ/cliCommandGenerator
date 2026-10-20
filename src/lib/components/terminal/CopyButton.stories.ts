import type { Meta, StoryObj } from "@storybook/sveltekit";
import CopyButton from "./CopyButton.svelte";

const meta = {
  argTypes: {
    isIconOnly: { control: "boolean" },
    label: { control: "text" },
    text: { control: "text" },
  },
  component: CopyButton,
  tags: ["autodocs"],
  title: "Terminal/CopyButton",
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "docker run -d -p 80:80 nginx:alpine",
  },
};

export const IconOnly: Story = {
  args: {
    isIconOnly: true,
    text: "docker run -d -p 80:80 nginx:alpine",
  },
};
