<script lang="ts">
  import { Switch } from "@skeletonlabs/skeleton-svelte";
  import FieldWrapper from "./FieldWrapper.svelte";
  import type { CommandRule, RuleEvaluation } from "#lib/core/types.js";

  type BooleanSwitchProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: boolean) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value?: boolean;
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
    value = false,
  }: BooleanSwitchProps = $props();

  const isDisabled = $derived(evaluation ? !evaluation.isEnabled : false);
</script>

<FieldWrapper {evaluation} {isHovered} {isSelected} {onmouseenter} {onmouseleave} {onreset} {rule}>
  <div class="py-1">
    <Switch
      checked={value}
      disabled={isDisabled}
      onCheckedChange={(details) => onchange(details.checked)}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label class="text-sm font-medium {value ? 'text-primary-400' : 'text-surface-400'}">
        {value ? "Включено" : "Выключено"}
      </Switch.Label>
      <Switch.HiddenInput />
    </Switch>
  </div>
</FieldWrapper>
