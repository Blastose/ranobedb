<script lang="ts">
	import type { BookOne } from '$lib/server/db/books/books';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/icon/Icon.svelte';
	import { getDomain } from '$lib/components/db-links/db-ext-links';
	import Favicon from '$lib/components/db-links/Favicon.svelte';

	interface Props {
		release: BookOne['releases'][number];
	}

	let { release }: Props = $props();

	function collectLinks(release: BookOne['releases'][number]) {
		const config = [
			{ field: 'website' as const, display: 'Official website' },
			{ field: 'amazon' as const, display: 'Amazon' },
			{ field: 'bookwalker' as const, display: 'BookWalker' },
			{ field: 'rakuten' as const, display: 'Rakuten' },
		];
		return config
			.filter((c) => release[c.field])
			.map((c) => ({
				url: release[c.field]!,
				display: c.display,
				domain: getDomain(release[c.field]!),
			}));
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
			<a use:melt={$item} class="sidebar-item items-center" href={link.url} target="_blank">
				{#if link.domain}
					<Favicon domain={link.domain} name={link.display} />
				{/if}
				{link.display}
			</a>
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
