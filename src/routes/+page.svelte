<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Path } from "$app/types";
  import { page } from "$app/state";
  import ConfigPanel from "#lib/components/config/ConfigPanel.svelte";
  import Header from "#lib/components/layout/Header.svelte";
  import ScrollToTopButton from "#lib/components/layout/ScrollToTopButton.svelte";
  import TerminalPanel from "#lib/components/terminal/TerminalPanel.svelte";
  import { getCommandById, getDefaultCommand } from "#lib/data/registry.js";
  import { CommandStore } from "#lib/state/commandStore.svelte.js";
  import { decodeStateFromHash, encodeStateToHash } from "#lib/state/urlSync.js";

  const defaultDefinition = getDefaultCommand();
  const commandStore = new CommandStore(defaultDefinition);

  let isInitialized = $state(false);

  onMount(() => {
    const initialHash = page.url.hash;
    const decoded = decodeStateFromHash(initialHash);

    if (decoded.type === "success" && decoded.data) {
      const command = getCommandById(decoded.data.commandId);
      if (command) {
        commandStore.setDefinition(command);
        commandStore.loadState(decoded.data);
      }
    }

    isInitialized = true;
  });

  $effect(() => {
    if (!isInitialized) return;
    const serialized = commandStore.serialize();
    const encoded = encodeStateToHash(serialized);
    const targetHash = `#${encoded}`;
    if (page.url.hash !== targetHash) {
      void goto(resolve(`/${targetHash}` as Path), {
        replace: true,
        reset: false,
        shallow: true,
      });
    }
  });

  function handleSelectCommand(commandId: string): void {
    const nextCommand = getCommandById(commandId);
    if (!nextCommand) return;
    commandStore.setDefinition(nextCommand);
  }
</script>

<svelte:head>
  <title>{commandStore.definition.title} — CLI Command Generator</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-surface-900 text-surface-50">
  <Header {commandStore} onselectcommand={handleSelectCommand} />

  <main class="mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6">
    <div class="grid flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <!-- Right on desktop (col-span-7), Top on mobile (order-1) -->
      <section
        class="order-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:order-2 lg:col-span-7 xl:col-span-7"
        aria-label="Терминал и разбор синтаксиса"
      >
        <TerminalPanel {commandStore} />
      </section>

      <!-- Left on desktop (col-span-5), Bottom on mobile (order-2) -->
      <section
        class="order-2 flex flex-col lg:order-1 lg:col-span-5 xl:col-span-5"
        aria-label="Параметры команды"
      >
        <ConfigPanel {commandStore} />
      </section>
    </div>
  </main>

  <ScrollToTopButton />
</div>
