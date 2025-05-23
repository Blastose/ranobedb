<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { ListCounts } from '$lib/server/db/user/list';

	interface Props {
		userIdNum: number;
		listCounts: ListCounts;
	}

	let { userIdNum, listCounts }: Props = $props();

	const tabs = [
		{
			type: 'Books',
			key: 'book',
			url: 'books',
		},
		{
			type: 'Series',
			key: 'series',
			url: 'series',
		},
		{
			type: 'Releases',
			key: 'release',
			url: 'releases',
		},
	] as const;

	let currentPage = $derived(new URL($page.url));
	let currentTab = $derived(currentPage.pathname.split('/').at(-1) || '');

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut,
	});
</script>

<div class="flex flex-col gap-2">
	<a href="/user/{userIdNum}" class="w-fit link px-2">To profile</a>

	<div class="grid overflow-x-auto overflow-y-hidden whitespace-nowrap">
		<nav class="flex gap-4">
			{#each tabs as tab}
				{@const active = tab.url === currentTab}
				<div class="flex flex-col gap-2">
					<a
						class="{active
							? 'link no-underline'
							: 'tab-hover'} capitalize duration-[250ms] px-2 font-semibold flex items-center gap-2"
						href="/user/{userIdNum}/list/{tab.url}">{tab.type} ({listCounts[tab.key]})</a
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
	</div>
</div>

<style>
	.tab-hover:hover {
		color: var(--primary-500);
	}

	.tab-underline {
		border-radius: 2rem 2rem 0px 0px;
	}
</style>
