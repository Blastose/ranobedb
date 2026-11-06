<script lang="ts">
	import TocNav from './TocNav.svelte';
	import type { TocGroup } from './types';

	interface Props {
		groups: TocGroup[];
		/** Id of the heading currently in view. */
		activeId?: string;
		element?: HTMLDetailsElement;
	}

	let { groups, activeId, element = $bindable() }: Props = $props();

	/** Name of the section in view, shown on the closed bar. */
	const activeLabel = $derived.by(() => {
		for (const group of groups) {
			if (group.id === activeId) return group.label;
			const entry = group.entries.find((item) => item.id === activeId);
			if (!entry) continue;
			if (entry.method) return `${entry.method} ${entry.label}`;
			return group.id ? `${group.label} · ${entry.label}` : entry.label;
		}
		return undefined;
	});

	const close = () => {
		if (element) element.open = false;
	};

	// Collapse the menu once a link is used, then move focus to the section it points at so it does
	// not stay on a link that is no longer visible.
	const select = (id: string) => {
		close();
		// The browser scrolls to the hash after this handler, so focus without scrolling again.
		requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }));
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !element?.open) return;
		close();
		element.querySelector('summary')?.focus();
	};

	const onPointerdown = (event: PointerEvent) => {
		if (element?.open && !element.contains(event.target as Node)) close();
	};
</script>

<svelte:window onkeydown={onKeydown} onpointerdown={onPointerdown} />

<details class="doc-jump lg:hidden" bind:this={element}>
	<summary>
		<span class="jump-current">
			{#if activeLabel}<span class="sr-only">Jump to section, now at </span>{/if}
			{activeLabel ?? 'Jump to section'}
		</span>
		<svg class="jump-chevron" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
			<path
				d="M5 8l5 5 5-5"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</summary>
	<div class="doc-jump-body">
		<TocNav {groups} compact {activeId} onselect={select} />
	</div>
</details>

<style>
	/* Pinned under the app header so the menu is reachable from anywhere on the page. */
	.doc-jump {
		position: sticky;
		top: var(--header-height);
		z-index: 30;
		margin-bottom: 1.25rem;
		padding: 0 0.75rem;
		background-color: var(--docs-surface);
		border: 1px solid var(--docs-border);
		border-radius: 0.5rem;
	}

	.doc-jump > summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		min-height: 2.75rem;
		cursor: pointer;
		font-weight: 600;
		list-style: none;
	}

	.doc-jump > summary::-webkit-details-marker {
		display: none;
	}

	.jump-current {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.jump-chevron {
		flex: none;
		transition: transform 150ms;
	}

	.doc-jump[open] .jump-chevron {
		transform: rotate(180deg);
	}

	/* Floats over the page so opening it mid-page does not push the content down. */
	.doc-jump-body {
		position: absolute;
		top: 100%;
		right: -1px;
		left: -1px;
		max-height: calc(100dvh - var(--header-height) - 5rem);
		overflow-y: auto;
		padding: 0 0.75rem 0.5rem;
		background-color: var(--docs-surface);
		border: 1px solid var(--docs-border);
		border-top: 0;
		border-radius: 0 0 0.5rem 0.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.jump-chevron {
			transition: none;
		}
	}
</style>
