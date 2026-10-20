<script lang="ts">
  import { Check, Copy } from "@lucide/svelte";

  type CopyButtonProps = {
    class?: string;
    isIconOnly?: boolean;
    label?: string;
    text: string;
    title?: string;
  };

  let {
    class: customClass = "",
    isIconOnly = false,
    label = "Скопировать",
    text,
    title = "Скопировать команду в буфер обмена",
  }: CopyButtonProps = $props();

  let isCopied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      isCopied = true;
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      copyTimeout = setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch {
      isCopied = false;
    }
  }
</script>

<button
  class="{isIconOnly ? 'btn btn-icon btn-sm' : 'btn gap-1.5 btn-sm'} {isCopied
    ? 'preset-filled-success-500'
    : 'preset-filled-primary-500'} {customClass}"
  aria-label={isCopied ? "Скопировано в буфер" : title}
  onclick={handleCopy}
  {title}
  type="button"
>
  {#if isCopied}
    <Check class="size-4" />
    {#if !isIconOnly}
      <span>Скопировано!</span>
    {/if}
  {:else}
    <Copy class="size-4" />
    {#if !isIconOnly}
      <span>{label}</span>
    {/if}
  {/if}
</button>
