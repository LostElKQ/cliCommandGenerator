<script lang="ts">
  import { Search, X } from "@lucide/svelte";

  type SearchInputProps = {
    matchedCount?: number;
    onchange: (query: string) => void;
    placeholder?: string;
    value: string;
  };

  let {
    matchedCount,
    onchange,
    placeholder = "Поиск параметров и флагов...",
    value,
  }: SearchInputProps = $props();
</script>

<div class="relative flex items-center">
  <Search class="pointer-events-none absolute left-3 size-4 text-surface-400" />
  <input
    class="input pl-9 {Boolean(value) ? 'pr-20' : ''}"
    aria-label="Поиск параметров"
    oninput={(event) => onchange(event.currentTarget.value)}
    {placeholder}
    type="text"
    {value}
  />
  {#if Boolean(value)}
    <div class="absolute right-2 flex items-center gap-1.5">
      {#if matchedCount !== undefined}
        <span class="badge preset-tonal-surface font-mono text-xs">
          {matchedCount}
        </span>
      {/if}
      <button
        class="btn-icon text-surface-400 btn-icon-xs hover:text-surface-100"
        aria-label="Очистить поиск"
        onclick={() => onchange("")}
        title="Очистить"
        type="button"
      >
        <X class="size-3.5" />
      </button>
    </div>
  {/if}
</div>
