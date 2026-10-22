<script lang="ts">
  import { Accordion } from "@skeletonlabs/skeleton-svelte";
  import { ChevronDown, RotateCcw } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import { RuleField } from "#lib/components/inputs/index.js";
  import type { CommandCategory, EvaluationMap } from "#lib/core/types.js";

  type CategorySectionProps = {
    category: CommandCategory;
    evaluations: EvaluationMap;
    hoveredRuleId?: string;
    onresetcategory: (category: CommandCategory) => void;
    onresetrule: (ruleId: string) => void;
    onvaluechange: (ruleId: string, value: unknown) => void;
    selectedRuleId?: string;
    values: Record<string, unknown>;
  };

  let {
    category,
    evaluations,
    hoveredRuleId,
    onresetcategory,
    onresetrule,
    onvaluechange,
    selectedRuleId,
    values,
  }: CategorySectionProps = $props();

  const modifiedCount = $derived(
    category.rules.filter((rule) => evaluations[rule.id]?.isModified).length,
  );

  let highlightedRuleId = $derived(hoveredRuleId);
</script>

<Accordion.Item
  class="card border border-surface-700 bg-surface-900/40 p-3 transition-colors"
  value={category.id}
>
  <h3>
    <Accordion.ItemTrigger class="flex w-full items-center justify-between gap-3 text-left">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-semibold text-surface-100">{category.title}</span>
        <span class="badge preset-tonal-surface text-xs">{category.rules.length}</span>
        {#if modifiedCount > 0}
          <span class="badge preset-filled-warning-500 text-xs">
            {modifiedCount} изм.
          </span>
        {/if}
      </div>

      <div class="flex items-center gap-1.5">
        {#if modifiedCount > 0}
          <button
            class="btn-icon preset-tonal-surface btn-icon-xs hover:text-surface-100"
            aria-label="Сбросить категорию {category.title}"
            onclick={(event) => {
              event.stopPropagation();
              onresetcategory(category);
            }}
            title="Сбросить категорию"
            type="button"
          >
            <RotateCcw class="size-3.5" />
          </button>
        {/if}
        <Accordion.ItemIndicator class="group text-surface-400">
          <ChevronDown
            class="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </Accordion.ItemIndicator>
      </div>
    </Accordion.ItemTrigger>
  </h3>

  {#if category.description}
    <p class="mt-1 text-xs text-surface-400">{category.description}</p>
  {/if}

  <Accordion.ItemContent>
    {#snippet element(attributes)}
      {#if !attributes.hidden}
        <div {...attributes} class="mt-3 flex flex-col gap-3" transition:slide={{ duration: 150 }}>
          {#each category.rules as rule (rule.id)}
            {#if evaluations[rule.id]?.isVisible !== false}
              <RuleField
                evaluation={evaluations[rule.id]}
                isHovered={hoveredRuleId === rule.id || highlightedRuleId === rule.id}
                isSelected={selectedRuleId === rule.id}
                onchange={(value_) => onvaluechange(rule.id, value_)}
                onmouseenter={() => (highlightedRuleId = rule.id)}
                onmouseleave={() => (highlightedRuleId = undefined)}
                onreset={() => onresetrule(rule.id)}
                {rule}
                value={values[rule.id]}
              />
            {/if}
          {/each}
        </div>
      {/if}
    {/snippet}
  </Accordion.ItemContent>
</Accordion.Item>
