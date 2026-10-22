<script lang="ts">
  import { ArrowUp } from "@lucide/svelte";
  import { scale } from "svelte/transition";

  type ScrollToTopButtonProps = {
    class?: string;
    threshold?: number;
  };

  let { class: customClass = "", threshold = 250 }: ScrollToTopButtonProps = $props();

  let scrollY = $state(0);

  const isVisible = $derived(scrollY > threshold);

  function scrollToTop(): void {
    scrollTo({ behavior: "smooth", top: 0 });
  }
</script>

<svelte:window bind:scrollY />

{#if isVisible}
  <button
    class="fixed right-4 bottom-4 z-30 btn-icon size-11 border border-surface-600/40 preset-filled-primary-500 shadow-xl transition-all duration-150 hover:scale-105 active:scale-95 lg:hidden {customClass}"
    aria-label="Наверх к терминалу"
    onclick={scrollToTop}
    title="Прокрутить к терминалу наверх"
    type="button"
    transition:scale={{ duration: 150 }}
  >
    <ArrowUp class="size-5" />
  </button>
{/if}
