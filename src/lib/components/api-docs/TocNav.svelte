<script lang="ts">
	import type { TocGroup } from './types';
	import MethodBadge from './MethodBadge.svelte';

	interface Props {
		groups: TocGroup[];
		/** Makes this a labelled nav landmark. Only one should exist per page. */
		label?: string;
		/** Section-level links only (no endpoints), in larger touch targets. */
		compact?: boolean;
		/** Id of the heading currently in view; marked with aria-current and kept visible. */
		activeId?: string;
		/** Called with the hash of a link that was activated. */
		onselect?: (hash: string) => void;
	}

	let { groups, label, compact = false, activeId, onselect }: Props = $props();

	let root = $state<HTMLElement>();

	/**
	 * The compact list has no endpoint rows, so while an endpoint is in view its group's section
	 * link (the closest entry above it) carries the current marker.
	 */
	const shownActiveId = $derived.by(() => {
		if (!compact || !activeId) return activeId;
		for (const group of groups) {
			const index = group.entries.findIndex((entry) => entry.id === activeId);
			if (index < 0) continue;
			for (let i = index; i >= 0; i--) {
				if (!group.entries[i].indent) return group.entries[i].id;
			}
			return group.id ?? activeId;
		}
		return activeId;
	});

	const current = (id: string) => (id === shownActiveId ? 'location' : undefined);

	$effect(() => {
		if (!activeId || !root) return;
		// 'auto' behaviour: no smooth scrolling, so reduced-motion needs no special case.
		root.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
	});
</script>

<svelte:element
	this={label ? 'nav' : 'div'}
	bind:this={root}
	class={['toc-nav', compact && 'compact']}
	aria-label={label}
>
	{#each groups as group (group.label)}
		{#if group.id}
			<a
				class="toc-group"
				href={`#${group.id}`}
				aria-current={current(group.id)}
				onclick={() => onselect?.(group.id!)}>{group.label}</a
			>
		{:else}
			<p class="toc-group">{group.label}</p>
		{/if}
		<ul>
			{#each group.entries as entry (entry.id)}
				{#if !compact || !entry.indent}
					<li class:indent={entry.indent}>
						<a
							href={`#${entry.id}`}
							aria-current={current(entry.id)}
							onclick={() => onselect?.(entry.id)}
						>
							{#if entry.method}
								<MethodBadge method={entry.method} />
							{/if}
							<span>{entry.label}</span>
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	{/each}
</svelte:element>

<style>
	.toc-nav {
		font-size: 0.875rem;
		line-height: 1.35;
	}

	.toc-group {
		display: block;
		margin: 1rem 0 0.375rem;
		padding: 0.1875rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--docs-muted);
		text-decoration: none;
	}

	a.toc-group:hover {
		background-color: var(--docs-surface);
	}

	.toc-group:first-child {
		margin-top: 0;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: block;
		margin: 0;
	}

	li a {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.1875rem 0.5rem;
		border-radius: 0.25rem;
		color: inherit;
		text-decoration: none;
	}

	li a:hover {
		background-color: var(--docs-surface);
	}

	li.indent a {
		padding-left: 1.25rem;
		font-size: 0.8125rem;
	}

	a[aria-current='location'] {
		background-color: var(--docs-surface-strong);
		color: var(--docs-text);
		font-weight: 600;
	}

	a:focus-visible {
		outline: 2px solid var(--docs-focus);
		outline-offset: 2px;
	}

	/* Mobile menu: columns of 44px hit targets instead of one long list. */
	.compact ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
		gap: 0 0.25rem;
	}

	.compact li a,
	.compact a.toc-group {
		min-height: 2.75rem;
		padding-block: 0.25rem;
	}

	.compact li a {
		padding-inline: 0.25rem;
		font-size: 0.8125rem;
	}

	.compact .toc-group {
		display: flex;
		align-items: center;
		margin-top: 0.25rem;
		margin-bottom: 0;
	}

	.compact p.toc-group {
		min-height: 0;
		margin-top: 0.375rem;
	}

	/* The panel is the same surface as the soft highlight, so the current item inverts instead. */
	.compact a[aria-current='location'] {
		background-color: var(--docs-text);
		color: var(--docs-surface);
		font-weight: 700;
	}

	.compact a.toc-group[aria-current='location'] {
		text-decoration: underline;
		text-underline-offset: 0.25rem;
	}
</style>
