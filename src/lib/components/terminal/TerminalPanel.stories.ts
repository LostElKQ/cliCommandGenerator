import type { Meta, StoryObj } from "@storybook/sveltekit";
import TerminalPanel from "./TerminalPanel.svelte";
import { dockerRunCommand } from "#lib/data/commands/dockerRun.js";
import { CommandStore } from "#lib/state/commandStore.svelte.js";

const meta = {
  component: TerminalPanel,
  tags: ["autodocs"],
  title: "Terminal/TerminalPanel",
} satisfies Meta<typeof TerminalPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    commandStore: new CommandStore(dockerRunCommand),
  },
};

export const WithActiveToken: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setValue("detach", true);
      store.setHoveredRule("detach");
      return store;
    })(),
  },
};

export const PowerShell: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setShell("powershell");
      store.setValue("detach", true);
      store.setValue("name", "my-app");
      return store;
    })(),
  },
};

export const SingleLine: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setShell("single-line");
      store.setValue("detach", true);
      return store;
    })(),
  },
};

export const WithErrors: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setValue("image", "");
      return store;
    })(),
  },
};
