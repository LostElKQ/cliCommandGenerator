import { assembleCommand } from "#lib/core/assembler.js";
import { evaluateRules, getDefaultValues } from "#lib/core/rules-engine.js";
import type {
  AssembledCommand,
  CommandCategory,
  CommandDefinition,
  EvaluationMap,
  SerializedCommandState,
  ShellType,
} from "#lib/core/types.js";

export class CommandStore {
  public definition: CommandDefinition;
  public values: Record<string, unknown>;
  public shell: ShellType;
  public hoveredRuleId: string | null;
  public selectedRuleId: string | null;
  public searchQuery: string;

  public evaluations: EvaluationMap;
  public assembled: AssembledCommand;
  public isModified: boolean;
  public filteredCategories: CommandCategory[];

  public constructor(
    initialDefinition: CommandDefinition,
    initialState?: Partial<SerializedCommandState>,
  ) {
    this.definition = $state(initialDefinition);
    this.values = $state({
      ...getDefaultValues(initialDefinition),
      ...(initialState?.values ?? {}),
    });
    this.shell = $state(initialState?.shell ?? "bash");
    this.hoveredRuleId = $state(null);
    this.selectedRuleId = $state(null);
    this.searchQuery = $state("");

    this.evaluations = $derived(evaluateRules(this.definition, this.values));
    this.assembled = $derived(
      assembleCommand(this.definition, this.values, this.shell, this.evaluations),
    );
    this.isModified = $derived(Object.values(this.evaluations).some((ev) => ev.isModified));
    this.filteredCategories = $derived.by(() => {
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) {
        return this.definition.categories;
      }

      const result: CommandCategory[] = [];
      for (const cat of this.definition.categories) {
        const matchingRules = cat.rules.filter((rule) => {
          return (
            rule.flag.toLowerCase().includes(q) ||
            (rule.shortFlag && rule.shortFlag.toLowerCase().includes(q)) ||
            rule.label.toLowerCase().includes(q) ||
            rule.description.toLowerCase().includes(q)
          );
        });

        if (matchingRules.length > 0) {
          result.push({
            ...cat,
            rules: matchingRules,
          });
        }
      }
      return result;
    });
  }

  public setDefinition(newDefinition: CommandDefinition): void {
    this.definition = newDefinition;
    this.values = getDefaultValues(newDefinition);
    this.hoveredRuleId = null;
    this.selectedRuleId = null;
    this.searchQuery = "";
  }

  public setValue(ruleId: string, value: unknown): void {
    this.values[ruleId] = value;
  }

  public resetValue(ruleId: string): void {
    const defaults = getDefaultValues(this.definition);
    this.values[ruleId] = defaults[ruleId];
  }

  public resetAll(): void {
    this.values = getDefaultValues(this.definition);
    this.hoveredRuleId = null;
    this.selectedRuleId = null;
  }

  public setShell(shell: ShellType): void {
    this.shell = shell;
  }

  public setHoveredRule(ruleId: string | null): void {
    this.hoveredRuleId = ruleId;
  }

  public setSelectedRule(ruleId: string | null): void {
    this.selectedRuleId = ruleId;
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  public serialize(): SerializedCommandState {
    return {
      commandId: this.definition.id,
      shell: this.shell,
      values: JSON.parse(JSON.stringify(this.values)) as Record<string, unknown>,
    };
  }

  public loadState(state: SerializedCommandState): void {
    if (state.shell) {
      this.shell = state.shell;
    }
    if (state.values) {
      this.values = {
        ...getDefaultValues(this.definition),
        ...state.values,
      };
    }
  }
}
