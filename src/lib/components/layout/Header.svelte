<script lang="ts">
  import { Check, ExternalLink, RotateCcw, Share2, Terminal } from "@lucide/svelte";
  import { COMMANDS } from "#lib/data/registry.js";
  import type { CommandStore } from "#lib/state/commandStore.svelte.js";
  import { buildShareUrl } from "#lib/state/urlSync.js";

  type HeaderProps = {
    commandStore: CommandStore;
    onselectcommand: (commandId: string) => void;
  };

  let { commandStore, onselectcommand }: HeaderProps = $props();

  let isCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  async function handleShare(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    const url = buildShareUrl(location.href, commandStore.serialize());
    try {
      await navigator.clipboard.writeText(url);
      isCopied = true;
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch {
      isCopied = false;
    }
  }
</script>

<header class="sticky top-0 z-20 border-b border-surface-800 bg-surface-900/80 backdrop-blur-md">
  <div
    class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex size-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/30"
      >
        <Terminal class="size-5" />
      </div>
      <div>
        <h1 class="text-base leading-tight font-bold text-surface-100 sm:text-lg">
          CLI Command Generator
        </h1>
        <p class="text-xs text-surface-400">Интерактивный конструктор консольных команд</p>
      </div>
    </div>

    <nav
      class="flex items-center rounded-lg border border-surface-700 bg-surface-950/60 p-1 text-xs"
      aria-label="Выбор утилиты"
    >
      {#each COMMANDS as command (command.id)}
        <button
          class="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors {commandStore
            .definition.id === command.id
            ? 'preset-filled-primary-500 font-semibold'
            : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-100'}"
          aria-pressed={commandStore.definition.id === command.id}
          onclick={() => onselectcommand(command.id)}
          title={command.summary}
          type="button"
        >
          <span>{command.title}</span>
        </button>
      {/each}
    </nav>

    <div class="flex items-center gap-2">
      {#if commandStore.isModified}
        <button
          class="btn flex items-center gap-1.5 preset-tonal-surface text-surface-300 btn-sm hover:text-surface-100"
          aria-label="Сбросить все параметры"
          onclick={() => commandStore.resetAll()}
          title="Сбросить все параметры к значениям по умолчанию"
          type="button"
        >
          <RotateCcw class="size-3.5" />
          <span class="hidden sm:inline">Сбросить</span>
        </button>
      {/if}

      <button
        class="btn flex items-center gap-1.5 btn-sm {isCopied
          ? 'preset-filled-success-500'
          : 'preset-filled-primary-500'}"
        aria-label={isCopied ? "Ссылка скопирована в буфер" : "Поделиться конфигурацией"}
        onclick={handleShare}
        title="Скопировать ссылку с текущей конфигурацией в буфер обмена"
        type="button"
      >
        {#if isCopied}
          <Check class="size-3.5" />
          <span>Скопировано!</span>
        {:else}
          <Share2 class="size-3.5" />
          <span>Поделиться</span>
        {/if}
      </button>

      {#if commandStore.definition.docsUrl}
        <a
          class="btn-icon preset-tonal-surface text-surface-400 btn-icon-sm hover:text-surface-100"
          aria-label="Официальная документация {commandStore.definition.title}"
          href={commandStore.definition.docsUrl}
          rel="external noopener noreferrer"
          target="_blank"
          title="Официальная документация"
        >
          <ExternalLink class="size-4" />
        </a>
      {/if}
    </div>
  </div>
</header>
