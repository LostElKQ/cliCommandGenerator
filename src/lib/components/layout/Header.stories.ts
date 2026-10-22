import type { Meta, StoryObj } from "@storybook/sveltekit";
import Header from "./Header.svelte";
import { dockerRunCommand } from "#lib/data/commands/dockerRun.js";
import { ffmpegCommand } from "#lib/data/commands/ffmpeg.js";
import { CommandStore } from "#lib/state/commandStore.svelte.js";

const meta = {
  args: {
    onselectcommand: () => {},
  },
  component: Header,
  tags: ["autodocs"],
  title: "Layout/Header",
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docker: Story = {
  args: {
    commandStore: new CommandStore(dockerRunCommand),
  },
};

export const FFmpeg: Story = {
  args: {
    commandStore: new CommandStore(ffmpegCommand),
  },
};

export const WithModifiedState: Story = {
  args: {
    commandStore: (() => {
      const store = new CommandStore(dockerRunCommand);
      store.setValue("detach", true);
      store.setValue("name", "custom-app");
      return store;
    })(),
  },
};
