<script lang="ts">
  import type { ShellType } from "#lib/core/types.js";

  type ShellOption = {
    description: string;
    id: ShellType;
    label: string;
  };

  type ShellSelectorProps = {
    onchange: (shell: ShellType) => void;
    value: ShellType;
  };

  let { onchange, value }: ShellSelectorProps = $props();

  const options: ShellOption[] = [
    {
      description: "Многострочный вид для Linux / macOS с символом переноса \\",
      id: "bash",
      label: "Bash / Zsh",
    },
    {
      description: "Многострочный вид для Windows PowerShell с обратным апострофом `",
      id: "powershell",
      label: "PowerShell",
    },
    {
      description: "Все аргументы в одну строку без переносов",
      id: "single-line",
      label: "В одну строку",
    },
  ];
</script>

<div
  class="flex rounded-lg border border-surface-700 bg-surface-900/60 p-0.5 text-xs"
  aria-label="Выбор командной оболочки"
  role="group"
>
  {#each options as option (option.id)}
    <button
      class="rounded-md px-2.5 py-1 font-medium transition-colors {value === option.id
        ? 'preset-filled-primary-500 font-semibold'
        : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-100'}"
      aria-pressed={value === option.id}
      onclick={() => onchange(option.id)}
      title={option.description}
      type="button"
    >
      {option.label}
    </button>
  {/each}
</div>
