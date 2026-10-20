<script lang="ts">
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type SelectInputProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: string | number) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: string | number;
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
  }: SelectInputProps = $props();

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);
  const options = $derived(rule.options ?? []);

  function handleSelect(event: Event & { currentTarget: HTMLSelectElement }): void {
    const rawValue = event.currentTarget.value;
    const match = options.find((opt) => String(opt.value) === rawValue);
    if (match) {
      onchange(match.value);
    } else {
      onchange(rawValue);
    }
  }
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <select
    id={rule.id}
    class="select"
    aria-label={rule.label}
    disabled={isDisabled}
    onchange={handleSelect}
    value={value === undefined ? "" : String(value)}
  >
    {#if !rule.required || value === undefined}
      <option disabled value="">
        {rule.placeholder ?? "Выберите значение..."}
      </option>
    {/if}
    {#each options as opt (opt.value)}
      <option value={String(opt.value)}>
        {opt.label}{opt.description ? ` (${opt.description})` : ""}
      </option>
    {/each}
  </select>
</FieldWrapper>
