<script lang="ts">
  import type { Snippet } from "svelte";
  import { CircleAlert, ExternalLink, RotateCcw, TriangleAlert } from "@lucide/svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type FieldWrapperProps = {
    children: Snippet;
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
  };

  let {
    children,
    evaluation,
    isHovered = false,
    isSelected = false,
    onmouseenter,
    onmouseleave,
    onreset,
    rule,
  }: FieldWrapperProps = $props();

  const borderClasses = $derived.by(() => {
    if (isHovered) {
      return "border-primary-500 ring-2 ring-primary-500/30";
    }
    if (isSelected) {
      return "border-primary-400 ring-1 ring-primary-400/20";
    }
    return "border-surface-700 bg-surface-900/60";
  });
</script>

<div
  class="relative flex flex-col gap-2 card p-3.5 transition-all duration-150 {borderClasses} {evaluation &&
  !evaluation.isEnabled
    ? 'opacity-60'
    : ''}"
  {onmouseenter}
  {onmouseleave}
  role="group"
>
  <div class="flex items-start justify-between gap-2">
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="font-medium text-surface-100">
        {rule.label}
        {#if rule.required}
          <span class="text-error-500" title="Обязательное поле">*</span>
        {/if}
      </span>

      <span class="badge preset-tonal-surface font-mono text-xs">
        {rule.flag}
      </span>

      {#if rule.shortFlag}
        <span class="badge preset-tonal-surface font-mono text-xs opacity-80">
          {rule.shortFlag}
        </span>
      {/if}

      {#if evaluation?.isModified}
        <span class="badge preset-filled-warning-500 text-xs"> изменено </span>
      {/if}
    </div>

    <div class="flex items-center gap-1.5">
      {#if evaluation?.isModified && onreset}
        <button
          class="btn-icon preset-tonal-surface btn-icon-xs"
          aria-label="Сбросить значение"
          onclick={() => onreset()}
          title="Сбросить к значению по умолчанию"
          type="button"
        >
          <RotateCcw class="size-3.5" />
        </button>
      {/if}

      {#if rule.docsUrl}
        <a
          class="btn-icon preset-tonal-surface btn-icon-xs"
          aria-label="Документация для {rule.label}"
          href={rule.docsUrl}
          rel="external noopener noreferrer"
          target="_blank"
          title="Открыть документацию"
        >
          <ExternalLink class="size-3.5" />
        </a>
      {/if}
    </div>
  </div>

  {#if rule.description}
    <p class="text-sm text-surface-400">
      {rule.description}
    </p>
  {/if}

  <div class="mt-1">
    {@render children()}
  </div>

  {#if evaluation && !evaluation.isValid && evaluation.validationError}
    <div class="flex items-center gap-1.5 text-xs text-error-400">
      <TriangleAlert class="size-3.5 shrink-0" />
      <span>{evaluation.validationError}</span>
    </div>
  {/if}

  {#if evaluation && !evaluation.isEnabled && evaluation.disabledReason}
    <div class="flex items-center gap-1.5 text-xs text-warning-400">
      <CircleAlert class="size-3.5 shrink-0" />
      <span>{evaluation.disabledReason}</span>
    </div>
  {/if}
</div>
