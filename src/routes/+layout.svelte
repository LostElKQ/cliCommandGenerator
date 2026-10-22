<script lang="ts">
  import type { Path } from "$app/types";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { locales, localizeHref } from "#lib/paraglide/runtime.js";
  import "./layout.css";
  import DemoLinks from "./demo/DemoLinks.svelte";
  import favicon from "#lib/assets/favicon.svg";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link href={favicon} rel="icon" />
</svelte:head>

{@render children()}
{#if page.url.pathname.startsWith("/demo")}
  <DemoLinks />
{/if}

<div class="hidden">
  {#each locales as locale (locale)}
    <a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
  {/each}
</div>
