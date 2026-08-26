<script lang="ts">
	import type { BookOne } from '$lib/server/db/books/books';
	import { DropdownMenu } from 'bits-ui';
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

	let links = $derived(collectLinks(release));
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger disabled={links.length === 0}>
		{#snippet child({ props })}
			<button {...props} type="button" aria-label="Open release options" class="relative">
				<Icon name="link" />
				<div
					class="absolute -right-2 -top-1 h-4 w-4 rounded-full bg-[var(--primary-500)] text-xs text-white"
				>
					{links.length}
				</div>
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount side="left" align="start" sideOffset={6} preventScroll={false}>
			{#snippet child({ wrapperProps, props, open: contentOpen })}
				{#if contentOpen}
					<div {...wrapperProps}>
						<div {...props} class="menu" transition:fly={{ duration: 150, y: -10 }}>
							{#each links as link}
								<DropdownMenu.Item>
									{#snippet child({ props: itemProps })}
										<a
											{...itemProps}
											class="sidebar-item items-center"
											href={link.url}
											target="_blank"
										>
											{#if link.domain}
												<Favicon domain={link.domain} name={link.display} />
											{/if}
											{link.display}
										</a>
									{/snippet}
								</DropdownMenu.Item>
							{/each}
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

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
