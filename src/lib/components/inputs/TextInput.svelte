<script lang="ts">
  import { X } from "@lucide/svelte";
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type TextInputProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: string) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: string;
  };

  let {
    evaluation,
    isHovered = false,
    isSelected = false,
    onchange,
    onmouseenter,
    onmouseleave,
    onreset,
    rule,
    value = "",
  }: TextInputProps = $props();

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <div class="relative flex items-center">
    <input
      id={rule.id}
      class="input {value ? 'pr-8' : ''}"
      aria-label={rule.label}
      disabled={isDisabled}
      oninput={(event) => onchange(event.currentTarget.value)}
      placeholder={rule.placeholder ?? ""}
      type="text"
      {value}
    />
    {#if Boolean(value) && !isDisabled}
      <button
        class="absolute right-2 btn-icon text-surface-400 btn-icon-xs hover:text-surface-100"
        aria-label="Очистить поле"
        onclick={() => onchange("")}
        title="Очистить"
        type="button"
      >
        <X class="size-3.5" />
      </button>
    {/if}
  </div>
</FieldWrapper>
