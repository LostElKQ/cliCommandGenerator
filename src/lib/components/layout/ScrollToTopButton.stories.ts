import type { Meta, StoryObj } from "@storybook/sveltekit";
import ScrollToTopButton from "./ScrollToTopButton.svelte";

const meta = {
  argTypes: {
    threshold: { control: "number" },
  },
  component: ScrollToTopButton,
  tags: ["autodocs"],
  title: "Layout/ScrollToTopButton",
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    threshold: 0,
  },
};
