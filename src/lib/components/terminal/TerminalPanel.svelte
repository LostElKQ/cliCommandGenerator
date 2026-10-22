<script lang="ts">
  import { Terminal, TriangleAlert } from "@lucide/svelte";
  import CommandTokenView from "./CommandTokenView.svelte";
  import CopyButton from "./CopyButton.svelte";
  import ExplainerBox from "./ExplainerBox.svelte";
  import ShellSelector from "./ShellSelector.svelte";
  import type { CommandRule } from "#lib/core/types.js";
  import type { CommandStore } from "#lib/state/commandStore.svelte.js";

  type TerminalPanelProps = {
    commandStore: CommandStore;
  };

  let { commandStore }: TerminalPanelProps = $props();

  const activeRuleId = $derived(commandStore.hoveredRuleId ?? commandStore.selectedRuleId);

  const activeRule = $derived.by<CommandRule | undefined>(() => {
    if (!activeRuleId) return;
    for (const cat of commandStore.definition.categories) {
      const found = cat.rules.find((r) => r.id === activeRuleId);
      if (found) return found;
    }
    return;
  });

  const activeEvaluation = $derived(
    activeRuleId ? commandStore.evaluations[activeRuleId] : undefined,
  );

  const activeValue = $derived(activeRuleId ? commandStore.values[activeRuleId] : undefined);

  function handleJump(ruleId: string): void {
    commandStore.jumpToRule(ruleId);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="overflow-hidden card border border-surface-700 bg-surface-950 shadow-xl">
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-800 bg-surface-900/90 px-4 py-2.5"
    >
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5" aria-hidden="true">
          <span class="size-3 rounded-full bg-error-500/80"></span>
          <span class="size-3 rounded-full bg-warning-500/80"></span>
          <span class="size-3 rounded-full bg-success-500/80"></span>
        </div>

        <div class="flex items-center gap-1.5 text-xs font-semibold text-surface-200">
          <Terminal class="size-3.5 text-primary-400" />
          <span>{commandStore.definition.baseBinary}</span>
          {#if commandStore.definition.subCommand}
            <span class="text-surface-400">{commandStore.definition.subCommand}</span>
          {/if}
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <ShellSelector
          onchange={(shell) => commandStore.setShell(shell)}
          value={commandStore.shell}
        />

        <CopyButton text={commandStore.assembled.raw} />
      </div>
    </div>

    <div class="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
      {#each commandStore.assembled.lines as line, index (index)}
        <div class="flex items-start">
          <span class="mr-3 w-4 text-right text-xs text-surface-600 select-none" aria-hidden="true">
            {index === 0 ? "$" : ">"}
          </span>
          <div class="flex-1 break-all whitespace-pre-wrap">
            {#each line as token (token.id)}
              <CommandTokenView
                isHovered={Boolean(
                  commandStore.hoveredRuleId && token.ruleId === commandStore.hoveredRuleId,
                )}
                isSelected={Boolean(
                  commandStore.selectedRuleId && token.ruleId === commandStore.selectedRuleId,
                )}
                onhover={(ruleId) => commandStore.setHoveredRule(ruleId)}
                onselect={(ruleId) => commandStore.setSelectedRule(ruleId)}
                {token}
              />
            {/each}
          </div>
        </div>
      {/each}
    </div>

    {#if commandStore.assembled.hasErrors}
      <div
        class="flex flex-col gap-1 border-t border-error-500/30 bg-error-500/10 px-4 py-2.5 text-xs text-error-400"
      >
        <div class="flex items-center gap-1.5 font-semibold">
          <TriangleAlert class="size-4 shrink-0" />
          <span>Ошибки в сгенерированной команде:</span>
        </div>
        <ul class="list-inside list-disc pl-5">
          {#each Object.entries(commandStore.assembled.errors) as [ruleId, errorText] (ruleId)}
            <li>{errorText}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <ExplainerBox
    evaluation={activeEvaluation}
    onclose={() => commandStore.setSelectedRule(undefined)}
    onjump={handleJump}
    rule={activeRule}
    value={activeValue}
  />
</div>
