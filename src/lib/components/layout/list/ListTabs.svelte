<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { page } from '$app/stores';

	export let userIdNum: number;

	const tabs = [
		{
			type: 'Books',
			url: '',
		},
		{
			type: 'Releases',
			url: 'releases',
		},
		{
			type: 'Series',
			url: 'series',
		},
	];

	$: currentPage = new URL($page.url);
	$: currentTab = currentPage.pathname.split('/').at(-1) || '';

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut,
	});
</script>

<div class="grid overflow-x-auto whitespace-nowrap">
	<nav class="flex gap-4">
		{#each tabs as tab}
			{@const active = tab.url === currentTab || (tab.url === '' && currentTab === 'list')}
			<div class="flex flex-col gap-2">
				<a
					class="{active
						? 'link no-underline'
						: 'tab-hover'} capitalize duration-[250ms] px-2 font-semibold flex items-center gap-2"
					href="/user/{userIdNum}/list/{tab.url}">{tab.type}</a
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

<style>
	.tab-hover:hover {
		color: var(--primary-500);
	}

	.tab-underline {
		border-radius: 2rem 2rem 0px 0px;
	}
</style>
