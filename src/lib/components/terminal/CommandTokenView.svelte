<script lang="ts">
  import type { CommandToken } from "#lib/core/types.js";

  type CommandTokenViewProps = {
    isHovered?: boolean;
    isSelected?: boolean;
    onhover?: (ruleId?: string) => void;
    onselect?: (ruleId?: string) => void;
    token: CommandToken;
  };

  let {
    isHovered = false,
    isSelected = false,
    onhover,
    onselect,
    token,
  }: CommandTokenViewProps = $props();

  const isInteractive = $derived(Boolean(token.ruleId));

  const typeClass = $derived.by(() => {
    switch (token.type) {
      case "binary": {
        return "font-bold text-primary-400";
      }
      case "subcommand": {
        return "font-semibold text-primary-300";
      }
      case "flag": {
        return "font-medium text-secondary-400";
      }
      case "flag-value": {
        return "text-tertiary-300";
      }
      case "positional": {
        return "font-medium text-success-300";
      }
      case "escape": {
        return "text-surface-500 select-none";
      }
      case "comment": {
        return "italic text-surface-500";
      }
      case "whitespace": {
        return "";
      }
      default: {
        return "text-surface-100";
      }
    }
  });

  const stateClass = $derived.by(() => {
    if (token.hasError) {
      return "underline decoration-wavy decoration-error-500 text-error-400";
    }
    if (isSelected) {
      return "rounded bg-primary-500/30 px-1 py-0.5 ring-2 ring-primary-400";
    }
    if (isHovered) {
      return "rounded bg-primary-500/20 px-1 py-0.5 ring-1 ring-primary-500";
    }
    if (isInteractive) {
      return "rounded px-1 py-0.5 hover:bg-surface-800/80 transition-colors";
    }
    return "";
  });
</script>

{#if isInteractive}
  <button
    class="inline cursor-pointer border-0 bg-transparent p-0 text-left font-mono {typeClass} {stateClass}"
    aria-label={token.errorMessage ?? token.text}
    onclick={() => onselect?.(token.ruleId)}
    onmouseenter={() => onhover?.(token.ruleId)}
    onmouseleave={() => onhover?.()}
    title={token.errorMessage ?? "Нажмите или наведите для просмотра параметра"}
    type="button"
  >
    {token.text}
  </button>
{:else}
  <span class="font-mono {typeClass} {stateClass}">
    {token.text}
  </span>
{/if}
