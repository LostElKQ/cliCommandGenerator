<script lang="ts">
  import { CircleAlert, ExternalLink, Info, Sliders, TriangleAlert, X } from "@lucide/svelte";
  import type { CommandRule, KeyValuePair, RuleEvaluation } from "#lib/core/types.js";
  import { isNullish } from "#lib/utilities.js";

  type ExplainerBoxProps = {
    evaluation?: RuleEvaluation;
    onclose?: () => void;
    onjump?: (ruleId: string) => void;
    rule?: CommandRule;
    value?: unknown;
  };

  let { evaluation, onclose, onjump, rule, value }: ExplainerBoxProps = $props();

  function formatValue(v: unknown): string {
    if (isNullish(v)) {
      return "—";
    }
    if (typeof v === "boolean") {
      return v ? "Включено (true)" : "Выключено (false)";
    }
    if (Array.isArray(v)) {
      if (v.length === 0) return "—";
      return v
        .map((item) => {
          if (item && typeof item === "object" && "key" in item && "value" in item) {
            const pair = item as KeyValuePair;
            return `${pair.key}=${pair.value}`;
          }
          return String(item);
        })
        .join(", ");
    }
    return String(v);
  }
</script>

<div class="card border border-surface-700 bg-surface-900/60 p-4">
  {#if !rule}
    <div class="flex items-start gap-3 text-surface-400">
      <Info class="mt-0.5 size-5 shrink-0 text-primary-400" />
      <div class="space-y-1">
        <h4 class="text-sm font-semibold text-surface-200">Интерактивный разбор синтаксиса</h4>
        <p class="text-xs text-surface-400">
          Наведите курсор на параметр или флаг в терминале, чтобы увидеть его подробное описание,
          значение по умолчанию и ссылку на документацию.
        </p>
      </div>
    </div>
  {:else}
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded bg-surface-800 px-2 py-0.5 font-mono text-xs font-semibold text-primary-300"
          >
            {rule.flag}
          </span>
          {#if rule.shortFlag}
            <span class="rounded bg-surface-800 px-1.5 py-0.5 font-mono text-xs text-surface-400">
              {rule.shortFlag}
            </span>
          {/if}
          <h4 class="text-sm font-semibold text-surface-100">{rule.label}</h4>
          <span class="badge preset-tonal-surface text-xs">{rule.type}</span>

          {#if rule.required}
            <span class="badge preset-filled-error-500 text-xs">Обязательный</span>
          {/if}

          {#if evaluation?.isModified}
            <span class="badge preset-filled-warning-500 text-xs">Изменено</span>
          {/if}
        </div>

        {#if onclose}
          <button
            class="btn-icon preset-tonal-surface text-surface-400 btn-icon-xs hover:text-surface-100"
            aria-label="Закрыть подробности параметра"
            onclick={onclose}
            type="button"
          >
            <X class="size-3.5" />
          </button>
        {/if}
      </div>

      <p class="text-xs leading-relaxed text-surface-300">{rule.description}</p>

      <div class="grid grid-cols-1 gap-2 rounded-md bg-surface-950/60 p-2.5 text-xs sm:grid-cols-2">
        <div>
          <span class="text-surface-400">Текущее значение:</span>
          <span class="ml-1 font-mono font-medium text-surface-200">
            {formatValue(value)}
          </span>
        </div>
        <div>
          <span class="text-surface-400">По умолчанию:</span>
          <span class="ml-1 font-mono text-surface-400">
            {formatValue(rule.defaultValue)}
          </span>
        </div>
      </div>

      {#if evaluation && !evaluation.isValid && evaluation.validationError}
        <div
          class="flex items-start gap-1.5 rounded-md border border-error-500/30 bg-error-500/10 p-2 text-xs text-error-400"
        >
          <TriangleAlert class="mt-0.5 size-3.5 shrink-0" />
          <span>{evaluation.validationError}</span>
        </div>
      {/if}

      {#if evaluation && !evaluation.isEnabled && evaluation.disabledReason}
        <div
          class="flex items-start gap-1.5 rounded-md border border-warning-500/30 bg-warning-500/10 p-2 text-xs text-warning-400"
        >
          <CircleAlert class="mt-0.5 size-3.5 shrink-0" />
          <span>{evaluation.disabledReason}</span>
        </div>
      {/if}

      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div class="flex items-center gap-2">
          {#if rule.docsUrl}
            <a
              class="btn flex items-center gap-1 preset-tonal-surface text-surface-300 btn-xs hover:text-surface-100"
              href={rule.docsUrl}
              rel="external noopener noreferrer"
              target="_blank"
            >
              <ExternalLink class="size-3" />
              <span>Документация</span>
            </a>
          {/if}
        </div>

        {#if onjump}
          <button
            class="btn flex items-center gap-1 preset-tonal-primary btn-xs"
            onclick={() => onjump(rule.id)}
            type="button"
          >
            <Sliders class="size-3" />
            <span>Настроить в панели</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
