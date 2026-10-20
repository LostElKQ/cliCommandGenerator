<script lang="ts">
  import { ChevronsDown, ChevronsUp, RotateCcw, SearchX } from "@lucide/svelte";
  import { Accordion } from "@skeletonlabs/skeleton-svelte";
  import CategorySection from "./CategorySection.svelte";
  import SearchInput from "./SearchInput.svelte";
  import type { CommandCategory } from "#lib/core/types.js";
  import type { CommandStore } from "#lib/state/commandStore.svelte.js";

  type ConfigPanelProps = {
    commandStore: CommandStore;
  };

  let { commandStore }: ConfigPanelProps = $props();

  let userExpandedCategories = $state<string[] | undefined>();

  const expandedCategories = $derived(
    userExpandedCategories ?? commandStore.definition.categories.map((cat) => cat.id),
  );

  const totalMatchingRules = $derived(
    commandStore.filteredCategories.reduce((accumulator, cat) => accumulator + cat.rules.length, 0),
  );

  const totalModified = $derived(
    Object.values(commandStore.evaluations).filter((evaluation) => evaluation.isModified).length,
  );

  function handleSearchChange(query: string): void {
    commandStore.setSearchQuery(query);
    if (query.trim()) {
      userExpandedCategories = commandStore.filteredCategories.map((cat) => cat.id);
    }
  }

  function expandAll(): void {
    userExpandedCategories = commandStore.definition.categories.map((cat) => cat.id);
  }

  function collapseAll(): void {
    userExpandedCategories = [];
  }

  function handleResetCategory(category: CommandCategory): void {
    for (const rule of category.rules) {
      commandStore.resetValue(rule.id);
    }
  }
</script>

<div class="flex h-full flex-col gap-4">
  <div class="flex flex-col gap-3">
    <SearchInput
      matchedCount={Boolean(commandStore.searchQuery) ? totalMatchingRules : undefined}
      onchange={handleSearchChange}
      value={commandStore.searchQuery}
    />

    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-1.5">
        <button
          class="btn flex items-center gap-1 preset-tonal-surface btn-xs"
          onclick={expandAll}
          type="button"
        >
          <ChevronsDown class="size-3.5" />
          <span>Развернуть все</span>
        </button>

        <button
          class="btn flex items-center gap-1 preset-tonal-surface btn-xs"
          onclick={collapseAll}
          type="button"
        >
          <ChevronsUp class="size-3.5" />
          <span>Свернуть все</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        {#if totalModified > 0}
          <span class="badge preset-filled-warning-500 text-xs">
            Изменено: {totalModified}
          </span>

          <button
            class="btn flex items-center gap-1 preset-tonal-surface text-surface-300 btn-xs hover:text-surface-100"
            onclick={() => commandStore.resetAll()}
            title="Сбросить все параметры к значениям по умолчанию"
            type="button"
          >
            <RotateCcw class="size-3" />
            <span>Сбросить все</span>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto pr-1">
    {#if commandStore.filteredCategories.length === 0}
      <div class="card border border-surface-700 bg-surface-900/30 p-8 text-center">
        <SearchX class="mx-auto size-8 text-surface-500" />
        <h4 class="mt-2 text-sm font-semibold text-surface-200">Ничего не найдено</h4>
        <p class="mt-1 text-xs text-surface-400">
          По запросу «{commandStore.searchQuery}» параметры не найдены.
        </p>
        <button
          class="mt-4 btn preset-outlined-primary-500 btn-sm"
          onclick={() => handleSearchChange("")}
          type="button"
        >
          Очистить поиск
        </button>
      </div>
    {:else}
      <Accordion
        class="flex flex-col gap-3"
        collapsible
        multiple
        onValueChange={(details) => (userExpandedCategories = details.value)}
        value={expandedCategories}
      >
        {#each commandStore.filteredCategories as category (category.id)}
          <CategorySection
            {category}
            evaluations={commandStore.evaluations}
            hoveredRuleId={commandStore.hoveredRuleId}
            onresetcategory={handleResetCategory}
            onresetrule={(ruleId) => commandStore.resetValue(ruleId)}
            onsethovered={(ruleId) => commandStore.setHoveredRule(ruleId)}
            onvaluechange={(ruleId, value_) => commandStore.setValue(ruleId, value_)}
            selectedRuleId={commandStore.selectedRuleId}
            values={commandStore.values}
          />
        {/each}
      </Accordion>
    {/if}
  </div>
</div>
