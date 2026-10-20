import type { Meta, StoryObj } from "@storybook/sveltekit";
import ConfigPanel from "./ConfigPanel.svelte";
import { dockerRunCommand } from "#lib/data/commands/dockerRun.js";
import { CommandStore } from "#lib/state/commandStore.svelte.js";

const meta = {
  component: ConfigPanel,
  tags: ["autodocs"],
  title: "Config/ConfigPanel",
} satisfies Meta<typeof ConfigPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    commandStore: new CommandStore(dockerRunCommand),
  },
};

export const WithModified: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setValue("detach", true);
      store.setValue("name", "web-container");
      return store;
    })(),
  },
};

export const WithSearch: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setSearchQuery("port");
      return store;
    })(),
  },
};
