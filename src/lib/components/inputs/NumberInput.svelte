<script lang="ts">
  import { X } from "@lucide/svelte";
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type NumberInputProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value?: number) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: number;
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
    value,
  }: NumberInputProps = $props();

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);

  function handleInput(event: Event & { currentTarget: HTMLInputElement }): void {
    const value_ = event.currentTarget.value;
    if (value_ === "") {
      onchange();
      return;
    }

    const number_ = Number(value_);
    if (Number.isNaN(number_)) {
      onchange();
      return;
    }

    onchange(number_);
  }
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <div class="relative flex items-center">
    <input
      id={rule.id}
      class="input {value === undefined ? '' : 'pr-8'}"
      aria-label={rule.label}
      disabled={isDisabled}
      max={rule.validator?.max}
      min={rule.validator?.min}
      oninput={handleInput}
      placeholder={rule.placeholder ?? ""}
      type="number"
      value={value ?? ""}
    />
    {#if value !== undefined && !isDisabled}
      <button
        class="absolute right-2 btn-icon text-surface-400 btn-icon-xs hover:text-surface-100"
        aria-label="Очистить число"
        onclick={() => onchange()}
        title="Очистить"
        type="button"
      >
        <X class="size-3.5" />
      </button>
    {/if}
  </div>
</FieldWrapper>
