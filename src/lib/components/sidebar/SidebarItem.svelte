<script lang="ts">
	import './sidebar.css';
	import { page } from '$app/stores';
	import type { IconType } from '$lib/components/icon/Icon.svelte';
	import SidebarHeading from '$lib/components/sidebar/SidebarHeading.svelte';
	import drawer from '$lib/stores/drawer';

	export let text: string = '';
	export let href: string = '/';
	export let heading: boolean = false;
	export let icon: IconType = 'close';
	export let tabindex: boolean;
</script>

<li class="sidebar-item {$page.url.pathname === href ? 'current' : ''}">
	<a {href} on:click={() => drawer.set(false)} tabindex={tabindex ? 0 : -1}>
		{#if heading}
			<SidebarHeading {text} {icon} />
		{:else}
			<p class="px-4 py-1 {heading ? 'font-semibold' : ''}">
				{text}
			</p>
		{/if}
	</a>
</li>
