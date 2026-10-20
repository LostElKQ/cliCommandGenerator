import type { Meta, StoryObj } from "@storybook/sveltekit";
import SearchInput from "./SearchInput.svelte";

const meta = {
  args: {
    onchange: () => {},
    value: "",
  },
  component: SearchInput,
  tags: ["autodocs"],
  title: "Config/SearchInput",
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
  },
};

export const WithValue: Story = {
  args: {
    value: "port",
  },
};

export const WithMatchedCount: Story = {
  args: {
    matchedCount: 3,
    value: "detach",
  },
};
