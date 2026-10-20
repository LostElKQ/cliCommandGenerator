<script lang="ts">
  import BooleanSwitch from "./BooleanSwitch.svelte";
  import KeyValueRepeater from "./KeyValueRepeater.svelte";
  import ListInput from "./ListInput.svelte";
  import NumberInput from "./NumberInput.svelte";
  import SelectInput from "./SelectInput.svelte";
  import TextInput from "./TextInput.svelte";
  import type { CommandRule, KeyValuePair, RuleEvaluation } from "#lib/core/types.js";

  type RuleFieldProps = {
    evaluation?: RuleEvaluation;
    isHovered?: boolean;
    isSelected?: boolean;
    onchange: (value: unknown) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    onreset?: () => void;
    rule: CommandRule;
    value: unknown;
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
  }: RuleFieldProps = $props();
</script>

{#if rule.type === "boolean"}
  <BooleanSwitch
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_: boolean) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as boolean | undefined}
  />
{:else if rule.type === "string" || rule.type === "path"}
  <TextInput
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_: string) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as string | undefined}
  />
{:else if rule.type === "number"}
  <NumberInput
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_?: number) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as number | undefined}
  />
{:else if rule.type === "select"}
  <SelectInput
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_: string | number) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as string | number | undefined}
  />
{:else if rule.type === "key-value-map"}
  <KeyValueRepeater
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_: KeyValuePair[]) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as KeyValuePair[] | undefined}
  />
{:else if rule.type === "list"}
  <ListInput
    {evaluation}
    {isHovered}
    {isSelected}
    onchange={(value_: string[]) => onchange(value_)}
    {onmouseenter}
    {onmouseleave}
    {onreset}
    {rule}
    value={value as string[] | undefined}
  />
{/if}
