<script lang="ts">
	import type { BookOne } from '$lib/server/db/books/books';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';

	interface Props {
		release: BookOne['releases'][number];
	}

	let { release }: Props = $props();

	function collectLinks(release: BookOne['releases'][number]): { url: string; display: string }[] {
		const links: { url: string; display: string }[] = [];
		if (release.website) {
			links.push({
				display: 'Official website',
				url: release.website,
			});
		}
		if (release.amazon) {
			links.push({
				display: 'Amazon',
				url: release.amazon,
			});
		}
		if (release.bookwalker) {
			links.push({
				display: 'BookWalker',
				url: release.bookwalker,
			});
		}
		if (release.rakuten) {
			links.push({
				display: 'Rakuten',
				url: release.rakuten,
			});
		}

		return links;
	}

	const {
		elements: { trigger, menu, item, overlay },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		preventScroll: false,
		positioning: { placement: 'left-start' },
	});

	let links = $derived(collectLinks(release));
</script>

<button
	disabled={links.length === 0}
	use:melt={$trigger}
	type="button"
	aria-label="Open release options"
	class="relative"
>
	<Icon name="link" />
	<div
		class="rounded-full bg-[var(--primary-500)] text-xs w-4 h-4 text-white absolute -top-1 -right-2"
	>
		{links.length}
	</div>
</button>

{#if $open}
	<div use:melt={$overlay} class="fixed inset-0 z-40"></div>
	<section class="menu" use:melt={$menu} transition:fly={{ duration: 150, y: -10 }}>
		{#each links as link}
			<a use:melt={$item} class="sidebar-item" href={link.url} target="_blank">{link.display}</a>
		{/each}
	</section>
{/if}

<!-- TODO refactor styles with other dropdown menus -->
<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background-color: var(--bg-light1);
		border-radius: 0.375rem;
		padding: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		white-space: nowrap;
		z-index: 40;
	}

	:global(.dark) .menu {
		background-color: var(--bg-dark1);
	}
</style>
