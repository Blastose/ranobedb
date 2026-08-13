<script lang="ts" generics="T extends string">
	import Icon, { type IconType } from '../icon/Icon.svelte';

	import { cubicInOut } from 'svelte/easing';

	import { crossfade } from 'svelte/transition';

	import { page } from '$app/state';

	interface Props {
		tabs: readonly T[];
		tabsIcons: Record<T, IconType> | undefined;
		currentTab: T;
		tabParam?: string;
	}

	let { tabs, tabsIcons, currentTab, tabParam = 'tab' }: Props = $props();

	let currentPage = $derived(new URL(page.url));

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut,
	});
</script>

<div class="grid overflow-x-auto overflow-y-hidden whitespace-nowrap">
	<nav class="flex gap-4">
		{#each tabs as tab (tab)}
			{@const active = tab === currentTab}
			<div class="flex flex-col gap-2">
				<a
					data-sveltekit-noscroll
					class="{active
						? 'link no-underline'
						: 'tab-hover'} flex items-center gap-2 px-2 font-semibold capitalize duration-[250ms]"
					href="{currentPage.pathname}?{tabParam}={tab}"
					>{#if tabsIcons}<Icon name={tabsIcons[tab]} />{/if}{tab}</a
				>
				{#if active}
					<div
						class="tab-underline bg-link h-[3px] w-full"
						in:send={{ key: 'trigger' }}
						out:receive={{ key: 'trigger' }}
					></div>
				{/if}
			</div>
		{/each}
	</nav>
</div>

<style>
	.tab-hover:hover {
		color: var(--primary-500);
	}

	.tab-underline {
		border-radius: 2rem 2rem 0px 0px;
	}
</style>
