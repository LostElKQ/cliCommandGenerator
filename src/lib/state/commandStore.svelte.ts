import { assembleCommand } from "#lib/core/assembler.js";
import { evaluateRules, getDefaultValues } from "#lib/core/rulesEngine.js";
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
  public hoveredRuleId?: string;
  public selectedRuleId?: string;
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
      ...initialState?.values,
    });
    this.shell = $state(initialState?.shell ?? "bash");
    this.hoveredRuleId = $state();
    this.selectedRuleId = $state();
    this.searchQuery = $state("");

    this.evaluations = $derived(evaluateRules(this.definition, this.values));
    this.assembled = $derived(
      assembleCommand(this.definition, this.values, this.shell, this.evaluations),
    );
    this.isModified = $derived(
      Object.values(this.evaluations).some((evaluation) => evaluation.isModified),
    );
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
    this.hoveredRuleId = undefined;
    this.selectedRuleId = undefined;
    this.searchQuery = "";
  }

  public setValue(ruleId: string, value: unknown): void {
    this.values[ruleId] = value;
  }

  public resetValue(ruleId: string): void {
    const defaults = getDefaultValues($state.snapshot(this.definition));
    this.values[ruleId] = defaults[ruleId];
  }

  public resetAll(): void {
    this.values = getDefaultValues($state.snapshot(this.definition));
    this.hoveredRuleId = undefined;
    this.selectedRuleId = undefined;
  }

  public setShell(shell: ShellType): void {
    this.shell = shell;
  }

  public setHoveredRule(ruleId?: string): void {
    this.hoveredRuleId = ruleId;
  }

  public setSelectedRule(ruleId?: string): void {
    this.selectedRuleId = ruleId;
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  public serialize(): SerializedCommandState {
    return {
      commandId: this.definition.id,
      shell: this.shell,
      values: structuredClone($state.snapshot(this.values)),
    };
  }

  public loadState(state: SerializedCommandState): void {
    if (state.shell) {
      this.shell = state.shell;
    }
    if (state.values) {
      this.values = {
        ...getDefaultValues($state.snapshot(this.definition)),
        ...state.values,
      };
    }
  }
}
