<script lang="ts">
  import { Plus, Trash2 } from "@lucide/svelte";
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, KeyValuePair, RuleEvaluation } from "#lib/core/types.js";

  type KeyValueRepeaterProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: KeyValuePair[]) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: KeyValuePair[];
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
    value = [],
  }: KeyValueRepeaterProps = $props();

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);

  function updateKey(index: number, newKey: string): void {
    const updated = value.map((item, index_) =>
      index_ === index ? { ...item, key: newKey } : item,
    );
    onchange(updated);
  }

  function updateValue(index: number, newValue: string): void {
    const updated = value.map((item, index_) =>
      index_ === index ? { ...item, value: newValue } : item,
    );
    onchange(updated);
  }

  function removeRow(index: number): void {
    const updated = value.filter((_, index_) => index_ !== index);
    onchange(updated);
  }

  function addRow(): void {
    onchange([...value, { key: "", value: "" }]);
  }
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <div class="flex flex-col gap-2">
    {#if value.length === 0}
      <p class="py-1 text-xs text-surface-500 italic">Нет добавленных переменных</p>
    {:else}
      {#each value as pair, index (index)}
        <div class="flex items-center gap-2">
          <input
            class="input w-1/2 font-mono text-xs"
            aria-label="Ключ переменной {index + 1}"
            disabled={isDisabled}
            oninput={(event) => updateKey(index, event.currentTarget.value)}
            placeholder="KEY"
            type="text"
            value={pair.key}
          />
          <span class="text-xs text-surface-500">=</span>
          <input
            class="input w-1/2 font-mono text-xs"
            aria-label="Значение переменной {index + 1}"
            disabled={isDisabled}
            oninput={(event) => updateValue(index, event.currentTarget.value)}
            placeholder="VALUE"
            type="text"
            value={pair.value}
          />
          <button
            class="btn-icon preset-tonal-surface btn-icon-sm hover:text-error-400"
            aria-label="Удалить переменную {index + 1}"
            disabled={isDisabled}
            onclick={() => removeRow(index)}
            title="Удалить переменную"
            type="button"
          >
            <Trash2 class="size-4" />
          </button>
        </div>
      {/each}
    {/if}

    <div class="pt-1">
      <button
        class="btn inline-flex items-center gap-1.5 preset-outlined-primary-500 btn-sm"
        disabled={isDisabled}
        onclick={addRow}
        type="button"
      >
        <Plus class="size-3.5" />
        <span>Добавить переменную</span>
      </button>
    </div>
  </div>
</FieldWrapper>
