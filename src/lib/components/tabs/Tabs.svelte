<script lang="ts" generics="T extends string">
	import Icon, { type IconType } from '../icon/Icon.svelte';

	import { cubicInOut } from 'svelte/easing';

	import { crossfade } from 'svelte/transition';

	import { page } from '$app/stores';

	export let tabs: readonly T[];
	export let tabsIcons: Record<T, IconType> | undefined;
	export let currentTab: T;
	export let tabParam: string = 'tab';

	$: currentPage = new URL($page.url);

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut,
	});
</script>

<nav class="flex gap-4">
	{#each tabs as tab}
		{@const active = tab === currentTab}
		<div class="flex flex-col gap-2">
			<a
				class="{active
					? 'link no-underline'
					: 'tab-hover'} capitalize duration-[250ms] px-2 font-semibold flex items-center gap-2"
				href="{currentPage.pathname}?{tabParam}={tab}"
				>{#if tabsIcons}<Icon name={tabsIcons[tab]} />{/if}{tab}</a
			>
			{#if active}
				<div
					class="h-[3px] w-full tab-underline bg-link"
					in:send={{ key: 'trigger' }}
					out:receive={{ key: 'trigger' }}
				></div>
			{/if}
		</div>
	{/each}
</nav>

<style>
	.tab-hover:hover {
		color: var(--primary-500);
	}

	.tab-underline {
		border-radius: 2rem 2rem 0px 0px;
	}
</style>
