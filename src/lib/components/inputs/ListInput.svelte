<script lang="ts">
  import { Plus, Trash2 } from "@lucide/svelte";
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type ListInputProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: string[]) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: string[];
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
  }: ListInputProps = $props();

  const inputState = $state({ newItemText: "" });

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);

  function addItem(): void {
    const trimmed = inputState.newItemText.trim();
    if (!trimmed) {
      return;
    }
    onchange([...value, trimmed]);
    inputState.newItemText = "";
  }

  function removeItem(index: number): void {
    const updated = value.filter((_, index_) => index_ !== index);
    onchange(updated);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addItem();
  }
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <div class="flex flex-col gap-2">
    {#if value.length > 0}
      <ul class="flex flex-col gap-1.5">
        {#each value as item, index (index)}
          <li
            class="flex items-center justify-between gap-2 card preset-tonal-surface px-2.5 py-1 text-sm"
          >
            <span class="truncate font-mono text-xs">{item}</span>
            <button
              class="btn-icon preset-tonal-surface btn-icon-xs hover:text-error-400"
              aria-label="Удалить элемент {item}"
              disabled={isDisabled}
              onclick={() => removeItem(index)}
              title="Удалить"
              type="button"
            >
              <Trash2 class="size-3.5" />
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="flex items-center gap-2">
      <input
        class="input w-full"
        aria-label="Новый элемент списка"
        disabled={isDisabled}
        oninput={(event) => (inputState.newItemText = event.currentTarget.value)}
        onkeydown={handleKeyDown}
        placeholder={rule.placeholder ?? "Добавить элемент..."}
        type="text"
        value={inputState.newItemText}
      />
      <button
        class="btn inline-flex items-center gap-1 preset-filled-primary-500 btn-sm"
        aria-label="Добавить элемент"
        disabled={isDisabled || !inputState.newItemText.trim()}
        onclick={addItem}
        title="Добавить в список"
        type="button"
      >
        <Plus class="size-4" />
      </button>
    </div>
  </div>
</FieldWrapper>
