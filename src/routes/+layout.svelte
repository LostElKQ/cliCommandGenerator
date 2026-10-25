<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import type { Path } from "$app/types";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { locales, localizeHref } from "#lib/paraglide/runtime.js";
  import "./layout.css";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();

  afterNavigate(async () => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
</script>

<svelte:head>
  <link href={asset("favicon.svg")} rel="icon" />
  <link href={asset("manifest.json")} rel="manifest" />
  <meta name="theme-color" content="#11111b" />
</svelte:head>

{@render children()}

<div class="hidden">
  {#each locales as locale (locale)}
    <a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
  {/each}
</div>
